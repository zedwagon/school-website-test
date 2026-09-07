import { Suspense } from "react";
import { getPayrollPeriods, getPayrollsByPeriod } from "@school/api/accounting/payroll/query";
import { PayrollClient } from "./_components/payroll-client";
import { PayrollTable } from "./_components/payroll-table";
import { Skeleton, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@school/ui";

export const metadata = {
  title: "Employee Payroll",
};

export default async function PayrollPage({ searchParams }: { searchParams: Promise<{ periodId?: string }> }) {
  const periods = await getPayrollPeriods();
  const { periodId: rawPeriodId } = await searchParams;
  const periodId = rawPeriodId ? parseInt(rawPeriodId, 10) : periods[0]?.id;
  
  let payrolls: any[] = [];
  if (periodId) {
    payrolls = await getPayrollsByPeriod(periodId);
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Employee Payroll</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Management</CardTitle>
          <CardDescription>
            Manage employee payroll periods, generate earnings and deductions, and calculate net pay.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PayrollClient periods={periods} initialPeriodId={periodId} />
          
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />} key={periodId}>
            {periodId ? (
              <PayrollTable periodId={periodId} initialPayrolls={payrolls} isFinalized={periods.find(p => p.id === periodId)?.status !== "DRAFT"} />
            ) : (
              <div className="text-center py-10 text-muted-foreground border rounded-md">
                Create a payroll period to get started.
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
