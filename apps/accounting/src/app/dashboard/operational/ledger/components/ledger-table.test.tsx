/**
 * @vitest-environment jsdom
 */

import { render, } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LedgerTable } from "./ledger-table";

// Mock the server actions
vi.mock("@school/api/accounting/operational/actions", () => ({
	saveOpeningBalanceOverride: vi.fn(),
	saveLedgerEntry: vi.fn(),
}));

describe("LedgerTable", () => {
	const mockEntries = [
		{
			id: 1,
			date: "2026-05-15",
			particulars: "Meralco Bill",
			debit: "0.00",
			credit: "1500.00",
			receiptId: null,
		},
		{
			id: 2,
			date: "2026-05-16",
			particulars: "Daily Sales Deposit",
			debit: "4000.00",
			credit: "0.00",
			receiptId: 10,
		},
	];

	it("should render without crashing and calculate running balance correctly", () => {
		const { getByText } = render(
			<LedgerTable 
				year={2026} 
				month={5} 
				entries={mockEntries} 
				openingBalance={10000} 
				isOverride={false} 
			/>
		);

		// Check opening balance row is rendered properly
		expect(getByText("01/05/2026")).toBeDefined();
		expect(getByText("₱ 10,000.00")).toBeDefined();

		// Check ledger entries are rendered
		expect(getByText("Meralco Bill")).toBeDefined();
		expect(getByText("1,500.00")).toBeDefined();

		// Check auto-generated badge for the deposit
		expect(getByText("Auto")).toBeDefined();

		// Check the running balances
		// 1. After 1500 credit: 10,000 - 1500 = 8,500
		expect(getByText("₱ 8,500.00")).toBeDefined();

		// 2. After 4000 debit: 8,500 + 4000 = 12,500
		expect(getByText("₱ 12,500.00")).toBeDefined();
	});

	it("should show manual badge if it is an override", () => {
		const { getByText } = render(
			<LedgerTable 
				year={2026} 
				month={5} 
				entries={[]} 
				openingBalance={10000} 
				isOverride={true} 
			/>
		);

		expect(getByText("Manual")).toBeDefined();
	});
});
