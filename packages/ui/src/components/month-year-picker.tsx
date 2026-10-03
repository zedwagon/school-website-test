"use client";

import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "../lib/utils";

const MONTHS = [
	{ value: "01", label: "January" },
	{ value: "02", label: "February" },
	{ value: "03", label: "March" },
	{ value: "04", label: "April" },
	{ value: "05", label: "May" },
	{ value: "06", label: "June" },
	{ value: "07", label: "July" },
	{ value: "08", label: "August" },
	{ value: "09", label: "September" },
	{ value: "10", label: "October" },
	{ value: "11", label: "November" },
	{ value: "12", label: "December" },
];

export interface MonthYearPickerProps {
	month: string; // Accepts "1"-"12" or "01"-"12"
	year: string;
	onMonthChange: (month: string) => void;
	onYearChange: (year: string) => void;
	startYear?: number;
	endYear?: number;
	className?: string;
	variant?: "default" | "ghost";
}

export function MonthYearPicker({
	month,
	year,
	onMonthChange,
	onYearChange,
	startYear = 2000,
	endYear = 2050,
	className,
	variant = "default",
}: MonthYearPickerProps) {
	const years = useMemo(() => {
		const length = endYear - startYear + 1;
		return Array.from({ length }, (_, i) => String(startYear + i));
	}, [startYear, endYear]);

	const formattedMonth = String(month).padStart(2, "0");

	return (
		<div className={cn("flex items-center", className)}>
			<Select value={formattedMonth} onValueChange={onMonthChange}>
				<SelectTrigger 
					className={cn(
						"w-[140px]", 
						variant === "ghost" 
							? "border-none shadow-none bg-transparent hover:bg-slate-100 focus:ring-0 font-bold" 
							: "h-8 text-xs bg-white"
					)}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
				</SelectContent>
			</Select>
			
			<Select value={String(year)} onValueChange={onYearChange}>
				<SelectTrigger 
					className={cn(
						"w-[100px]", 
						variant === "ghost" 
							? "border-none shadow-none bg-transparent hover:bg-slate-100 focus:ring-0 font-bold"
							: "h-8 text-xs bg-white"
					)}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
				</SelectContent>
			</Select>
		</div>
	);
}
