import { getEmployeeLoans } from "@school/api/accounting/loans/query";
import { getAllEmployeesWithContracts } from "@school/api/accounting/payroll/query";
import { LoansClient } from "@/app/dashboard/operational/loans/components/loans-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@school/ui";

import { CreateLoanDialog } from "@/app/dashboard/operational/loans/components/create-loan-dialog";

export const metadata = {
	title: "Loan Management",
};

export default async function LoansPage() {
	const loans = await getEmployeeLoans();
	
	// Fetch all employees to allow creating new loans
	const employeesResult = await getAllEmployeesWithContracts();
	const employees = employeesResult
		.filter((e) => e.contract !== null && e.employee.archivedAt === null && e.employee.type !== "part_time_teaching")
		.map((e) => e.employee);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex flex-col gap-4 sm:flex-row items-start justify-between space-y-0 pb-6">
					<div className="space-y-2 max-w-3xl">
						<CardTitle>Employee Loans & Advances</CardTitle>
						<CardDescription className="leading-relaxed">
							Manage active employee loans, track remaining balances, and record payments. 
							<br/><br/>
							<span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-semibold mr-1.5">NOTE</span>
							While loan deductions are automatically injected into active payrolls as a draft, 
							<strong> you must manually record the payment here</strong> once the payroll is finalized and paid.
						</CardDescription>
					</div>
					<CreateLoanDialog employees={employees} />
				</CardHeader>
				<CardContent>
					<LoansClient initialLoans={loans} employees={employees} />
				</CardContent>
			</Card>
		</div>
	);
}
