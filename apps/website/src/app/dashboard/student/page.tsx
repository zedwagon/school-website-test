import { Suspense } from "react";
import { StudentDashboard } from "./_components/student-dashboard";

export default async function StudentDashboardPage() {
  return (
    <div className="p-8">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        }
      >
        <StudentDashboard />
      </Suspense>
    </div>
  );
}
