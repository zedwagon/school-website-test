"use server";
import { validateActionSession } from "../../auth/guard";
import { db } from "@school/db";
import { employeeLoans, employeeLoanPayments } from "@school/db/schema";
import { toCents } from "../money";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
	createEmployeeLoanSchema,
	recordLoanPaymentSchema,
} from "../validations";

export async function createEmployeeLoan(data: {
	employeeId: number;
	principalAmount: string;
	monthlyDeduction: string;
	dateIssued: string;
}) {
	await validateActionSession(["admin", "staff"], "accounting");
	const parsed = createEmployeeLoanSchema.safeParse(data);
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message || "Invalid loan data");
	}

	const result = await db.insert(employeeLoans).values(parsed.data).returning();
	revalidatePath("/dashboard/operational/loans");
	return result[0];
}

export async function recordLoanPayment(data: {
	loanId: number;
	amount: string;
	datePaid: string;
	reference?: string;
}) {
	await validateActionSession(["admin", "staff"], "accounting");
	const parsed = recordLoanPaymentSchema.safeParse(data);
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message || "Invalid payment data");
	}

	const payment = await db.transaction(async (tx) => {
		// Serialize balance validation and insertion for this loan. Read payments
		// after obtaining the lock so a waiting payment sees the committed balance.
		const [loan] = await tx
			.select()
			.from(employeeLoans)
			.where(eq(employeeLoans.id, parsed.data.loanId))
			.for("update");
		if (!loan) throw new Error("Loan not found");
		if (loan.status !== "ACTIVE") {
			throw new Error("Payments can only be recorded against active loans");
		}

		const payments = await tx
			.select()
			.from(employeeLoanPayments)
			.where(eq(employeeLoanPayments.loanId, loan.id));
		const totalPaid = payments.reduce(
			(acc, payment) => acc + toCents(payment.amount),
			0,
		);
		const remainingBalance = toCents(loan.principalAmount) - totalPaid;
		if (toCents(parsed.data.amount) > remainingBalance) {
			throw new Error("Payment exceeds the remaining loan balance");
		}

		const payment = await tx
			.insert(employeeLoanPayments)
			.values(parsed.data)
			.returning();

		if (
			totalPaid + toCents(parsed.data.amount) >=
			toCents(loan.principalAmount)
		) {
			await tx
				.update(employeeLoans)
				.set({ status: "PAID" })
				.where(eq(employeeLoans.id, loan.id));
		}
		return payment[0];
	});

	revalidatePath("/dashboard/operational/loans");
	return payment;
}

export async function updateLoanStatus(
	loanId: number,
	status: "ACTIVE" | "PAID" | "DEFAULTED",
) {
	await validateActionSession(["admin", "staff"], "accounting");
	const result = await db
		.update(employeeLoans)
		.set({ status })
		.where(eq(employeeLoans.id, loanId))
		.returning();
	revalidatePath("/dashboard/operational/loans");
	return result[0];
}
