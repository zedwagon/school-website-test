import {
  getActiveSchoolYear,
  getSchoolYears,
} from "@school/api/school-years/query";
import { getActiveStaff, getSections } from "@school/api/sections/query";
import { Suspense } from "react";

import SectionsClient from "./_components/sections-client";

export const metadata = {
  title: "Class Builder | MPPSI Portal",
};

interface SectionsPageProps {
  searchParams: Promise<{
    sy?: string;
    search?: string;
    status?: "active" | "archived";
    page?: string;
  }>;
}

export default async function SectionsPage({
  searchParams,
}: SectionsPageProps) {
  const params = await searchParams;
  const { search = "", status, page: pageStr } = params;
  const page =
    typeof pageStr === "string" ? Number.parseInt(pageStr, 10) || 1 : 1;
  const activeStatus = status === "archived" ? "archived" : "active";

  const [syResult, staff, activeSY] = await Promise.all([
    getSchoolYears(undefined, "active", 1, 100),
    getActiveStaff(),
    getActiveSchoolYear(),
  ]);

  const schoolYears = syResult.data || [];

  // Use searchParam sy, or default to active school year, then first available
  const paramSyId = params.sy ? Number.parseInt(params.sy, 10) : undefined;
  const selectedSyId =
    paramSyId ??
    activeSY?.id ??
    (schoolYears.length > 0 ? schoolYears[0].id : undefined);

  const result = await getSections(selectedSyId, search, activeStatus, page);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        }
      >
        <SectionsClient
          initialActiveCount={result.activeCount}
          initialArchivedCount={result.archivedCount}
          initialSections={result.data || []}
          initialTotalCount={result.totalCount || 0}
          schoolYears={schoolYears}
          staff={staff}
        />
      </Suspense>
    </div>
  );
}
