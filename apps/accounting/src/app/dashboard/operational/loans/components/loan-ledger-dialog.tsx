"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	formatCurrency,
} from "@school/ui";
import { format } from "date-fns";

export function LoanLedgerDialog({
	loan,
	open,
	onOpenChange,
}: {
	loan: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	if (!loan) return null;

	const totalPaid = loan.payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
	const remaining = parseFloat(loan.principalAmount) - totalPaid;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Loan Ledger: {loan.employee.firstName} {loan.employee.lastName}</DialogTitle>
					<DialogDescription>
						Principal: {formatCurrency(loan.principalAmount)} | 
						Remaining: {formatCurrency(remaining)}
					</DialogDescription>
				</DialogHeader>
				
				<div className="mt-4 rounded-md border max-h-[60vh] overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date Paid</TableHead>
								<TableHead>Reference</TableHead>
								<TableHead className="text-right">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loan.payments.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
										No payments recorded yet.
									</TableCell>
								</TableRow>
							) : (
								loan.payments.map((payment: any) => (
									<TableRow key={payment.id}>
										<TableCell>{format(new Date(payment.datePaid), "MMM dd, yyyy")}</TableCell>
										<TableCell>{payment.reference || "-"}</TableCell>
										<TableCell className="text-right text-emerald-600 font-medium">
											{formatCurrency(payment.amount)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</DialogContent>
		</Dialog>
	);
}
