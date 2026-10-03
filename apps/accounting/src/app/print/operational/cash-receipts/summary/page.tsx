import { requireAccountingRoute } from "@/lib/require-accounting-route";
import { getMonthlyCashReceiptsSummary } from "@school/api/accounting/operational/queries";
import { PrintButton } from "@/components/print/print-button";
import { PrintFilterForm } from "./components/print-filter-form";
import { redirect } from "next/navigation";

function generateMonthsRange(fromStr: string, toStr: string) {
	const [fromYear, fromMonth] = fromStr.split('-').map(Number);
	const [toYear, toMonth] = toStr.split('-').map(Number);
	const months = [];
	
	let currentYear = fromYear;
	let currentMonth = fromMonth;
	
	// Failsafe limit to prevent infinite loops (max 1200 months / 100 years)
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

export default async function PrintCashReceiptsSummary({
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
		redirect(`/print/operational/cash-receipts/summary?from=${from}&to=${to}`);
	}

	const [fromYear, fromMonth] = fromStr.split('-').map(Number);
	const [toYear, toMonth] = toStr.split('-').map(Number);

	if (Number.isNaN(fromYear) || Number.isNaN(fromMonth) || Number.isNaN(toYear) || Number.isNaN(toMonth)) {
		redirect("/dashboard/operational/cash-receipts");
	}

	const summary = await getMonthlyCashReceiptsSummary(fromYear, fromMonth, toYear, toMonth);
	const months = generateMonthsRange(fromStr, toStr);

	let totalReceipts = 0;
	let totalDeposit = 0;

	return (
		<div className="print-root min-h-screen print:min-h-0 bg-gray-100 print:bg-white text-black font-sans pb-12 print:pb-0">
			<div className="print:hidden sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
				<h1 className="text-xl font-bold">Summary of Cash Receipts</h1>
				<div className="flex items-center gap-6">
					<PrintFilterForm initialFrom={fromStr} initialTo={toStr} />
					<div className="h-6 w-px bg-gray-300"></div>
					<PrintButton label="Print Summary" />
				</div>
			</div>

			<div className="max-w-4xl mx-auto mt-8 print:mt-0 print:max-w-none bg-white p-8 print:p-0 shadow-sm print:shadow-none">
				<div className="bg-yellow-300 font-bold text-center py-2 text-lg mb-6 print-exact-colors">
					Summary of Cash Receipts ({months[0]?.name} {months[0]?.year} - {months[months.length - 1]?.name} {months[months.length - 1]?.year})
				</div>

				<table className="w-full">
					<thead>
						<tr className="border-b-2 border-black">
							<th className="py-2 text-left w-1/4">Date</th>
							<th className="py-2 text-right w-1/4">Cash Receipts</th>
							<th className="py-2 text-right w-1/4">Deposit</th>
							<th className="py-2 text-right w-1/4">(Short) | Over</th>
						</tr>
					</thead>
					<tbody>
						{months.map((m) => {
							const key = `${m.year}-${m.index}`;
							const data = summary.find((s: any) => s.monthYear === key);
							
							const r = parseFloat(data?.totalReceipts || "0");
							const d = parseFloat(data?.totalDeposit || "0");
							const shortOver = d - r;

							totalReceipts += r;
							totalDeposit += d;

							// To match exactly "May 1 - 31, 2025" we need the last day
							const lastDay = new Date(m.year, parseInt(m.index, 10), 0).getDate();

							return (
								<tr key={key}>
									<td className="py-1.5">{m.name} 1 - {lastDay}, {m.year}</td>
									<td className="py-1.5 text-right">{r.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
									<td className="py-1.5 text-right">{d.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
									<td className="py-1.5 text-right">
										{shortOver < 0 ? `(${Math.abs(shortOver).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : shortOver.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot>
						<tr className="border-t-2 border-black bg-yellow-300 font-bold print-exact-colors">
							<td className="py-2 underline">TOTAL</td>
							<td className="py-2 text-right">{totalReceipts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
							<td className="py-2 text-right">{totalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
							<td className="py-2 text-right">
								{totalDeposit - totalReceipts < 0 
									? `(${Math.abs(totalDeposit - totalReceipts).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
									: (totalDeposit - totalReceipts).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
								}
							</td>
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
