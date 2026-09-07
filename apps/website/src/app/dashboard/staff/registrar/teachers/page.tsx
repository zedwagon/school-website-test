import { getTeachers } from "@school/api/faculty/query";
import { Suspense } from "react";
import TeachersClient from "./_components/teachers-client";

export const metadata = {
  title: "Teacher Directory | MPPSI Portal",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: "active" | "archived";
    page?: string;
  }>;
}

export default async function TeachersPage({ searchParams }: PageProps) {
  const { search, status, page } = await searchParams;
  const currentPage = page ? Number.parseInt(page, 10) || 1 : 1;
  const activeStatus = status === "archived" ? "archived" : "active";

  const result = await getTeachers(search || "", activeStatus, currentPage);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        }
      >
        <TeachersClient
          initialActiveCount={result.activeCount}
          initialArchivedCount={result.archivedCount}
          initialTeachers={result.data || []}
          initialTotalCount={result.totalCount}
        />
      </Suspense>
    </div>
  );
}
