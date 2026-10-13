"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button, MonthYearPicker } from "@school/ui";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import Link from "next/link";

export function MasterMonthFilter() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlMonthParam = searchParams.get("month");

	let currentM = String(new Date().getMonth() + 1).padStart(2, "0");
	let currentY = String(new Date().getFullYear());

	if (urlMonthParam) {
		const [y, m] = urlMonthParam.split("-");
		if (y && m) {
			currentY = y;
			currentM = String(parseInt(m, 10)).padStart(2, "0");
		}
	}
	
	const month = parseInt(currentM, 10).toString(); // Convert back to 1-12 without padding for the Select value
	const year = currentY;

	const updateParams = (newMonth: string, newYear: string) => {
		const formattedMonth = String(newMonth).padStart(2, "0");
		const params = new URLSearchParams(searchParams.toString());
		params.set("month", `${newYear}-${formattedMonth}`);
		router.push(`${pathname}?${params.toString()}`);
	};

	const handlePrev = () => {
		let m = parseInt(month, 10) - 1;
		let y = parseInt(year, 10);
		if (m < 1) {
			m = 12;
			y--;
		}
		updateParams(String(m), String(y));
	};

	const handleNext = () => {
		let m = parseInt(month, 10) + 1;
		let y = parseInt(year, 10);
		if (m > 12) {
			m = 1;
			y++;
		}
		updateParams(String(m), String(y));
	};

	const isLedger = pathname.includes("/ledger");
	const printHref = isLedger 
		? `/print/operational/ledger` 
		: `/print/operational/cash-receipts/summary`;

	return (
		<div className="flex flex-wrap items-center gap-4">
			<Link href={printHref} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" className="h-10 bg-white">
					<Printer className="w-4 h-4 mr-2" /> Print {isLedger ? "Master Ledger Summary" : "Cash Receipts Summary"}
				</Button>
			</Link>

			<div className="flex items-center gap-1 bg-white p-1 rounded-lg border shadow-sm">
			<Button variant="ghost" size="icon" aria-label="Previous month" onClick={handlePrev} className="h-8 w-8">
				<ChevronLeft className="w-4 h-4" />
			</Button>

			<MonthYearPicker 
				month={month} 
				year={year}
				onMonthChange={(val) => updateParams(val, year)}
				onYearChange={(val) => updateParams(month, val)}
				variant="ghost"
			/>

			<Button variant="ghost" size="icon" aria-label="Next month" onClick={handleNext} className="h-8 w-8">
				<ChevronRight className="w-4 h-4" />
			</Button>
			</div>
		</div>
	);
}
