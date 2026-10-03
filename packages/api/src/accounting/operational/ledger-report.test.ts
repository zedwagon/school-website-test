import { describe, expect, it } from "vitest";
import { buildLedgerReportRows } from "./ledger-report";

describe("ledger report opening overrides", () => {
    const entry = (id: number, date: string, debit: string, credit = "0.00") => ({id, date, particulars: "QA", debit, credit});
    it("resets at a later override before same-day activity and retains exact cents", () => {
        const rows = buildLedgerReportRows([
            entry(1, "2026-09-01", "100.00"), entry(2, "2026-10-01", "1000.25"),
            entry(3, "2026-10-02", "550.15"), entry(4, "2026-10-03", "0.00", "200.05"),
        ], [{monthYear: "2026-10", balance: "5000.50"}], "2026-09", 0);
        expect(rows.map(row => row.balance)).toEqual([100, 5000.50, 6000.75, 6550.90, 6350.85]);
        expect(rows[1].debit).toBe("0.00");
    });
    it("normalizes a computed opening balance before cent arithmetic", () => {
        const rows = buildLedgerReportRows([entry(1, "2026-10-01", "0.10")], [], "2026-10", 0.1 + 0.2);
        expect(rows[0].balance).toBe(0.40);
    });
    it("does not duplicate the initial override and handles an empty override month", () => {
        const rows = buildLedgerReportRows([], [
            {monthYear: "2026-09", balance: "100.00"}, {monthYear: "2026-10", balance: "200.01"},
        ], "2026-09", 100);
        expect(rows).toHaveLength(1);
        expect(rows[0].balance).toBe(200.01);
    });
});
