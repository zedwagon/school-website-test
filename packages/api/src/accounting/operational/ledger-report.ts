import { fromCents, toCents } from "../money";

type LedgerEntry = { id: number; date: string; particulars: string; debit: string; credit: string };
type OpeningOverride = { monthYear: string; balance: string };

// Opening overrides reset the balance before that month's transactions, even
// when the month contains no activity. Never add an override as a cash deposit.
export function buildLedgerReportRows(entries: LedgerEntry[], overrides: OpeningOverride[], startMonth: string, openingBalance: number) {
    const events = [
        ...entries.map(entry => ({ ...entry, key: `entry-${entry.id}`, opening: false })),
        ...overrides.filter(override => override.monthYear > startMonth).map(override => ({
            key: `opening-${override.monthYear}`, date: `${override.monthYear}-01`,
            particulars: "Opening Balance (Manual Override)", debit: "0.00", credit: "0.00",
            opening: true, overrideBalance: override.balance,
        })),
    ].sort((a, b) => a.date.localeCompare(b.date) || Number(b.opening) - Number(a.opening));
    let balance = toCents(openingBalance.toFixed(2));
    return events.map(event => {
        balance = "overrideBalance" in event ? toCents(event.overrideBalance) : balance + toCents(event.debit) - toCents(event.credit);
        return { ...event, balance: Number(fromCents(balance)) };
    });
}
