import { validateRouteSession } from "@school/api/auth/guard";
import { getActiveSchoolYear } from "@school/api/school-years/query";
import { db, grades, students, subjects } from "@school/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await validateRouteSession(["student", "admin"]);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const activeSy = await getActiveSchoolYear();
  if (!activeSy) {
    return NextResponse.json(
      { error: "No active school year" },
      { status: 400 },
    );
  }

  const studentRecord = await db.query.students.findFirst({
    where: eq(students.userId, auth.user.id),
  });

  if (!studentRecord) {
    return NextResponse.json(
      { error: "Student record not found" },
      { status: 404 },
    );
  }

  const myGrades = await db
    .select({
      gradeId: grades.id,
      gradeValue: grades.grade,
      isGeneralAverage: grades.isGeneralAverage,
      remarks: grades.remarks,
      subjectName: subjects.name,
      subjectCode: subjects.code,
    })
    .from(grades)
    .leftJoin(subjects, eq(grades.subjectId, subjects.id))
    .where(
      and(
        eq(grades.studentId, studentRecord.id),
        eq(grades.schoolYearId, activeSy.id),
      ),
    );

  return NextResponse.json({
    schoolYear: activeSy,
    grades: myGrades,
  });
}
