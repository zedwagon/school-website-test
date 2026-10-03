import { getLedgerEntriesForMonth, getOpeningBalanceForMonth, getOpeningBalanceOverride } from "@school/api/accounting/operational/queries";
import { LedgerTable } from "./components/ledger-table";
import { redirect } from "next/navigation";

export default async function LedgerPage({
	searchParams,
}: {
	searchParams: Promise<{ month?: string }>;
}) {
	const resolvedParams = await searchParams;
	const currentMonth = resolvedParams.month;

	if (!currentMonth) {
		const now = new Date();
		const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
		redirect(`/dashboard/operational/ledger?month=${formatted}`);
	}

	const [yearStr, monthStr] = currentMonth.split("-");
	const year = parseInt(yearStr, 10);
	const month = parseInt(monthStr, 10);

	if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
		redirect("/dashboard/operational/ledger");
	}

	const [entries, openingBalanceData, explicitOverride] = await Promise.all([
		getLedgerEntriesForMonth(year, month),
		getOpeningBalanceForMonth(year, month),
		getOpeningBalanceOverride(year, month)
	]);
	
	return (
		<div className="space-y-6">
			<div className="bg-white mt-4 rounded-lg shadow border border-gray-200 overflow-hidden">
				<LedgerTable 
					year={year} 
					month={month} 
					entries={entries} 
					openingBalance={openingBalanceData.balance}
					isOverride={openingBalanceData.isOverride || !!explicitOverride}
				/>
			</div>
		</div>
	);
}
