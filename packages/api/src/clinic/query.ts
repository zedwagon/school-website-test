import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@school/db";
import { enrollmentForms, schoolYears, staff, students } from "@school/db";

/**
 * Gets all students pending physical exam (status = pending_physical)
 * Note: Authorization should be handled by the caller
 */
export async function getPendingPhysicals(
  search?: string,
  gradeLevel?: string
) {
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
    eq(enrollmentForms.statusClinicDone, false),
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
      birthdate: students.birthdate,
      submittedAt: enrollmentForms.assistedAt,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .where(filter);

  return { data: pending, totalCount: Number(totalResult.value) };
}

/**
 * Gets all students cleared by clinic
 */
export async function getClearedPhysicals(
  search?: string,
  gradeLevel?: string
) {
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
      birthdate: students.birthdate,
      statusClinicFinishedAt: enrollmentForms.statusClinicFinishedAt,
      statusClinicNote: enrollmentForms.statusClinicNote,
      statusClinicMedicalHistory: enrollmentForms.statusClinicMedicalHistory,
      approvedByFirstName: staff.firstName,
      approvedByLastName: staff.lastName,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .leftJoin(staff, eq(enrollmentForms.statusClinicApprovedById, staff.userId))
    .where(filter)
    .orderBy(desc(enrollmentForms.statusClinicFinishedAt));

  return { data: cleared, totalCount: Number(totalResult.value) };
}

export async function approvePhysicalQuery(
  formId: number,
  approvedById: number,
  notes?: string,
  medicalHistory?: any
) {
  await db
    .update(enrollmentForms)
    .set({
      statusClinicDone: true,
      statusClinicFinishedAt: new Date().toISOString(),
      statusClinicNote: notes ?? null,
      statusClinicMedicalHistory: medicalHistory ?? null,
      statusClinicApprovedById: approvedById,
    })
    .where(eq(enrollmentForms.id, formId));
}

export async function updatePhysicalQuery(
  formId: number,
  notes?: string,
  medicalHistory?: any
) {
  await db
    .update(enrollmentForms)
    .set({
      statusClinicNote: notes ?? null,
      statusClinicMedicalHistory: medicalHistory ?? null,
    })
    .where(eq(enrollmentForms.id, formId));
}
