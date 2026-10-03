import { z } from "zod";

const decimalAmountPattern = /^\d+(?:\.\d{1,2})?$/;
const signedDecimalAmountPattern = /^-?\d+(?:\.\d{1,2})?$/;

const normalizeDecimalString = (value: string) => value.trim() || "0";

export const positiveAmountSchema = z
	.string()
	.transform(normalizeDecimalString)
	.refine(
		(value) => decimalAmountPattern.test(value) && Number.isFinite(Number(value)),
		{ message: "Amount must be a valid positive number" },
	);

const balanceAmountSchema = z
	.string()
	.transform(normalizeDecimalString)
	.refine(
		(value) => signedDecimalAmountPattern.test(value) && Number.isFinite(Number(value)),
		{ message: "Balance must be a valid number" },
	);

export const createEmployeeLoanSchema = z.object({
	employeeId: z.number().positive(),
	principalAmount: positiveAmountSchema,
	monthlyDeduction: positiveAmountSchema,
	dateIssued: z.string().min(1, "Date issued is required"),
});

export const recordLoanPaymentSchema = z.object({
	loanId: z.number().positive(),
	amount: positiveAmountSchema,
	datePaid: z.string().min(1, "Date paid is required"),
	reference: z.string().optional(),
});

export const saveDailyCashReceiptSchema = z.object({
	dateString: z.string().min(1, "Date is required"),
	receipts: positiveAmountSchema,
	deposit: positiveAmountSchema,
});

export const saveLedgerEntrySchema = z
	.object({
		dateStr: z.string().min(1, "Date is required"),
		particulars: z.string().min(1, "Particulars are required"),
		debit: positiveAmountSchema.optional(),
		credit: positiveAmountSchema.optional(),
	})
	.refine(
		({ debit, credit }) =>
			(Number(debit || "0") > 0) !== (Number(credit || "0") > 0),
		{ message: "Enter a positive debit or credit amount, but not both" },
	);

export const saveOpeningBalanceOverrideSchema = z.object({
	year: z.number().positive(),
	month: z.number().min(1).max(12),
	balance: balanceAmountSchema,
});

export const payrollUpdateSchema = z
	.object({
		baseSalary: positiveAmountSchema.optional(),
		halfSalary: positiveAmountSchema.optional(),
		transpoAllowance: positiveAmountSchema.optional(),
		positionPay: positiveAmountSchema.optional(),
		advisoryPay: positiveAmountSchema.optional(),
		holidayPay: positiveAmountSchema.optional(),
		subjectOverload: positiveAmountSchema.optional(),
		additionalPay: positiveAmountSchema.optional(),
		moderatorPay: positiveAmountSchema.optional(),
		dailySalary: positiveAmountSchema.optional(),
		subjectHoursPerDay: positiveAmountSchema.optional(),
		numberOfClasses: z.number().int().nonnegative().optional(),
		sssEe: positiveAmountSchema.optional(),
		sssEr: positiveAmountSchema.optional(),
		philhealthEe: positiveAmountSchema.optional(),
		philhealthEr: positiveAmountSchema.optional(),
		pagIbigEe: positiveAmountSchema.optional(),
		pagIbigEr: positiveAmountSchema.optional(),
		loanDeduction: positiveAmountSchema.optional(),
	})
	.strict();

export const createPayrollPeriodSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	startDate: z.iso.date({ error: "Start date must be a valid calendar date" }),
	endDate: z.iso.date({ error: "End date must be a valid calendar date" }),
}).refine(({ startDate, endDate }) => startDate <= endDate, {
	message: "End date must be on or after the start date", path: ["endDate"],
});

export const employeeContractSchema = z.object({
	baseSalary: positiveAmountSchema.optional(),
	dailySalary: positiveAmountSchema.optional(),
	subjectHoursPerDay: positiveAmountSchema.optional(),
	transpoAllowance: positiveAmountSchema.optional(),
	positionPay: positiveAmountSchema.optional(),
	advisoryPay: positiveAmountSchema.optional(),
	holidayPay: positiveAmountSchema.optional(),
	additionalPay: positiveAmountSchema.optional(),
	moderatorPay: positiveAmountSchema.optional(),
	sssEe: positiveAmountSchema.optional(),
	sssEr: positiveAmountSchema.optional(),
	philhealthEe: positiveAmountSchema.optional(),
	philhealthEr: positiveAmountSchema.optional(),
	pagIbigEe: positiveAmountSchema.optional(),
	pagIbigEr: positiveAmountSchema.optional(),
});
