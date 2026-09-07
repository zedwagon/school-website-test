import { validateRouteSession } from "@school/api/auth/guard";
import { getStudentDashboardData } from "@school/api/students/query";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StudentProfile } from "../../settings/_components/student-profile";

export default async function StudentProfilePage() {
  const auth = await validateRouteSession(["student"]);

  if (!auth.success) {
    redirect("/");
  }

  const studentData = await getStudentDashboardData(auth.user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-gray-900">My Profile</h1>
        <p className="mt-1 text-gray-500">
          Your academic and personal information recorded in the system.
        </p>
      </div>

      <div className="max-w-5xl">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          }
        >
          <StudentProfile initialData={studentData || undefined} />
        </Suspense>
      </div>
    </div>
  );
}
