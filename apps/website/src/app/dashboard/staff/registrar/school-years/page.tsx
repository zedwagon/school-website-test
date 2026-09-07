import { getSchoolYears } from "@school/api/school-years/query";
import { Suspense } from "react";
import SchoolYearClient from "./_components/school-year-client";

export const metadata = {
  title: "School Years | MPPSI Portal",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function SchoolYearsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status === "archived" ? "archived" : "active";
  const page =
    typeof params.page === "string" ? Number.parseInt(params.page, 10) || 1 : 1;

  const result = await getSchoolYears(search, status, page);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        }
      >
        <SchoolYearClient
          initialActiveCount={result.activeCount ?? 0}
          initialArchivedCount={result.archivedCount ?? 0}
          initialSchoolYears={result.data}
          initialTotalCount={result.totalCount || 0}
        />
      </Suspense>
    </div>
  );
}
