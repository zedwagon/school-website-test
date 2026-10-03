"use server";
import { validateActionSession } from "../../auth/guard";
import { db } from "@school/db";
import {
	employeeContracts,
	employees,
	employeeLoans,
	payrollPeriods,
	payrolls,
} from "@school/db/schema";
import { fromCents, toCents } from "../money";
import { eq, inArray, isNull } from "drizzle-orm";

import { revalidatePath } from "next/cache";
import {
	createPayrollPeriodSchema,
	employeeContractSchema,
	payrollUpdateSchema,
} from "../validations";

export async function createPayrollPeriod(data: {
	name: string;
	startDate: string;
	endDate: string;
}) {
	await validateActionSession(["admin", "staff"], "accounting");
	const parsed = createPayrollPeriodSchema.safeParse(data);
	if (!parsed.success) {
		throw new Error(
			parsed.error.issues[0]?.message || "Invalid payroll period data",
		);
	}

	// Name and date-range constraints arbitrate concurrent creation atomically.
	const [result] = await db.insert(payrollPeriods).values(parsed.data)
		.onConflictDoNothing().returning();
	if (!result) {
		throw new Error(`A payroll period with this name or for ${parsed.data.startDate} to ${parsed.data.endDate} already exists.`);
	}

	revalidatePath("/dashboard/payroll");
	return result;
}

export async function generatePayrollsForPeriod(periodId: number) {
	await validateActionSession(["admin", "staff"], "accounting");
	return await db.transaction(async (tx) => {
		// Regeneration, edits and period status changes serialize on this row.
		const period = await tx
			.select()
			.from(payrollPeriods)
			.where(eq(payrollPeriods.id, periodId))
			.for("update");
		if (period[0]?.status !== "DRAFT") {
			throw new Error("Cannot regenerate payrolls for a finalized period.");
		}

		const activeEmployees = await tx
			.select({ id: employees.id })
			.from(employees)
			.where(isNull(employees.archivedAt));
		const activeEmployeeIds = activeEmployees.map((e) => e.id);

		// Regeneration is valid even when there are no active employees. Remove any
		// previously generated draft records so the selected period accurately reflects
		// the current workforce, then return an empty payroll.
		if (activeEmployeeIds.length === 0) {
			await tx.delete(payrolls).where(eq(payrolls.periodId, periodId));
			return [];
		}

		// Fetch contracts only for active employees, alongside their type
		const contractsQuery = await tx
			.select({
				contract: employeeContracts,
				type: employees.type,
			})
			.from(employeeContracts)
			.innerJoin(employees, eq(employeeContracts.employeeId, employees.id))
			.where(inArray(employeeContracts.employeeId, activeEmployeeIds));

		// Clear existing un-finalized payrolls for this period before returning an
		// empty result, preventing stale records after contracts are removed.
		if (contractsQuery.length === 0) {
			await tx.delete(payrolls).where(eq(payrolls.periodId, periodId));
			return [];
		}

		// Calculate suggested loan deductions from ACTIVE loans
		const activeLoans = await tx.query.employeeLoans.findMany({
			where: eq(employeeLoans.status, "ACTIVE"),
			with: {
				payments: true,
			},
		});

		const loanDeductionMap = new Map<number, string>();
		for (const loan of activeLoans) {
			const totalPaid = loan.payments.reduce(
				(sum, p) => sum + toCents(p.amount),
				0,
			);
			const remainingBalance = toCents(loan.principalAmount) - totalPaid;

			if (remainingBalance > 0) {
				const deduction = toCents(loan.monthlyDeduction);
				// Take the smaller of the monthly deduction or the remaining balance
				const actualDeduction = Math.min(deduction, remainingBalance);

				const existingDeduction = toCents(
					loanDeductionMap.get(loan.employeeId) || "0",
				);
				loanDeductionMap.set(
					loan.employeeId,
					fromCents(existingDeduction + actualDeduction),
				);
			}
		}

		// Clear existing un-finalized payrolls for this period to prevent duplicates
		await tx.delete(payrolls).where(eq(payrolls.periodId, periodId));

		const payrollInserts = contractsQuery.map((row) => {
			const c = row.contract;
			const type = row.type;

			// Fixed base values
			const base = toCents(c.baseSalary);
			const half = Math.round(base / 2); // Typically 15 days cut-off
			const transpo = toCents(c.transpoAllowance);
			const posPay = toCents(c.positionPay);
			const advPay = toCents(c.advisoryPay);
			const holiday = toCents(c.holidayPay);
			const additional = toCents(c.additionalPay);
			const modPay = toCents(c.moderatorPay);

			// Part-time specific
			const daily = toCents(c.dailySalary);
			const subjHours = parseFloat(c.subjectHoursPerDay);

			let totalEarn = 0;

			if (type === "administrators") {
				totalEarn = half;
			} else if (type === "teaching") {
				totalEarn = half + posPay + advPay;
			} else if (type === "non_teaching") {
				totalEarn = half + additional + transpo + holiday + modPay;
			} else if (type === "part_time_teaching") {
				// Generated with 0 classes by default, to be updated in DRAFT mode
				totalEarn = 0;
			}

			// Deductions calculation
			const sEe = toCents(c.sssEe);
			const pEe = toCents(c.philhealthEe);
			const iEe = toCents(c.pagIbigEe);
			const loanDed = toCents(loanDeductionMap.get(c.employeeId) || "0");

			// Part-time has NO standard deductions, but we allow loan deductions if they exist
			const totalDed =
				(type === "part_time_teaching" ? 0 : sEe + pEe + iEe) + loanDed;
			const net = totalEarn - totalDed;

			return {
				periodId,
				employeeId: c.employeeId,
				employeeType: type,
				baseSalary: fromCents(base),
				halfSalary: fromCents(half),
				transpoAllowance: fromCents(transpo),
				positionPay: fromCents(posPay),
				advisoryPay: fromCents(advPay),
				holidayPay: fromCents(holiday),
				subjectOverload: "0.00",
				additionalPay: fromCents(additional),
				moderatorPay: fromCents(modPay),
				dailySalary: fromCents(daily),
				subjectHoursPerDay: subjHours.toFixed(2),
				numberOfClasses: 0,
				totalEarnings: fromCents(totalEarn),
				sssEe: type === "part_time_teaching" ? "0.00" : c.sssEe,
				sssEr: type === "part_time_teaching" ? "0.00" : c.sssEr,
				philhealthEe: type === "part_time_teaching" ? "0.00" : c.philhealthEe,
				philhealthEr: type === "part_time_teaching" ? "0.00" : c.philhealthEr,
				pagIbigEe: type === "part_time_teaching" ? "0.00" : c.pagIbigEe,
				pagIbigEr: type === "part_time_teaching" ? "0.00" : c.pagIbigEr,
				loanDeduction: loanDeductionMap.get(c.employeeId) || "0.00",
				totalDeductions: fromCents(totalDed),
				netPay: fromCents(net),
			};
		});

		return await tx.insert(payrolls).values(payrollInserts).returning();
	});
}

