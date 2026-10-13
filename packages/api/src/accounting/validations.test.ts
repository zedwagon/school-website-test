import { describe, expect, it } from "vitest";
import {
	createPayrollPeriodSchema,
	positiveAmountSchema,
	payrollUpdateSchema,
	saveLedgerEntrySchema,
	saveOpeningBalanceOverrideSchema,
} from "./validations";

describe("accounting amount validation", () => {
	it("normalizes a cleared amount to zero", () => {
		expect(positiveAmountSchema.parse("")).toBe("0");
	});

	it("rejects values that are not complete decimal amounts", () => {
		expect(positiveAmountSchema.safeParse("12abc").success).toBe(false);
		expect(positiveAmountSchema.safeParse("1e2junk").success).toBe(false);
	});

	it("normalizes a cleared opening balance to zero", () => {
		expect(
			saveOpeningBalanceOverrideSchema.parse({
				year: 2026,
				month: 9,
				balance: "",
			}).balance,
		).toBe("0");
	});

	it("rejects payroll updates that attempt to change immutable fields", () => {
		expect(
			payrollUpdateSchema.safeParse({ periodId: 42 }).success,
		).toBe(false);
	});

	it("requires exactly one positive side for a manual ledger entry", () => {
		expect(
			saveLedgerEntrySchema.safeParse({
				dateStr: "2026-10-02",
				particulars: "Utilities",
				debit: "100",
				credit: "100",
			}).success,
		).toBe(false);
		expect(
			saveLedgerEntrySchema.safeParse({
				dateStr: "2026-10-02",
				particulars: "Utilities",
				credit: "100",
			}).success,
		).toBe(true);
	});
});

it("rejects sub-cent amounts instead of comparing one value and storing another", () => {
 expect(positiveAmountSchema.safeParse("0.001").success).toBe(false);
 expect(payrollUpdateSchema.safeParse({ halfSalary: "0.005" }).success).toBe(false);
});

it.each([
 ["2026-10-15", "2026-10-01"], ["2026-02-30", "2026-03-01"],
 ["2026-10-01", "invalid"], ["2026-1-1", "2026-01-15"],
])("rejects invalid payroll dates %s through %s", (startDate, endDate) => {
 expect(createPayrollPeriodSchema.safeParse({ name: "Period", startDate, endDate }).success).toBe(false);
});
it("allows a same-day period and valid leap-day dates", () => {
 expect(createPayrollPeriodSchema.safeParse({ name: "Period", startDate: "2028-02-29", endDate: "2028-02-29" }).success).toBe(true);
});
