import { relations } from "drizzle-orm";
import { date, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { accountingSchema } from "./payroll";

// 1. Daily Cash Receipts (Sub-Ledger)
// Tracks daily till collections vs actual bank deposits
export const dailyCashReceipts = accountingSchema.table("daily_cash_receipts", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	date: date("date").notNull().unique(),
	receipts: numeric("receipts", { precision: 12, scale: 2 })
		.default("0")
		.notNull(),
	deposit: numeric("deposit", { precision: 12, scale: 2 })
		.default("0")
		.notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

// 2. Operational Cash Flow (Master Ledger)
// Tracks all money in (debit) and money out (credit)
export const operationalCashFlow = accountingSchema.table(
	"operational_cash_flow",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		date: date("date").notNull(),
		particulars: text("particulars").notNull(),
		debit: numeric("debit", { precision: 12, scale: 2 }).default("0").notNull(), // Money In
		credit: numeric("credit", { precision: 12, scale: 2 })
			.default("0")
			.notNull(), // Money Out
		receiptId: integer("receipt_id")
			.unique()
			.references(() => dailyCashReceipts.id, {
				onDelete: "set null",
			}), // Link to auto-generated row
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
);

// 3. Operational Opening Balances (Overrides)
// Tracks manual overrides to the mathematical rolling balance
export const operationalOpeningBalances = accountingSchema.table(
	"operational_opening_balances",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		monthYear: text("month_year").notNull().unique(), // e.g. "2026-07"
		balance: numeric("balance", { precision: 12, scale: 2 })
			.default("0")
			.notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
);

// Relations
export const dailyCashReceiptsRelations = relations(
	dailyCashReceipts,
	({ one }) => ({
		ledgerEntry: one(operationalCashFlow, {
			fields: [dailyCashReceipts.id],
			references: [operationalCashFlow.receiptId],
		}),
	}),
);

export const operationalCashFlowRelations = relations(
	operationalCashFlow,
	({ one }) => ({
		receipt: one(dailyCashReceipts, {
			fields: [operationalCashFlow.receiptId],
			references: [dailyCashReceipts.id],
		}),
	}),
);