export async function updatePayroll(id: number, data: Record<string, unknown>) {
	await validateActionSession(["admin", "staff"], "accounting");
	const parsed = payrollUpdateSchema.safeParse(data);
	if (!parsed.success) {
		throw new Error(
			parsed.error.issues[0]?.message || "Invalid payroll update",
		);
	}

	const initial = await db.select().from(payrolls).where(eq(payrolls.id, id));
	if (!initial[0]) throw new Error("Payroll not found");

	return await db.transaction(async (tx) => {
		// Lock the period first (same order as regeneration), then reread the
		// payroll: it may have been replaced while this request waited for the lock.
		const period = await tx
			.select({ status: payrollPeriods.status })
			.from(payrollPeriods)
			.where(eq(payrollPeriods.id, initial[0].periodId))
			.for("update");
		if (period[0]?.status !== "DRAFT") {
			throw new Error(
				"Payroll records can only be edited while their period is a draft.",
			);
		}
		const current = await tx.select().from(payrolls).where(eq(payrolls.id, id));
		if (!current[0]) throw new Error("Payroll not found");

		const update = parsed.data as Record<string, string | number>;
		const merged = { ...current[0], ...update } as Record<
			string,
			string | number
		>;
		const amount = (value: string | number | undefined) => toCents(value || "0");
		let totalEarnings = 0;

		if (merged.employeeType === "administrators") {
			totalEarnings = amount(merged.halfSalary);
		} else if (merged.employeeType === "teaching") {
			totalEarnings =
				amount(merged.halfSalary) +
				amount(merged.subjectOverload) +
				amount(merged.positionPay) +
				amount(merged.advisoryPay);
		} else if (merged.employeeType === "non_teaching") {
			totalEarnings =
				amount(merged.halfSalary) +
				amount(merged.additionalPay) +
				amount(merged.subjectOverload) +
				amount(merged.transpoAllowance) +
				amount(merged.holidayPay) +
				amount(merged.moderatorPay);
		} else if (merged.employeeType === "part_time_teaching") {
			totalEarnings =
				Number(merged.numberOfClasses || 0) * amount(merged.dailySalary);
		}

		const totalDeductions =
			(merged.employeeType === "part_time_teaching"
				? 0
				: amount(merged.sssEe) +
					amount(merged.philhealthEe) +
					amount(merged.pagIbigEe)) + amount(merged.loanDeduction);

		return await tx
			.update(payrolls)
			.set({
				...update,
				totalEarnings: fromCents(totalEarnings),
				totalDeductions: fromCents(totalDeductions),
				netPay: fromCents(totalEarnings - totalDeductions),
			})
			.where(eq(payrolls.id, id))
			.returning();
	});
}

