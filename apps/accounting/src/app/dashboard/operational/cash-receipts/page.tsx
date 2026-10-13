import { getCashReceiptsForMonth } from "@school/api/accounting/operational/queries";
import { CashReceiptsTable } from "@/app/dashboard/operational/cash-receipts/components/cash-receipts-table";
import { redirect } from "next/navigation";

export default async function CashReceiptsPage({
	searchParams,
}: {
	searchParams: Promise<{ month?: string }>;
}) {
	const resolvedParams = await searchParams;
	const currentMonth = resolvedParams.month;

	// If no month is provided, default to the current real-world month
	if (!currentMonth) {
		const now = new Date();
		const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
		redirect(`/dashboard/operational/cash-receipts?month=${formatted}`);
	}

	const [yearStr, monthStr] = currentMonth.split("-");
	const year = parseInt(yearStr, 10);
	const month = parseInt(monthStr, 10);

	if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
		redirect("/dashboard/operational/cash-receipts");
	}

	const records = await getCashReceiptsForMonth(year, month);

	return (
		<div className="space-y-6">

			<CashReceiptsTable key={`${year}-${month}`} year={year} month={month} records={records} />
		</div>
	);
}
