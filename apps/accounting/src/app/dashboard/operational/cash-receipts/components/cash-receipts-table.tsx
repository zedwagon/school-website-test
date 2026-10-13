"use client";

import { useState, useMemo } from "react";
import { saveBulkDailyCashReceipts } from "@school/api/accounting/operational/actions";
import { Input, Button, toast, formatCurrency } from "@school/ui";
import { Save } from "lucide-react";

interface ReceiptRecord {
	id: number;
	date: string;
	receipts: string;
	deposit: string;
}

export function CashReceiptsTable({
	year,
	month,
	records,
}: {
	year: number;
	month: number;
	records: ReceiptRecord[];
}) {
	const daysInMonth = new Date(year, month, 0).getDate();

	// Initialize local state to match the server records
	const initialState = useMemo(() => {
		const state: globalThis.Record<string, { receipts: string; deposit: string }> = {};
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			const record = records.find((r) => r.date === dateStr);
			state[dateStr] = {
				receipts: record?.receipts || "",
				deposit: record?.deposit || "",
			};
		}
		return state;
	}, [year, month, daysInMonth, records]);

	const [data, setData] = useState(initialState);
	const [isSaving, setIsSaving] = useState(false);

	const isDirty = (dateStr: string) => {
		const record = records.find((r) => r.date === dateStr);
		const row = data[dateStr];
		
		const cleanReceipts = parseFloat(row.receipts.replace(/[^0-9.]/g, "") || "0");
		const cleanDeposit = parseFloat(row.deposit.replace(/[^0-9.]/g, "") || "0");

		if (record) {
			// Compare to existing
			return parseFloat(record.receipts || "0") !== cleanReceipts || parseFloat(record.deposit || "0") !== cleanDeposit;
		}
		// Compare to empty
		return cleanReceipts !== 0 || cleanDeposit !== 0;
	};

	const hasAnyChanges = Object.keys(data).some(isDirty);

	const handleSaveAll = async () => {
		setIsSaving(true);
		let successCount = 0;
		let errorCount = 0;

		const dirtyDates = Object.keys(data).filter(isDirty);

		if (dirtyDates.length === 0) {
			toast.info("No changes to save.");
			setIsSaving(false);
			return;
		}

		const entriesToSave = dirtyDates.map(dateStr => {
			const row = data[dateStr];
			return {
				dateString: dateStr,
				receipts: row.receipts.replace(/[^0-9.]/g, "") || "0",
				deposit: row.deposit.replace(/[^0-9.]/g, "") || "0"
			};
		});

		try {
			await saveBulkDailyCashReceipts(entriesToSave);
			successCount = entriesToSave.length;
		} catch (error) {
			console.error(`Failed to bulk save:`, error);
			errorCount = entriesToSave.length;
		}

		if (errorCount > 0) {
			toast.error(`Saved ${successCount} entries, but ${errorCount} failed.`);
		} else {
			toast.success(`Successfully saved ${successCount} entries!`);
		}

		setIsSaving(false);
	};

	let totalReceipts = 0;
	let totalDeposit = 0;

	return (
		<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
			<div className="flex justify-between items-center p-4 border-b border-slate-200">
				<div>
					<h3 className="font-medium text-slate-800">Daily Records</h3>
					<p className="text-sm text-slate-500">Edit receipts and deposits for the month.</p>
				</div>
				<Button 
					onClick={handleSaveAll} 
					disabled={!hasAnyChanges || isSaving}
					className="min-w-[120px]"
				>
					<Save className="w-4 h-4 mr-2" />
					{isSaving ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-slate-50">
						<tr>
							<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
								Date
							</th>
							<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
								Cash Receipts
							</th>
							<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
								Deposit
							</th>
							<th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider w-[20%]">
								<span className="text-red-600">(Short)</span> <span className="text-gray-500">|</span> <span className="text-green-600">Over</span>
							</th>
							<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{Array.from({ length: daysInMonth }).map((_, i) => {
							const day = i + 1;
							const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
							const rowData = data[dateStr] || { receipts: "", deposit: "" };
							
							const receiptsVal = parseFloat(rowData.receipts) || 0;
							const depositVal = parseFloat(rowData.deposit) || 0;
							const shortOver = depositVal - receiptsVal;
							
							totalReceipts += receiptsVal;
							totalDeposit += depositVal;

							const isRowDirty = isDirty(dateStr);

							return (
								<tr key={dateStr} className={`transition-colors ${isRowDirty ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'}`}>
									<td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
										{String(month).padStart(2, '0')}/{String(day).padStart(2, '0')}/{year}
									</td>
									<td className="px-6 py-2 whitespace-nowrap">
										<Input 
											type="number"
											step="0.01"
											placeholder="0.00"
											className="w-full text-right h-8"
											value={rowData.receipts}
											onChange={(e) => setData((p) => ({...p, [dateStr]: { ...p[dateStr], receipts: e.target.value }}))}
										/>
									</td>
									<td className="px-6 py-2 whitespace-nowrap">
										<Input 
											type="number"
											step="0.01"
											placeholder="0.00"
											className="w-full text-right h-8"
											value={rowData.deposit}
											onChange={(e) => setData((p) => ({...p, [dateStr]: { ...p[dateStr], deposit: e.target.value }}))}
										/>
									</td>
									<td className={`px-6 py-2 whitespace-nowrap text-sm font-medium text-right ${shortOver < 0 ? 'text-red-600' : shortOver > 0 ? 'text-green-600' : 'text-gray-500'}`}>
										{shortOver < 0 ? `(${formatCurrency(Math.abs(shortOver), false)})` : formatCurrency(shortOver, false)}
									</td>
									<td className="px-2 py-2 text-center text-xs">
										{isRowDirty && <span className="text-amber-500 font-medium text-xs">Unsaved</span>}
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot className="bg-slate-50 font-semibold border-t-2 border-gray-300">
						<tr>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TOTAL</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-800">{formatCurrency(totalReceipts)}</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-800">{formatCurrency(totalDeposit)}</td>
							<td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${(totalDeposit - totalReceipts) < 0 ? 'text-red-600' : 'text-green-600'}`}>
								{(totalDeposit - totalReceipts) < 0 
									? `(${formatCurrency(Math.abs(totalDeposit - totalReceipts))})` 
									: formatCurrency(totalDeposit - totalReceipts)}
							</td>
							<td></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}
