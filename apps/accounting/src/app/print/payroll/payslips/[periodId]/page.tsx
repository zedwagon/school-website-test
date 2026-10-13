import { requireAccountingRoute } from "@/lib/require-accounting-route";
import { getPayrollPeriodById, getPayrollsForPrint } from "@school/api/accounting/payroll/query";
import { notFound } from "next/navigation";
import { PayslipViewer } from "./components/payslip-viewer";

export default async function BatchPrintPayslipsPage({
	params,
}: {
	params: Promise<{ periodId: string }>;
}) {
    await requireAccountingRoute();
	const { periodId: rawPeriodId } = await params;
	const periodId = parseInt(rawPeriodId, 10);
	if (Number.isNaN(periodId)) return notFound();

	const period = await getPayrollPeriodById(periodId);
	if (!period) return notFound();

	const payrolls = await getPayrollsForPrint(periodId);

	// Sort alphabetically by last name for easier distribution
	payrolls.sort((a: any, b: any) => {
		const aName = a.employee?.lastName || "";
		const bName = b.employee?.lastName || "";
		return aName.localeCompare(bName);
	});

	return <PayslipViewer period={period} payrolls={payrolls} />;
}
