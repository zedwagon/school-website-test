import { relations } from "drizzle-orm";
import { integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { accountingSchema, employees } from "./payroll";

// 1. Employee Loans
export const employeeLoans = accountingSchema.table("employee_loans", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	employeeId: integer("employee_id")
		.notNull()
		.references(() => employees.id),
	principalAmount: numeric("principal_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),
	monthlyDeduction: numeric("monthly_deduction", {
		precision: 10,
		scale: 2,
	}).notNull(),
	dateIssued: timestamp("date_issued", { mode: "string" }).notNull(),
	status: text("status", { enum: ["ACTIVE", "PAID", "DEFAULTED"] })
		.default("ACTIVE")
		.notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const employeeLoansRelations = relations(
	employeeLoans,
	({ one, many }) => ({
		employee: one(employees, {
			fields: [employeeLoans.employeeId],
			references: [employees.id],
		}),
		payments: many(employeeLoanPayments),
	}),
);

// 2. Employee Loan Payments
export const employeeLoanPayments = accountingSchema.table(
	"employee_loan_payments",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		loanId: integer("loan_id")
			.notNull()
			.references(() => employeeLoans.id),
		amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
		datePaid: timestamp("date_paid", { mode: "string" }).notNull(),
		reference: text("reference"), // E.g., "Paid via Sept 16-30 Payroll"
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
);

export const employeeLoanPaymentsRelations = relations(
	employeeLoanPayments,
	({ one }) => ({
		loan: one(employeeLoans, {
			fields: [employeeLoanPayments.loanId],
			references: [employeeLoans.id],
		}),
	}),
);
