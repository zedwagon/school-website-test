import { Suspense } from "react";
import { getAllEmployeesWithContracts } from "@school/api/accounting/payroll/query";
import { ContractsClient } from "./_components/contracts-client";
import { ContractsHeaderActions } from "./_components/contracts-header-actions";
import { Skeleton, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@school/ui";

export const metadata = {
  title: "Employee Contracts",
};

export default async function ContractsPage() {
  const employeeRecords = await getAllEmployeesWithContracts();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Employee Contracts</h2>
        <ContractsHeaderActions />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contracts Management</CardTitle>
          <CardDescription>
            Manage employee base salaries, allowances, and standard fixed deductions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ContractsClient records={employeeRecords} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
