"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Badge,
	Button,
	formatCurrency,
} from "@school/ui";
import { Banknote } from "lucide-react";

import { RecordPaymentDialog } from "@/app/dashboard/operational/loans/components/record-payment-dialog";
import { LoanLedgerDialog } from "@/app/dashboard/operational/loans/components/loan-ledger-dialog";

export function LoansClient({ initialLoans, employees }: { initialLoans: any[]; employees: any[] }) {
	const loans = initialLoans;
	const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<any>(null);
	const [selectedLoanForLedger, setSelectedLoanForLedger] = useState<any>(null);

	const calculateRemaining = (loan: any) => {
		const totalPaid = loan.payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
		return parseFloat(loan.principalAmount) - totalPaid;
	};

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="whitespace-nowrap">Employee</TableHead>
							<TableHead className="whitespace-nowrap">Date Issued</TableHead>
							<TableHead className="text-right whitespace-nowrap">Principal</TableHead>
							<TableHead className="text-right whitespace-nowrap">Monthly Ded.</TableHead>
							<TableHead className="text-right whitespace-nowrap">Remaining</TableHead>
							<TableHead className="whitespace-nowrap">Status</TableHead>
							<TableHead className="text-right whitespace-nowrap">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loans.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-16">
									<div className="flex flex-col items-center justify-center space-y-3">
										<Banknote className="h-10 w-10 text-slate-300" />
										<p className="text-sm font-medium text-slate-500">No active loans found.</p>
										<p className="text-xs text-slate-400">Click "Issue New Loan" to create one.</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							loans.map((loan) => {
								const remaining = calculateRemaining(loan);
								return (
									<TableRow key={loan.id}>
										<TableCell className="font-medium whitespace-nowrap">
											{loan.employee.lastName}, {loan.employee.firstName}
										</TableCell>
										<TableCell className="whitespace-nowrap">{format(new Date(loan.dateIssued), "MMM dd, yyyy")}</TableCell>
										<TableCell className="text-right whitespace-nowrap">{formatCurrency(loan.principalAmount)}</TableCell>
										<TableCell className="text-right whitespace-nowrap">{formatCurrency(loan.monthlyDeduction)}</TableCell>
										<TableCell className="text-right font-semibold whitespace-nowrap">
											{formatCurrency(remaining)}
										</TableCell>
										<TableCell>
											<Badge variant={loan.status === "ACTIVE" ? "default" : "secondary"}>
												{loan.status}
											</Badge>
										</TableCell>
										<TableCell className="text-right space-x-2 whitespace-nowrap">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setSelectedLoanForLedger(loan)}
											>
												View Ledger
											</Button>
											{loan.status === "ACTIVE" && (
												<Button
													variant="default"
													size="sm"
													onClick={() => setSelectedLoanForPayment(loan)}
												>
													Record Payment
												</Button>
											)}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{selectedLoanForPayment && (
				<RecordPaymentDialog
					loan={selectedLoanForPayment}
					open={!!selectedLoanForPayment}
					onOpenChange={(open: boolean) => !open && setSelectedLoanForPayment(null)}
				/>
			)}

			{selectedLoanForLedger && (
				<LoanLedgerDialog
					loan={selectedLoanForLedger}
					open={!!selectedLoanForLedger}
					onOpenChange={(open: boolean) => !open && setSelectedLoanForLedger(null)}
				/>
			)}
		</div>
	);
}
