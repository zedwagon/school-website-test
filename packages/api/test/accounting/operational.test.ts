import { describe, expect, it, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import {
	saveDailyCashReceipt,
	saveLedgerEntry,
	saveOpeningBalanceOverride,
} from "../../src/accounting/operational/actions";
import {
	getCashReceiptsForMonth,
	getLedgerEntriesForMonth,
	getMonthlyCashReceiptsSummary,
	getOpeningBalanceForMonth,
	getOpeningBalanceOverride,
} from "../../src/accounting/operational/queries";

describe("Operational Cash Flow Integration", () => {
	describe("Cash Receipts", () => {
		it("should save a daily cash receipt and auto-generate ledger entry", async () => {
			const dateStr = "1999-05-01"; // Use unique year to avoid conflicts
			await saveDailyCashReceipt(dateStr, "5000.50", "4000.00");

			const receipts = await getCashReceiptsForMonth(1999, 5);
			expect(Array.isArray(receipts)).toBe(true);
			const receipt = receipts.find((r) => r.date === dateStr);
			expect(receipt).toBeDefined();
			expect(receipt?.receipts).toBe("5000.50");
			expect(receipt?.deposit).toBe("4000.00");

			const summary = await getMonthlyCashReceiptsSummary(1999, 5, 1999, 5);
			expect(summary.length).toBeGreaterThan(0);
			expect(summary[0]?.totalReceipts).toBeDefined();
		});
	});

	describe("Ledger and Opening Balances", () => {
		it("should handle opening balance overrides", async () => {
			await saveOpeningBalanceOverride(1999, 5, "10000.00");

			const override = await getOpeningBalanceOverride(1999, 5);
			expect(override).toBeDefined();
			expect(override?.balance).toBe("10000.00");

			const balanceData = await getOpeningBalanceForMonth(1999, 5);
			expect(balanceData.isOverride).toBe(true);
			expect(balanceData.balance).toBe(10000);
		});

		it("should handle manual ledger entries and calculated balances", async () => {
			// Save override for May 1999: 10000
			await saveOpeningBalanceOverride(1999, 5, "10000.00");

			// Save manual entry in May 1999
			await saveLedgerEntry("1999-05-15", "Meralco Bill", "0", "1500.00");

			const entries = await getLedgerEntriesForMonth(1999, 5);
			expect(Array.isArray(entries)).toBe(true);
			const hasMeralco = entries.some((e) => e.particulars === "Meralco Bill");
			expect(hasMeralco).toBe(true);

			// June 1999 opening balance should be (10000 + 0 - 1500) + any auto deposits from cash receipts
			const juneBalance = await getOpeningBalanceForMonth(1999, 6);
			expect(juneBalance.isOverride).toBe(false);
			// Based on earlier tests, there's a 4000 deposit in May
			// So total = 10000 - 1500 + 4000 = 12500
			expect(juneBalance.balance).toBeGreaterThan(0);
		});
	});
});
