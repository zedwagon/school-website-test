import { requireAccountingRoute } from "@/lib/require-accounting-route";
import {
	getPayrollPeriodById,
	getPayrollsForPrint,
} from "@school/api/accounting/payroll/query";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print/print-button";
import { PayrollTable } from "./components/payroll-table";

function formatDateRange(name: string) {
	if (!name?.includes(" to ")) return name;
	const [startStr, endStr] = name.split(" to ");
	const start = new Date(startStr);
	const end = new Date(endStr);
	
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return name;
	
	const startMonth = start.toLocaleString('en-US', { month: 'long' });
	const startDay = start.getDate();
	const startYear = start.getFullYear();
	
	const endMonth = end.toLocaleString('en-US', { month: 'long' });
	const endDay = end.getDate();
	const endYear = end.getFullYear();
	
	if (startYear === endYear) {
		if (startMonth === endMonth) {
			return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
		}
		return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
	}
	
	return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
}

export default async function PrintPayrollSummaryPage({
	params,
	searchParams,
}: {
	params: Promise<{ periodId: string }>;
	searchParams: Promise<{ type?: string }>;
}) {
    await requireAccountingRoute();
	const { periodId: rawPeriodId } = await params;
	const { type: filterType } = await searchParams;
	const periodId = parseInt(rawPeriodId, 10);
	if (Number.isNaN(periodId)) return notFound();

	const period = await getPayrollPeriodById(periodId);
	if (!period) return notFound();

	const payrolls = await getPayrollsForPrint(periodId);

	const formattedDate = formatDateRange(period.name);

	// Sort alphabetically by last name
	payrolls.sort((a: any, b: any) => {
		const aName = a.employee?.lastName || "";
		const bName = b.employee?.lastName || "";
		return aName.localeCompare(bName);
	});

	// Group payrolls by type
	const grouped: Record<string, any[]> = {
		administrators: [],
		teaching: [],
		non_teaching: [],
		part_time_teaching: [],
	};

	payrolls.forEach((record: any) => {
		const type = record.employeeType || record.employee?.type || "unknown";
		if (!grouped[type]) grouped[type] = [];
		grouped[type].push(record);
	});

	// Determine which groups to render
	const groupsToRender = filterType
		? [filterType].filter((t) => grouped[t]?.length > 0)
		: Object.keys(grouped).filter((t) => grouped[t].length > 0);

	const formatType = (type: string) => 
		type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

	return (
		<div className="print-root min-h-screen print:min-h-0 bg-gray-100 print:bg-white text-black font-sans pb-12 print:pb-0">
			<div className="print:hidden sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-4">

				<div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-slate-900">Payroll Summary: {formattedDate}</h1>
						<p className="text-sm text-slate-500 mt-1">{payrolls.length} total employees</p>
					</div>
					
					<div className="flex flex-wrap items-center gap-4">
						<div className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 overflow-x-auto max-w-full">
							<a
								href={`/print/payroll/summary/${periodId}`}
								className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
									!filterType 
										? "bg-white text-slate-950 shadow-sm" 
										: "hover:bg-slate-200 hover:text-slate-900"
								}`}
							>
								View All
							</a>
							{Object.keys(grouped).filter(t => grouped[t].length > 0).map(t => (
								<a
									key={t}
									href={`/print/payroll/summary/${periodId}?type=${t}`}
									className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
										filterType === t 
											? "bg-white text-slate-950 shadow-sm" 
											: "hover:bg-slate-200 hover:text-slate-900"
									}`}
								>
									{formatType(t)} ({grouped[t].length})
								</a>
							))}
						</div>
						<PrintButton label={filterType ? `Print ${formatType(filterType)}` : "Print All"} />
					</div>
				</div>
			</div>

			<div className="print:p-0 w-full mx-auto print:max-w-none mt-6 print:mt-0">
				{groupsToRender.map((typeKey, index) => (
					<div 
						key={typeKey} 
						className={`bg-white shadow-md mx-auto max-w-[1300px] overflow-x-auto print:shadow-none print:max-w-none print:overflow-visible ${index > 0 ? "print:break-before-page mt-8 print:mt-0" : ""}`}
					>
						<PayrollTable 
							typeKey={typeKey}
							periodName={formattedDate}
							groupRecords={grouped[typeKey]}
						/>
					</div>
				))}
				
				{groupsToRender.length === 0 && (
					<div className="p-8 text-center text-gray-500 bg-white shadow-sm max-w-[1300px] mx-auto mt-6">
						No payroll records found for this period.
					</div>
				)}
			</div>

			<style
				dangerouslySetInnerHTML={{
					__html: `
        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .print-page {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print-exact-colors {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Setup landscape layout for wide tables */
          @page { 
            size: landscape; 
            margin: 0.5cm;
          }
        }
      `,
				}}
			/>
		</div>
	);
}
