import { getPendingPhysicals } from "@school/api/clinic/query";
import { Suspense } from "react";
import { ClinicDashboard } from "./_components/clinic-dashboard";

export default async function ClinicDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; gradeLevel?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const gradeLevel = params.gradeLevel || "";
  const initialData = await getPendingPhysicals(search, gradeLevel);

  return (
    <div className="p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        }
      >
        <ClinicDashboard
          initialData={initialData.data}
          initialTotalCount={initialData.totalCount}
        />
      </Suspense>
    </div>
  );
}
