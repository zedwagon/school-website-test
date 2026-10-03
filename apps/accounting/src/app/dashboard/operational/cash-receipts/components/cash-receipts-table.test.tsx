/**
 * @vitest-environment jsdom
 */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CashReceiptsTable } from "./cash-receipts-table";

// Mock the server actions
vi.mock("@school/api/accounting/operational/actions", () => ({
	saveDailyCashReceipt: vi.fn(),
}));

describe("CashReceiptsTable", () => {
	const mockRecords = [
		{
			id: 1,
			date: "2026-05-15",
			receipts: "5000.00",
			deposit: "4000.00",
		}
	];

	it("should render grid for all days in a month and map existing records", () => {
		const { getByDisplayValue, getAllByRole } = render(
			<CashReceiptsTable 
				year={2026} 
				month={5} 
				records={mockRecords} 
			/>
		);

		// May has 31 days. So we should see 31 rows (plus the header row)
		const rows = getAllByRole("row");
		expect(rows.length).toBe(33); // 31 days + 1 header + 1 footer

		// Check if the mock record was pre-filled in the inputs
		// 5000.00 and 4000.00 should be the values of the inputs for May 15
		expect(getByDisplayValue("5000.00")).toBeDefined();
		expect(getByDisplayValue("4000.00")).toBeDefined();
	});
});
