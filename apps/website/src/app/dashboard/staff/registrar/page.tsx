import { Suspense } from "react";
import { EnrollmentStats } from "./_components/enrollment-stats";

export default async function RegistrarDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Enrollment Statistics */}
      <div className="mb-8 px-8">
        <h2 className="mb-4 font-semibold text-lg">Enrollment Overview</h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {[...new Array(5)].map((_, i) => (
                <div
                  className="h-32 animate-pulse rounded-xl bg-gray-100"
                  key={i}
                />
              ))}
            </div>
          }
        >
          <EnrollmentStats />
        </Suspense>
      </div>
    </div>
  );
}