export async function updatePayrollPeriod(
	id: number,
	data: { status?: "DRAFT" | "FINALIZED" | "PAID"; name?: string },
) {
	await validateActionSession(["admin", "staff"], "accounting");
	const result = await db
		.update(payrollPeriods)
		.set(data)
		.where(eq(payrollPeriods.id, id))
		.returning();
	return result[0];
}

export async function saveEmployeeContract(
	employeeId: number,
	data: Partial<typeof employeeContracts.$inferInsert>,
) {
	await validateActionSession(["admin", "staff"], "accounting");
	// Filter out non-monetary fields before validating the contract data.
	const parsed = employeeContractSchema.safeParse(data);
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message || "Invalid contract data");
	}

	// Fetch employee to determine type and strictly zero out irrelevant fields
	const employeeRecord = await db
		.select({ type: employees.type })
		.from(employees)
		.where(eq(employees.id, employeeId));
	const type = employeeRecord[0]?.type;

	const sanitizeStr = (val: any) =>
		val === "" ||
		val === null ||
		val === undefined ||
		Number.isNaN(parseFloat(val))
			? "0"
			: String(val);
	const sanitizedData: any = {};
	for (const [key, value] of Object.entries(parsed.data)) {
		sanitizedData[key] = typeof value === "string" ? sanitizeStr(value) : value;
	}

	// Zero out fields based on employee type
	if (type === "part_time_teaching") {
		sanitizedData.baseSalary = "0";
		sanitizedData.transpoAllowance = "0";
		sanitizedData.positionPay = "0";
		sanitizedData.advisoryPay = "0";
		sanitizedData.holidayPay = "0";
		sanitizedData.additionalPay = "0";
		sanitizedData.moderatorPay = "0";
		sanitizedData.sssEe = "0";
		sanitizedData.sssEr = "0";
		sanitizedData.philhealthEe = "0";
		sanitizedData.philhealthEr = "0";
		sanitizedData.pagIbigEe = "0";
		sanitizedData.pagIbigEr = "0";
		sanitizedData.loanDeduction = "0";
	} else {
		sanitizedData.dailySalary = "0";
		sanitizedData.subjectHoursPerDay = "0";

		if (type === "administrators") {
			sanitizedData.transpoAllowance = "0";
			sanitizedData.positionPay = "0";
			sanitizedData.advisoryPay = "0";
			sanitizedData.holidayPay = "0";
			sanitizedData.additionalPay = "0";
			sanitizedData.moderatorPay = "0";
		} else if (type === "teaching") {
			sanitizedData.additionalPay = "0";
			sanitizedData.transpoAllowance = "0";
			sanitizedData.holidayPay = "0";
			sanitizedData.moderatorPay = "0";
		} else if (type === "non_teaching") {
			sanitizedData.positionPay = "0";
			sanitizedData.advisoryPay = "0";
		}
	}

	const [result] = await db.insert(employeeContracts)
		.values({ employeeId, ...sanitizedData })
		.onConflictDoUpdate({
			target: employeeContracts.employeeId,
			set: sanitizedData,
		})
		.returning();
	return result;
}

export async function createEmployee(data: {
	firstName: string;
	lastName: string;
	middleName?: string;
	type: "part_time_teaching" | "non_teaching" | "teaching" | "administrators";
}) {
	await validateActionSession(["admin", "staff"], "accounting");
	const result = await db.insert(employees).values(data).returning();
	return result[0];
}

export async function updateEmployee(
	id: number,
	data: Partial<typeof employees.$inferInsert>,
) {
	await validateActionSession(["admin", "staff"], "accounting");
	const result = await db
		.update(employees)
		.set(data)
		.where(eq(employees.id, id))
		.returning();
	return result[0];
}

export async function updatePayrollRecord(
	id: number,
	data: Record<string, unknown>,
) {
	return updatePayroll(id, data);
}

export async function updatePayrollPeriodStatus(
	periodId: number,
	status: "DRAFT" | "FINALIZED" | "PAID",
) {
	return updatePayrollPeriod(periodId, { status });
}

export async function toggleEmployeeStatus(
	employeeId: number,
	isActive: boolean,
) {
	await validateActionSession(["admin", "staff"], "accounting");
	const archivedAt = isActive ? null : new Date().toISOString();
	const result = await db
		.update(employees)
		.set({ archivedAt })
		.where(eq(employees.id, employeeId))
		.returning();
	return result[0];
}
