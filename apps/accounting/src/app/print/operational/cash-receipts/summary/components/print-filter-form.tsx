"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button, MonthYearPicker } from "@school/ui";

export function PrintFilterForm({ initialFrom, initialTo }: { initialFrom: string, initialTo: string }) {
	const router = useRouter();
	const pathname = usePathname();
	
	const [fromYear, fromMonth] = initialFrom.split("-");
	const [toYear, toMonth] = initialTo.split("-");

	const [fYear, setFYear] = useState(fromYear || "2025");
	const [fMonth, setFMonth] = useState(fromMonth || "01");
	
	const [tYear, setTYear] = useState(toYear || "2025");
	const [tMonth, setTMonth] = useState(toMonth || "12");

	const handleApply = () => {
		router.push(`${pathname}?from=${fYear}-${fMonth}&to=${tYear}-${tMonth}`);
	};

	return (
		<div className="flex items-center gap-6">
			<div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: MonthYearPicker does not expose a control id */}
				<label className="text-sm font-medium text-slate-700 mr-1">From:</label>
				<MonthYearPicker 
					month={fMonth} 
					year={fYear} 
					onMonthChange={setFMonth} 
					onYearChange={setFYear} 
				/>
			</div>

			<div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: MonthYearPicker does not expose a control id */}
				<label className="text-sm font-medium text-slate-700 mr-1">To:</label>
				<MonthYearPicker 
					month={tMonth} 
					year={tYear} 
					onMonthChange={setTMonth} 
					onYearChange={setTYear} 
				/>
			</div>

			<Button onClick={handleApply} size="sm" className="h-9 px-6 bg-slate-800 hover:bg-slate-700">Apply Filter</Button>
		</div>
	);
}
