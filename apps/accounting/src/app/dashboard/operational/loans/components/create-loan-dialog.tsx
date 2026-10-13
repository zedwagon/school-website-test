"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Button,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	CurrencyInput,
} from "@school/ui";
import { createEmployeeLoan } from "@school/api/accounting/loans/action";
import { toast } from "sonner";

export function CreateLoanDialog({ employees }: { employees: any[] }) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [employeeId, setEmployeeId] = useState("");
	const [principalAmount, setPrincipalAmount] = useState("");
	const [monthlyDeduction, setMonthlyDeduction] = useState("");
	const [dateIssued, setDateIssued] = useState(new Date().toISOString().split("T")[0]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!employeeId || !principalAmount || !monthlyDeduction || !dateIssued) {
			toast.error("Please fill in all fields");
			return;
		}

		try {
			setLoading(true);
			await createEmployeeLoan({
				employeeId: parseInt(employeeId, 10),
				principalAmount,
				monthlyDeduction,
				dateIssued: new Date(dateIssued).toISOString(),
			});
			toast.success("Loan created successfully");
			setOpen(false);
			// Reset form
			setEmployeeId("");
			setPrincipalAmount("");
			setMonthlyDeduction("");
		} catch (error: any) {
			toast.error(error.message || "Failed to create loan");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Issue New Loan</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Issue New Loan</DialogTitle>
					<DialogDescription>
						Create a new loan or cash advance for an employee. This will automatically sync with their payroll deductions.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4 pt-4">
					<div className="space-y-2">
						<Label>Employee</Label>
						<Select value={employeeId} onValueChange={setEmployeeId}>
							<SelectTrigger>
								<SelectValue placeholder="Select an employee" />
							</SelectTrigger>
							<SelectContent>
								{employees.map((emp) => (
									<SelectItem key={emp.id} value={emp.id.toString()}>
										{emp.lastName}, {emp.firstName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Principal Amount</Label>
							<CurrencyInput
								value={principalAmount}
								onValueChange={(values) => setPrincipalAmount(values.value || "")}
								placeholder="e.g. 10000"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label>Monthly Deduction</Label>
							<CurrencyInput
								value={monthlyDeduction}
								onValueChange={(values) => setMonthlyDeduction(values.value || "")}
								placeholder="e.g. 1000"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Date Issued</Label>
						<Input
							type="date"
							value={dateIssued}
							onChange={(e) => setDateIssued(e.target.value)}
							required
						/>
					</div>

					<DialogFooter>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create Loan"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
