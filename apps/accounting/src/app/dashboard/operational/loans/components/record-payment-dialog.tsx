"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Button,
	Input,
	Label,
	CurrencyInput,
} from "@school/ui";
import { recordLoanPayment } from "@school/api/accounting/loans/action";
import { toast } from "sonner";

export function RecordPaymentDialog({
	loan,
	open,
	onOpenChange,
}: {
	loan: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState(loan?.monthlyDeduction || "");
	const [datePaid, setDatePaid] = useState(new Date().toISOString().split("T")[0]);
	const [reference, setReference] = useState("");

	if (!loan) return null;

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!amount || !datePaid) {
			toast.error("Please fill in amount and date");
			return;
		}

		try {
			setLoading(true);
			await recordLoanPayment({
				loanId: loan.id,
				amount,
				datePaid: new Date(datePaid).toISOString(),
				reference,
			});
			toast.success("Payment recorded successfully");
			onOpenChange(false);
		} catch (error: any) {
			toast.error(error.message || "Failed to record payment");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Record Loan Payment</DialogTitle>
					<DialogDescription>
						Record a payment for {loan.employee.firstName} {loan.employee.lastName}'s loan.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4 pt-4">
					<div className="space-y-2">
						<Label>Amount</Label>
						<CurrencyInput
							value={amount}
							onValueChange={(values) => setAmount(values.value || "")}
							required
						/>
					</div>
					
					<div className="space-y-2">
						<Label>Date Paid</Label>
						<Input
							type="date"
							value={datePaid}
							onChange={(e) => setDatePaid(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label>Reference / Notes (Optional)</Label>
						<Input
							type="text"
							placeholder="e.g. Sept 16-30 Payroll Deduction"
							value={reference}
							onChange={(e) => setReference(e.target.value)}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Recording..." : "Record Payment"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
