import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@school/db";
import { enrollmentForms, schoolYears, staff, students } from "@school/db";

/**
 * Gets all students pending guidance clearance (status = pending_guidance)
 * Note: Authorization should be handled by the caller
 */
export async function getPendingGuidance(search?: string, gradeLevel?: string) {
  const [activeSY] = await db
    .select()
    .from(schoolYears)
    .where(eq(schoolYears.isActive, true))
    .limit(1);

  if (!activeSY) {
    return { data: [] };
  }

  let filter = and(
    eq(enrollmentForms.schoolYearId, activeSY.id),
    eq(enrollmentForms.statusClinicDone, true),
    eq(enrollmentForms.statusGuidanceDone, false),
    isNull(enrollmentForms.statusNote),
    isNull(enrollmentForms.archivedAt),
    ...(gradeLevel ? [eq(enrollmentForms.gradeLevel, gradeLevel as any)] : [])
  )!;

  const [totalResult] = await db
    .select({ value: count() })
    .from(enrollmentForms)
    .where(filter);

  if (search) {
    filter = and(
      filter,
      or(
        ilike(students.firstName, `%${search}%`),
        ilike(students.lastName, `%${search}%`)
      )
    )!;
  }

  const pending = await db
    .select({
      id: students.id,
      enrollmentFormId: enrollmentForms.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      gradeLevel: enrollmentForms.gradeLevel,
      gender: students.gender,
      statusClinicFinishedAt: enrollmentForms.statusClinicFinishedAt,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .where(filter);

  return { data: pending, totalCount: Number(totalResult.value) };
}

/**
 * Gets all students cleared by guidance
 */
export async function getClearedGuidance(search?: string, gradeLevel?: string) {
  const [activeSY] = await db
    .select()
    .from(schoolYears)
    .where(eq(schoolYears.isActive, true))
    .limit(1);

  if (!activeSY) {
    return { data: [] };
  }

  let filter = and(
    eq(enrollmentForms.schoolYearId, activeSY.id),
    eq(enrollmentForms.statusGuidanceDone, true),
    isNull(enrollmentForms.statusNote),
    isNull(enrollmentForms.archivedAt),
    ...(gradeLevel ? [eq(enrollmentForms.gradeLevel, gradeLevel as any)] : [])
  )!;

  const [totalResult] = await db
    .select({ value: count() })
    .from(enrollmentForms)
    .where(filter);

  if (search) {
    filter = and(
      filter,
      or(
        ilike(students.firstName, `%${search}%`),
        ilike(students.lastName, `%${search}%`)
      )
    )!;
  }

  const cleared = await db
    .select({
      id: students.id,
      enrollmentFormId: enrollmentForms.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      gradeLevel: enrollmentForms.gradeLevel,
      gender: students.gender,
      statusGuidanceFinishedAt: enrollmentForms.statusGuidanceFinishedAt,
      statusGuidanceNote: enrollmentForms.statusGuidanceNote,
      approvedByFirstName: staff.firstName,
      approvedByLastName: staff.lastName,
      statusGuidanceProfile: enrollmentForms.statusGuidanceProfile,
      statusGuidanceNeeds: enrollmentForms.statusGuidanceNeeds,
      statusGuidanceHasDiagnosis: enrollmentForms.statusGuidanceHasDiagnosis,
      fatherName: students.fatherName,
      motherMaidenName: students.motherMaidenName,
      guardianName: enrollmentForms.guardianName,
      guardianRelationship: enrollmentForms.guardianRelationship,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .leftJoin(
      staff,
      eq(enrollmentForms.statusGuidanceApprovedById, staff.userId)
    )
    .where(filter)
    .orderBy(desc(enrollmentForms.statusGuidanceFinishedAt));

  return { data: cleared, totalCount: Number(totalResult.value) };
}

export async function approveGuidanceQuery(
  formId: number,
  approvedById: number,
  notes?: string,
  profile?: any,
  needs?: any,
  hasDiagnosis?: boolean
) {
  await db
    .update(enrollmentForms)
    .set({
      statusGuidanceDone: true,
      statusGuidanceFinishedAt: new Date().toISOString(),
      statusGuidanceNote: notes ?? null,
      statusGuidanceApprovedById: approvedById,
      statusGuidanceProfile: profile ?? null,
      statusGuidanceNeeds: needs ?? null,
      statusGuidanceHasDiagnosis: hasDiagnosis ?? false,
    })
    .where(eq(enrollmentForms.id, formId));
}

export async function updateGuidanceQuery(
  formId: number,
  notes?: string,
  profile?: any,
  needs?: any,
  hasDiagnosis?: boolean
) {
  await db
    .update(enrollmentForms)
    .set({
      statusGuidanceNote: notes ?? null,
      statusGuidanceProfile: profile ?? null,
      statusGuidanceNeeds: needs ?? null,
      statusGuidanceHasDiagnosis: hasDiagnosis ?? false,
    })
    .where(eq(enrollmentForms.id, formId));
}
