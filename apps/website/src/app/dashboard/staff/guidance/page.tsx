import { getPendingGuidance } from "@school/api/guidance/query";
import { Suspense } from "react";
import { GuidanceDashboard } from "./_components/guidance-dashboard";

export default async function GuidanceDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; gradeLevel?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const gradeLevel = params.gradeLevel || "";
  const initialData = await getPendingGuidance(search, gradeLevel);

  return (
    <div className="p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        }
      >
        <GuidanceDashboard
          initialData={initialData.data}
          initialTotalCount={initialData.totalCount}
        />
      </Suspense>
    </div>
  );
}
