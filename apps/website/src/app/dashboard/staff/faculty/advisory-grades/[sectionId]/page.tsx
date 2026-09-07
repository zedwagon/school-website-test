import { validateRouteSession } from "@school/api/auth/guard";
import { getActiveSchoolYear } from "@school/api/school-years/query";
import {
  classSchedules,
  db,
  enrollmentForms,
  sectionRosters,
  sections,
  staff,
  students,
  subjects,
} from "@school/db";
import { eq } from "drizzle-orm";
import { ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdvisoryGradeTable from "../_components/advisory-grade-table";

export const metadata = {
  title: "Section Grades | MPPSI Portal",
};

interface SectionGradesPageProps {
  params: Promise<{
    sectionId: string;
  }>;
}

export default async function SectionGradesPage({
  params,
}: SectionGradesPageProps) {
  const { sectionId: sectionIdStr } = await params;
  const sectionId = parseInt(sectionIdStr, 10);

  if (isNaN(sectionId)) {
    redirect("/dashboard/staff/faculty/advisory-grades");
  }

  const auth = await validateRouteSession(["admin", "staff"], "faculty");

  if (!auth.success) {
    redirect("/login");
  }

  const activeSy = await getActiveSchoolYear();
  if (!activeSy) {
    redirect("/dashboard/staff/faculty/advisory-grades");
  }

  const staffRecord = await db.query.staff.findFirst({
    where: eq(staff.userId, auth.user.id),
  });

  const section = await db.query.sections.findFirst({
    where: eq(sections.id, sectionId),
  });

  if (!section) {
    redirect("/dashboard/staff/faculty/advisory-grades");
  }

  if (auth.user.role !== "admin" && section.adviserId !== staffRecord?.id) {
    redirect("/dashboard/staff/faculty/advisory-grades");
  }

  // Fetch students in this section
  const rosterRecords = await db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(sectionRosters)
    .innerJoin(
      enrollmentForms,
      eq(sectionRosters.enrollmentId, enrollmentForms.id),
    )
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .where(eq(sectionRosters.sectionId, sectionId))
    .orderBy(students.lastName, students.firstName);

  // Fetch subjects for this section via classSchedules
  const scheduleRecords = await db
    .select({
      subjectId: subjects.id,
      subjectName: subjects.name,
      subjectCode: subjects.code,
    })
    .from(classSchedules)
    .innerJoin(subjects, eq(classSchedules.subjectId, subjects.id))
    .where(eq(classSchedules.sectionId, sectionId));

  // Deduplicate subjects (a section might have multiple schedules for the same subject)
  const uniqueSubjectsMap = new Map();
  for (const s of scheduleRecords) {
    if (!uniqueSubjectsMap.has(s.subjectId)) {
      uniqueSubjectsMap.set(s.subjectId, s);
    }
  }
  const sectionSubjects = Array.from(uniqueSubjectsMap.values());

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            className="group mb-6 flex w-fit items-center text-xs font-semibold uppercase tracking-widest text-zinc-400 transition-colors hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400"
            href="/dashboard/staff/faculty/advisory-grades"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Advisory Sections
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {section.name} Grades
              </h1>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                Manage final grades and performance for your advisory section.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              School Year
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {activeSy.name}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/20 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none overflow-hidden">
        <AdvisoryGradeTable
          schoolYearId={activeSy.id}
          sectionId={sectionId}
          students={rosterRecords}
          subjects={sectionSubjects}
        />
      </div>
    </div>
  );
}
