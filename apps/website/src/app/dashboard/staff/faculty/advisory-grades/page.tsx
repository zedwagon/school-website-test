import { validateRouteSession } from "@school/api/auth/guard";
import { getActiveSchoolYear } from "@school/api/school-years/query";
import { db, sections, staff } from "@school/db";
import { eq } from "drizzle-orm";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Advisory Grades | MPPSI Portal",
};

export default async function AdvisoryGradesPage() {
  const auth = await validateRouteSession(["admin", "staff"], "faculty");

  if (!auth.success) {
    redirect("/login");
  }

  // Get the staff record for the current user
  const staffRecord = await db.query.staff.findFirst({
    where: eq(staff.userId, auth.user.id),
  });

  if (!staffRecord && auth.user.role !== "admin") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Staff record not found.</p>
      </div>
    );
  }

  const activeSy = await getActiveSchoolYear();

  if (!activeSy) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-zinc-500">No active school year found.</p>
      </div>
    );
  }

  // Find sections where this staff is the adviser for the active school year
  let assignedSections: Awaited<ReturnType<typeof db.query.sections.findMany>> =
    [];

  if (auth.user.role === "admin") {
    // Admins see all sections for the active SY
    assignedSections = await db.query.sections.findMany({
      where: eq(sections.schoolYearId, activeSy.id),
      orderBy: (sections, { asc }) => [
        asc(sections.gradeLevel),
        asc(sections.name),
      ],
    });
  } else if (staffRecord) {
    assignedSections = await db.query.sections.findMany({
      where: (sections, { and, eq }) =>
        and(
          eq(sections.adviserId, staffRecord.id),
          eq(sections.schoolYearId, activeSy.id),
        ),
      orderBy: (sections, { asc }) => [
        asc(sections.gradeLevel),
        asc(sections.name),
      ],
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Advisory Grades
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Manage final numerical grades for your advisory sections.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {assignedSections.length === 0 ? (
          <div className="col-span-full rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <Users className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No Advisory Sections
            </h3>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              You have not been assigned as an adviser to any sections for the
              active school year ({activeSy.name}).
            </p>
          </div>
        ) : (
          assignedSections.map((section) => (
            <Link
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-red-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              href={`/dashboard/staff/faculty/advisory-grades/${section.id}`}
              key={section.id}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {section.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {section.gradeLevel.replace("_", " ").toUpperCase()}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-red-50 dark:bg-zinc-800 dark:group-hover:bg-red-950/50">
                  <ChevronRight className="h-5 w-5 text-zinc-500 transition-colors group-hover:text-red-600 dark:text-zinc-400 dark:group-hover:text-red-400" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
