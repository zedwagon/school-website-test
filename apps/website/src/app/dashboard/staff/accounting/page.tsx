import { getPendingPayments } from "@school/api/accounting/query";
import { Suspense } from "react";
import { AccountingDashboard } from "./_components/accounting-dashboard";

export default async function AccountingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; gradeLevel?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const gradeLevel = params.gradeLevel || "";
  const initialData = await getPendingPayments(search, gradeLevel);

  return (
    <div className="p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        }
      >
        <AccountingDashboard
          initialData={initialData.data}
          initialTotalCount={initialData.totalCount}
        />
      </Suspense>
    </div>
  );
}
