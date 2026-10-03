import { requireAccountingRoute } from "@/lib/require-accounting-route";
import { buildLedgerReportRows } from "@school/api/accounting/operational/ledger-report";
import { getLedgerEntriesForRange, getOpeningBalanceForMonth, getOpeningBalanceOverridesForRange } from "@school/api/accounting/operational/queries";
import { PrintButton } from "@/components/print/print-button";
import { PrintFilterForm } from "../cash-receipts/summary/components/print-filter-form";
import { redirect } from "next/navigation";

function generateMonthsRange(fromStr: string, toStr: string) {
	const [fromYear, fromMonth] = fromStr.split('-').map(Number);
	const [toYear, toMonth] = toStr.split('-').map(Number);
	const months = [];
	
	let currentYear = fromYear;
	let currentMonth = fromMonth;
	
	let loops = 0;
	while ((currentYear < toYear || (currentYear === toYear && currentMonth <= toMonth)) && loops < 1200) {
		months.push({
			name: new Date(currentYear, currentMonth - 1, 1).toLocaleString('en-US', { month: 'long' }),
			year: currentYear,
			index: String(currentMonth).padStart(2, '0'),
		});
		currentMonth++;
		if (currentMonth > 12) {
			currentMonth = 1;
			currentYear++;
		}
		loops++;
	}
	return months;
}

export default async function PrintLedger({
	searchParams,
}: {
	searchParams: Promise<{ from?: string, to?: string }>;
}) {
    await requireAccountingRoute();
	const resolvedParams = await searchParams;
	const fromStr = resolvedParams.from;
	const toStr = resolvedParams.to;

	if (!fromStr || !toStr) {
		const now = new Date();
		const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
		const currentYear = now.getFullYear();
		
		const to = `${currentYear}-${currentMonth}`;
		const from = `${currentYear - 1}-${currentMonth}`;
		redirect(`/print/operational/ledger?from=${from}&to=${to}`);
	}

	const [fromYear, fromMonth] = fromStr.split('-').map(Number);
	const [toYear, toMonth] = toStr.split('-').map(Number);

	if (Number.isNaN(fromYear) || Number.isNaN(fromMonth) || Number.isNaN(toYear) || Number.isNaN(toMonth)) {
		redirect("/dashboard/operational/ledger");
	}

	const [entries, openingBalanceData, overrides] = await Promise.all([
		getLedgerEntriesForRange(fromYear, fromMonth, toYear, toMonth),
		getOpeningBalanceForMonth(fromYear, fromMonth),
        getOpeningBalanceOverridesForRange(fromStr, toStr)
	]);

	const months = generateMonthsRange(fromStr, toStr);
	const openingBalance = openingBalanceData.balance;

	const reportRows = buildLedgerReportRows(entries, overrides, fromStr, openingBalance);
    const closingBalance = reportRows.at(-1)?.balance ?? openingBalance;

	return (
		<div className="print-root min-h-screen print:min-h-0 bg-gray-100 print:bg-white text-black font-sans pb-12 print:pb-0">
			<div className="print:hidden sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
				<h1 className="text-xl font-bold">Print Master Ledger</h1>
				<div className="flex items-center gap-6">
					<PrintFilterForm initialFrom={fromStr} initialTo={toStr} />
					<div className="h-6 w-px bg-gray-300"></div>
					<PrintButton label="Print Ledger" />
				</div>
			</div>

			<div className="max-w-4xl mx-auto mt-8 print:mt-0 print:max-w-none bg-white p-8 print:p-0 shadow-sm print:shadow-none">
				<div className="bg-yellow-300 font-bold text-center py-2 text-lg mb-6 print-exact-colors">
					Master Ledger ({months[0]?.name} {months[0]?.year} - {months[months.length - 1]?.name} {months[months.length - 1]?.year})
				</div>

				<table className="w-full">
					<thead>
						<tr className="border-b-2 border-black">
							<th className="py-2 text-left w-1/5">Date</th>
							<th className="py-2 text-left w-2/5">Particulars</th>
							<th className="py-2 text-right w-[13.33%]">Debit (In)</th>
							<th className="py-2 text-right w-[13.33%]">Credit (Out)</th>
							<th className="py-2 text-right w-[13.33%]">Balance</th>
						</tr>
					</thead>
					<tbody>
						<tr className="border-b border-gray-300">
							<td className="py-2">01/{String(fromMonth).padStart(2, '0')}/{fromYear}</td>
							<td className="py-2 font-bold">Opening Balance</td>
							<td className="py-2 text-right">-</td>
							<td className="py-2 text-right">-</td>
							<td className="py-2 text-right font-bold">
								{openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
							</td>
						</tr>

						{reportRows.map((entry) => {
							const d = parseFloat(entry.debit) || 0;
							const c = parseFloat(entry.credit) || 0;
							const runningBalance = entry.balance;

							return (
								<tr key={entry.key} className="border-b border-gray-200">
									<td className="py-1.5">{entry.date}</td>
									<td className="py-1.5">{entry.particulars}</td>
									<td className="py-1.5 text-right">{d > 0 ? d.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}</td>
									<td className="py-1.5 text-right">{c > 0 ? c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}</td>
									<td className="py-1.5 text-right font-semibold">
										{runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot>
						<tr className="border-t-2 border-black bg-yellow-300 font-bold print-exact-colors">
							<td className="py-2 underline font-bold" colSpan={4}>CLOSING BALANCE</td>
							<td className="py-2 text-right">{closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
						</tr>
					</tfoot>
				</table>
			</div>

			<style
				dangerouslySetInnerHTML={{
					__html: `
        @media print {
          body { background: white !important; }
          .print-exact-colors {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `,
				}}
			/>
		</div>
	);
}
