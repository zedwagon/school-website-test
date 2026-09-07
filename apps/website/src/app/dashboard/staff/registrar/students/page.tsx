import {
  getActiveSchoolYear,
  getSchoolYears,
} from "@school/api/school-years/query";
import { getStudents } from "@school/api/students/query";
import { Suspense } from "react";
import StudentsClient from "./_components/students-client";

export const metadata = {
  title: "Student Directory | MPPSI Portal",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: "active" | "archived";
    page?: string;
    sy?: string;
    gradeLevel?: string;
  }>;
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { search, status, page, sy, gradeLevel } = params;
  const currentPage = page ? Number.parseInt(page, 10) || 1 : 1;
  const activeStatus = status === "archived" ? "archived" : "active";

  const schoolYearsResult = await getSchoolYears("", "active", 1, 100);
  const schoolYearsList = schoolYearsResult.data || [];

  let currentSyId = sy ? Number.parseInt(sy, 10) || undefined : undefined;
  if (!currentSyId) {
    const activeSY = await getActiveSchoolYear();
    currentSyId = activeSY?.id;
  }

  const result = await getStudents(
    search || "",
    activeStatus,
    currentPage,
    10,
    currentSyId,
    gradeLevel,
  );

  return (
    <div className="mx-auto max-w-7xl p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        }
      >
        <StudentsClient
          currentSyId={currentSyId}
          initialActiveCount={result.activeCount}
          initialArchivedCount={result.archivedCount}
          initialStudents={result.data}
          initialTotalCount={result.totalCount}
          schoolYears={schoolYearsList}
        />
      </Suspense>
    </div>
  );
}
