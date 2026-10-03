import { db } from "@school/db";
import { dailyCashReceipts, operationalCashFlow, operationalOpeningBalances } from "@school/db/schema";
import { eq, and, gte, lte, lt, asc, desc, sql } from "drizzle-orm";

// === Cash Receipts Queries ===

export async function getCashReceiptsForMonth(year: number, month: number) {
	// JS Date uses 0-indexed months, but standard human is 1-12
	// Build a strict string format: YYYY-MM-DD
	const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
	
	// Get the last day of the month
	const lastDay = new Date(year, month, 0).getDate();
	const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

	const records = await db
		.select()
		.from(dailyCashReceipts)
		.where(
			and(
				gte(dailyCashReceipts.date, startDate),
				lte(dailyCashReceipts.date, endDate)
			)
		)
		.orderBy(asc(dailyCashReceipts.date));

	return records;
}

export async function getMonthlyCashReceiptsSummary(startYear: number, startMonth: number, endYear: number, endMonth: number) {
	const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
	const lastDay = new Date(endYear, endMonth, 0).getDate();
	const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

	// We group by month (YYYY-MM) and sum up receipts and deposits
	const summary = await db
		.select({
			monthYear: sql<string>`to_char(${dailyCashReceipts.date}::date, 'YYYY-MM')`,
			totalReceipts: sql<string>`sum(${dailyCashReceipts.receipts})`,
			totalDeposit: sql<string>`sum(${dailyCashReceipts.deposit})`,
		})
		.from(dailyCashReceipts)
		.where(
			and(
				gte(dailyCashReceipts.date, startDate),
				lte(dailyCashReceipts.date, endDate)
			)
		)
		.groupBy(sql`to_char(${dailyCashReceipts.date}::date, 'YYYY-MM')`)
		.orderBy(sql`to_char(${dailyCashReceipts.date}::date, 'YYYY-MM')`);

	return summary;
}

// === Operational Ledger Queries ===

export async function getLedgerEntriesForMonth(year: number, month: number) {
	const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
	const lastDay = new Date(year, month, 0).getDate();
	const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

	const entries = await db
		.select()
		.from(operationalCashFlow)
		.where(
			and(
				gte(operationalCashFlow.date, startDate),
				lte(operationalCashFlow.date, endDate)
			)
		)
		.orderBy(asc(operationalCashFlow.date), asc(operationalCashFlow.createdAt));

	return entries;
}

export async function getLedgerEntriesForRange(startYear: number, startMonth: number, endYear: number, endMonth: number) {
	const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
	const lastDay = new Date(endYear, endMonth, 0).getDate();
	const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

	const entries = await db
		.select()
		.from(operationalCashFlow)
		.where(
			and(
				gte(operationalCashFlow.date, startDate),
				lte(operationalCashFlow.date, endDate)
			)
		)
		.orderBy(asc(operationalCashFlow.date), asc(operationalCashFlow.createdAt));

	return entries;
}

export async function getOpeningBalanceOverride(year: number, month: number) {
	const targetMonthYear = `${year}-${String(month).padStart(2, '0')}`;
	const override = await db
		.select()
		.from(operationalOpeningBalances)
		.where(eq(operationalOpeningBalances.monthYear, targetMonthYear))
		.limit(1);

	return override.length > 0 ? override[0] : null;
}

export async function getOpeningBalanceForMonth(year: number, month: number) {
	const targetMonthYear = `${year}-${String(month).padStart(2, '0')}`;
	const targetStartDate = `${targetMonthYear}-01`;

	// 1. Find the most recent override <= targetMonthYear
	const overrides = await db
		.select()
		.from(operationalOpeningBalances)
		.where(lte(operationalOpeningBalances.monthYear, targetMonthYear))
		.orderBy(desc(operationalOpeningBalances.monthYear))
		.limit(1);

	let baseBalance = 0;
	let baseStartDate = "1970-01-01"; // Beginning of time if no override

	if (overrides.length > 0) {
		const latestOverride = overrides[0];
		
		// If the override IS for the target month, we don't need to calculate anything!
		if (latestOverride.monthYear === targetMonthYear) {
			return {
				balance: parseFloat(latestOverride.balance),
				isOverride: true
			};
		}
		
		baseBalance = parseFloat(latestOverride.balance);
		baseStartDate = `${latestOverride.monthYear}-01`;
	}

	// 2. Sum up all ledger activity between baseStartDate and the targetStartDate
	const activity = await db
		.select({
			totalDebit: sql<string>`sum(${operationalCashFlow.debit})`,
			totalCredit: sql<string>`sum(${operationalCashFlow.credit})`,
		})
		.from(operationalCashFlow)
		.where(
			and(
				gte(operationalCashFlow.date, baseStartDate),
				lt(operationalCashFlow.date, targetStartDate)
			)
		);

	const totalDebit = parseFloat(activity[0]?.totalDebit || "0");
	const totalCredit = parseFloat(activity[0]?.totalCredit || "0");

	return {
		balance: baseBalance + totalDebit - totalCredit,
		isOverride: false
	};
}

export async function getOpeningBalanceOverridesForRange(startMonth: string, endMonth: string) {
    return db.select().from(operationalOpeningBalances).where(and(
        gte(operationalOpeningBalances.monthYear, startMonth),
        lte(operationalOpeningBalances.monthYear, endMonth),
    )).orderBy(asc(operationalOpeningBalances.monthYear));
}
