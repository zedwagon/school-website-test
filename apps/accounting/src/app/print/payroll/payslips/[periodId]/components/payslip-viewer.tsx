"use client";

import { useState } from "react";
import { PayslipCard } from "@/components/print/payslip-card";
import { PrintButton } from "@/components/print/print-button";
import { Checkbox, Button } from "@school/ui";

export function PayslipViewer({
	period,
	payrolls,
}: {
	period: any;
	payrolls: any[];
}) {
	// Group payrolls by type
	const grouped: Record<string, any[]> = {
		administrators: [],
		teaching: [],
		non_teaching: [],
		part_time_teaching: [],
	};

	payrolls.forEach((record: any) => {
		const type = record.employee?.type || "unknown";
		if (!grouped[type]) grouped[type] = [];
		grouped[type].push(record);
	});

	const availableTypes = Object.keys(grouped).filter((t) => grouped[t].length > 0);

	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [activeType, setActiveType] = useState<string | null>(availableTypes[0] || null);

	const formatType = (type: string) =>
		type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

	const groupsToRender = activeType
		? [activeType]
		: availableTypes;

	const visiblePayrolls = groupsToRender.flatMap((t) => grouped[t]);

	const toggleSelection = (id: number) => {
		const newSet = new Set(selectedIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		setSelectedIds(newSet);
	};

	const toggleAll = () => {
		const allVisibleIds = visiblePayrolls.map((p) => p.id);
		const allSelected = allVisibleIds.every((id) => selectedIds.has(id));
		
		const newSet = new Set(selectedIds);
		if (allSelected) {
			// Deselect all visible
			allVisibleIds.forEach((id) => { newSet.delete(id); });
		} else {
			// Select all visible
			allVisibleIds.forEach((id) => { newSet.add(id); });
		}
		setSelectedIds(newSet);
	};

	// Only print the selected ones
	const printedPayrolls = visiblePayrolls.filter((p) => selectedIds.has(p.id));
	const _lastSelectedId = printedPayrolls.length > 0 ? printedPayrolls[printedPayrolls.length - 1].id : null;

	return (
		<div className="print-root min-h-screen print:min-h-0 bg-gray-100 print:bg-white text-black font-sans">
			<div className="print:hidden sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-4">
				<div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
					<div>
						<h1 className="text-xl font-bold">Batch Print: {period.name}</h1>
						<div className="flex items-center gap-2 mt-1">
							<span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
								{printedPayrolls.length} of {visiblePayrolls.length} selected
							</span>
							<span className="text-sm text-slate-500">
								— Click on any payslip below to select or deselect it for printing.
							</span>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						<div className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 overflow-x-auto max-w-full">
							{availableTypes
								.map((t) => (
									<button
										key={t}
										onClick={() => setActiveType(t)}
										className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
											activeType === t
												? "bg-white text-slate-950 shadow-sm"
												: "hover:bg-slate-200 hover:text-slate-900"
										}`}
									>
										{formatType(t)} ({grouped[t].length})
									</button>
								))}
						</div>
						<div className="flex items-center gap-4 border-l pl-4 ml-2">
							<Button variant="outline" onClick={toggleAll}>
								{visiblePayrolls.every(p => selectedIds.has(p.id)) && visiblePayrolls.length > 0
									? "Deselect All"
									: "Select All"}
							</Button>
							<PrintButton disabled={selectedIds.size === 0} />
						</div>
					</div>
				</div>
			</div>

			<div className="py-8 print:py-0 flex flex-wrap gap-8 print:gap-2 justify-center print:justify-between max-w-5xl mx-auto print-scale">
				{visiblePayrolls.map((record: any) => {
					const isSelected = selectedIds.has(record.id);

					return (
						<div
							key={record.id}
							className={`relative group w-full md:w-[calc(50%-1rem)] print:w-[calc(50%-0.5rem)] ${isSelected ? "print:break-inside-avoid inline-block print:border print:border-transparent" : "print:hidden"}`}
						>
							{/* SCREEN UI WRAPPER */}
							<div 
								className={`print:hidden absolute inset-[-16px] rounded-xl border-2 transition-all cursor-pointer z-10 ${
									isSelected 
										? "border-red-500 bg-red-50/10 shadow-md" 
										: "border-transparent hover:border-gray-300 hover:bg-gray-50/50"
								}`}
								onClick={() => toggleSelection(record.id)}
							>
								<div className="absolute left-4 top-4 z-20 bg-white rounded-md shadow-sm">
									<Checkbox
										checked={isSelected}
										onCheckedChange={() => toggleSelection(record.id)}
										className="h-6 w-6"
									/>
								</div>
							</div>

							{/* PAYSLIP ITSELF */}
							<div className={`relative transition-all duration-200 pointer-events-none print:pointer-events-auto ${isSelected ? "" : "opacity-40 grayscale"}`}>
								<PayslipCard
									data={{
										periodName: (function formatPeriod(name: string) {
											const parts = name.split(" TO ");
											if (parts.length !== 2) return name;
											const startDate = new Date(parts[0]);
											const endDate = new Date(parts[1]);
											if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return name;
											const month = startDate.toLocaleString('default', { month: 'long' });
											const year = startDate.getFullYear();
											const startDay = startDate.getDate();
											const endDay = endDate.getDate();
											if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
												return `${month} ${startDay}-${endDay}, ${year}`;
											} else {
												const endMonth = endDate.toLocaleString('default', { month: 'long' });
												return `${month} ${startDay} - ${endMonth} ${endDay}, ${year}`;
											}
										})(period.name),
										staffName:
											`${record.employee?.lastName}, ${record.employee?.firstName} ${record.employee?.middleName || ""}`.trim(),
										type: record.employee?.type,
										department: record.employee?.department,
										baseSalary: record.baseSalary,
										halfSalary: record.halfSalary,
										transpoAllowance: record.transpoAllowance,
										positionPay: record.positionPay,
										advisoryPay: record.advisoryPay,
										holidayPay: record.holidayPay,
										subjectOverload: record.subjectOverload,
										additionalPay: record.additionalPay,
										moderatorPay: record.moderatorPay,
										dailySalary: record.dailySalary,
										subjectHoursPerDay: record.subjectHoursPerDay,
										numberOfClasses: record.numberOfClasses,
										totalEarnings: record.totalEarnings,
										sssEe: record.sssEe,
										philhealthEe: record.philhealthEe,
										pagIbigEe: record.pagIbigEe,
										loanDeduction: record.loanDeduction,
										totalDeductions: record.totalDeductions,
										netPay: record.netPay,
									}}
								/>
							</div>
						</div>
					);
				})}
				{visiblePayrolls.length === 0 && (
					<div className="text-center py-20 print:hidden text-gray-500 col-span-2">
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
          .print-scale {
            zoom: 0.93;
          }
          /* Remove default browser headers/footers */
          @page { margin: 0.5cm; }
        }
      `,
				}}
			/>
		</div>
	);
}
