"use client";

import { useState } from "react";
import { saveOpeningBalanceOverride, saveLedgerEntry } from "@school/api/accounting/operational/actions";
import { Button, Input, toast, formatCurrency } from "@school/ui";
import { Pencil, Plus, Check, X } from "lucide-react";

interface LedgerEntry {
	id: number;
	date: string;
	particulars: string;
	debit: string;
	credit: string;
	receiptId: number | null;
}

export function LedgerTable({
	year,
	month,
	entries,
	openingBalance,
	isOverride,
}: {
	year: number;
	month: number;
	entries: LedgerEntry[];
	openingBalance: number;
	isOverride: boolean;
}) {
	const [editingOpening, setEditingOpening] = useState(false);
	const [newOpeningBalance, setNewOpeningBalance] = useState(openingBalance.toString());
	const [savingOpening, setSavingOpening] = useState(false);

	// New Entry Form State
	const today = new Date();
	const defaultDate = `${year}-${String(month).padStart(2, '0')}-${String(Math.min(today.getDate(), new Date(year, month, 0).getDate())).padStart(2, '0')}`;

	const [newDate, setNewDate] = useState(defaultDate);
	const [newParticulars, setNewParticulars] = useState("");
	const [newDebit, setNewDebit] = useState("");
	const [newCredit, setNewCredit] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSaveOpening = async () => {
		try {
			setSavingOpening(true);
			await saveOpeningBalanceOverride(year, month, newOpeningBalance);
			toast.success("Opening balance updated");
			setEditingOpening(false);
		} catch (_error) {
			toast.error("Failed to update opening balance");
		} finally {
			setSavingOpening(false);
		}
	};

	const handleAddEntry = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newParticulars.trim()) return toast.error("Particulars is required");
		if (!newDebit && !newCredit) return toast.error("Please enter a debit or credit amount");

		try {
			setIsSubmitting(true);
			await saveLedgerEntry(newDate, newParticulars, newDebit, newCredit);
			toast.success("Entry added");
			setNewParticulars("");
			setNewDebit("");
			setNewCredit("");
		} catch (_error) {
			toast.error("Failed to add entry");
		} finally {
			setIsSubmitting(false);
		}
	};

	let runningBalance = openingBalance;

	return (
		<div className="flex flex-col">
			{/* New Entry Form */}
			<div className="bg-slate-50 border-b border-gray-200 p-4">
				<h3 className="text-sm font-semibold text-gray-700 mb-3">Add Manual Entry</h3>
				<form onSubmit={handleAddEntry} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:flex xl:items-end">
					<div className="min-w-0 xl:w-40">
						<label htmlFor="newDate" className="block text-xs font-medium text-gray-500 mb-1">Date</label>
						<Input id="newDate" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
					</div>
					<div className="min-w-0 xl:flex-1">
						<label htmlFor="newParticulars" className="block text-xs font-medium text-gray-500 mb-1">Particulars (Description)</label>
						<Input id="newParticulars" type="text" placeholder="e.g. Meralco Bill" value={newParticulars} onChange={(e) => setNewParticulars(e.target.value)} />
					</div>
					<div className="min-w-0 xl:w-32">
						<label htmlFor="newDebit" className="block text-xs font-medium text-gray-500 mb-1">Debit (In)</label>
						<Input id="newDebit" type="number" step="0.01" placeholder="0.00" value={newDebit} onChange={(e) => setNewDebit(e.target.value)} />
					</div>
					<div className="min-w-0 xl:w-32">
						<label htmlFor="newCredit" className="block text-xs font-medium text-gray-500 mb-1">Credit (Out)</label>
						<Input id="newCredit" type="number" step="0.01" placeholder="0.00" value={newCredit} onChange={(e) => setNewCredit(e.target.value)} />
					</div>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Adding..." : <><Plus className="w-4 h-4 mr-2" /> Add</>}
					</Button>
				</form>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-slate-100">
						<tr>
							<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Date</th>
							<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
							<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Debit (In)</th>
							<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Credit (Out)</th>
							<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Balance</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{/* Opening Balance Row */}
						<tr className="bg-yellow-50 hover:bg-yellow-100 transition-colors">
							<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
								01/{String(month).padStart(2, '0')}/{year}
							</td>
							<td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 flex items-center">
								Opening Balance {isOverride && <span className="ml-2 text-[10px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded uppercase tracking-wider">Manual</span>}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">-</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">-</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right group">
								{editingOpening ? (
									<div className="flex items-center justify-end space-x-2">
										<Input
											type="number"
											step="0.01"
											className="w-24 text-right h-8"
											aria-label="Opening balance" value={newOpeningBalance}
											onChange={(e) => setNewOpeningBalance(e.target.value)}
										/>
										<Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" aria-label="Save opening balance" onClick={handleSaveOpening} disabled={savingOpening}><Check className="w-4 h-4" /></Button>
										<Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" aria-label="Cancel opening balance edit" onClick={() => setEditingOpening(false)} disabled={savingOpening}><X className="w-4 h-4" /></Button>
									</div>
								) : (
									<div className="flex items-center justify-end">
										<button aria-label="Edit opening balance" onClick={() => setEditingOpening(true)} className="mr-2 opacity-100 transition-opacity text-gray-400 hover:text-blue-600">
											<Pencil className="w-3.5 h-3.5" />
										</button>
										{formatCurrency(openingBalance)}
									</div>
								)}
							</td>
						</tr>

						{/* Ledger Entries */}
						{entries.map((entry) => {
							const d = parseFloat(entry.debit) || 0;
							const c = parseFloat(entry.credit) || 0;
							runningBalance = runningBalance + d - c;

							const isAutoDeposit = !!entry.receiptId;

							return (
								<tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
									<td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
										{entry.date}
									</td>
									<td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 flex items-center">
										{entry.particulars}
										{isAutoDeposit && (
											<span className="ml-2 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
												Auto
											</span>
										)}
									</td>
									<td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-900">
										{formatCurrency(d, false)}
									</td>
									<td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-900">
										{formatCurrency(c, false)}
									</td>
									<td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
										{formatCurrency(runningBalance)}
									</td>
								</tr>
							);
						})}

						{entries.length === 0 && (
							<tr>
								<td colSpan={5} className="px-6 py-12 text-center text-sm">
									<div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
										<p className="font-medium text-slate-600">No ledger entries found for this month.</p>
										<p className="text-xs text-slate-400">Add a manual entry above or record a daily cash receipt to see it here.</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
