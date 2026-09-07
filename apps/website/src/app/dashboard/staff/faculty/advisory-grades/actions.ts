"use server";

import { validateActionSession } from "@school/api/auth/guard";
import { db, grades, sections, staff } from "@school/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type GradeInput = {
  studentId: number;
  subjectId: number | null;
  grade: string;
  isGeneralAverage: boolean;
};

export async function saveAdvisoryGrades(
  sectionId: number,
  schoolYearId: number,
  gradesPayload: GradeInput[],
) {
  const { user } = await validateActionSession(["admin", "staff"], "faculty");

  // Get the staff ID of the current user
  const staffRecord = await db.query.staff.findFirst({
    where: eq(staff.userId, user.id),
  });

  if (!staffRecord && user.role !== "admin") {
    throw new Error("Unauthorized: Staff record not found");
  }

  // Verify the user is the adviser of this section (or an admin)
  const sectionRecord = await db.query.sections.findFirst({
    where: eq(sections.id, sectionId),
  });

  if (!sectionRecord) {
    throw new Error("Section not found");
  }

  if (user.role !== "admin" && sectionRecord.adviserId !== staffRecord?.id) {
    throw new Error("Unauthorized: You are not the adviser for this section");
  }

  // Process and save grades
  for (const item of gradesPayload) {
    const numericGrade = item.grade ? parseFloat(item.grade) : null;

    // Find existing grade
    const existing = await db.query.grades.findFirst({
      where: and(
        eq(grades.studentId, item.studentId),
        eq(grades.sectionId, sectionId),
        eq(grades.schoolYearId, schoolYearId),
        item.isGeneralAverage
          ? eq(grades.isGeneralAverage, true)
          : eq(grades.subjectId, item.subjectId!),
      ),
    });

    if (numericGrade === null || isNaN(numericGrade)) {
      // If the grade is cleared out, we might want to delete it or set it to null
      if (existing) {
        await db.delete(grades).where(eq(grades.id, existing.id));
      }
      continue;
    }

    if (numericGrade > 100 || numericGrade < 0) {
      throw new Error(
        `Invalid grade: ${numericGrade}. Grades must be between 0 and 100.`,
      );
    }

    if (existing) {
      await db
        .update(grades)
        .set({
          grade: numericGrade.toString(),
          updatedAt: new Date().toISOString(),
          encodedById: user.id,
        })
        .where(eq(grades.id, existing.id));
    } else {
      await db.insert(grades).values({
        studentId: item.studentId,
        subjectId: item.subjectId,
        sectionId,
        schoolYearId,
        grade: numericGrade.toString(),
        isGeneralAverage: item.isGeneralAverage,
        encodedById: user.id,
      });
    }
  }

  revalidatePath(`/dashboard/staff/faculty/advisory-grades/${sectionId}`);
  return { success: true };
}
