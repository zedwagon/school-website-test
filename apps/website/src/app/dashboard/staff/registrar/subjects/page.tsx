import { getSubjects } from "@school/api/subjects/query";
import { Suspense } from "react";
import SubjectsClient from "./_components/subjects-client";

export const metadata = {
  title: "Subject Management | MPPSI Portal",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: "active" | "archived";
    page?: string;
  }>;
}

export default async function SubjectsPage({ searchParams }: PageProps) {
  const { search, status, page } = await searchParams;
  const currentPage = page ? Number.parseInt(page, 10) || 1 : 1;
  const activeStatus = status === "archived" ? "archived" : "active";

  const result = await getSubjects(search || "", activeStatus, currentPage);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        }
      >
        <SubjectsClient
          initialActiveCount={result.activeCount}
          initialArchivedCount={result.archivedCount}
          initialSubjects={result.data}
          initialTotalCount={result.totalCount}
        />
      </Suspense>
    </div>
  );
}
