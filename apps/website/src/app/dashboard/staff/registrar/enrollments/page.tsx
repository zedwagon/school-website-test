import { getSession } from "@school/api/auth/session";
import {
  getDroppedTransferredStudents,
  getEnrolledStudents,
  getPendingEnrollments,
} from "@school/api/enrollment/query";
import {
  getActiveSchoolYear,
  getSchoolYears,
} from "@school/api/school-years/query";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import EnrollmentListClient from "./_components/enrollment-list-client";

export const metadata = {
  title: "Enrollment | MPPSI Portal",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    tab?: string;
    sy?: string;
  }>;
}

export default async function EnrollmentPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  const params = await searchParams;
  const { search, page, sy } = params;
  const currentPage = page ? Number.parseInt(page, 10) || 1 : 1;
  const syId = sy ? Number.parseInt(sy, 10) || undefined : undefined;

  const activeSY = await getActiveSchoolYear();
  const resolvedSyId = syId ?? activeSY?.id;

  const [pendingResult, syResult, enrolledResult, droppedResult] =
    await Promise.all([
      getPendingEnrollments(search, currentPage, 10, resolvedSyId),
      getSchoolYears(undefined, "active", 1, 100),
      getEnrolledStudents(search, currentPage, 10, resolvedSyId),
      droppedResultPromise(resolvedSyId, search),
    ]);

  async function droppedResultPromise(
    syId: number | undefined,
    query: string | undefined,
  ) {
    if (!syId) return { data: [], count: 0 };
    return getDroppedTransferredStudents(syId, query);
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        }
      >
        <EnrollmentListClient
          currentUserDepartment={session.user.staffDepartment || undefined}
          currentUserRole={session.user.role}
          initialActiveSY={activeSY}
          initialDroppedCount={droppedResult.count}
          initialDroppedStudents={droppedResult.data}
          initialEnrolledCount={enrolledResult.totalCount}
          initialEnrolledStudents={enrolledResult.data}
          initialPendingEnrollments={pendingResult.data}
          initialSchoolYears={syResult.data}
        />
      </Suspense>
    </div>
  );
}
