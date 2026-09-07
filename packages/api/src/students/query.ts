"use server";

import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@school/db";
import { enrollmentForms, schoolYears, students, users } from "@school/db";
import { validateActionSession } from "../auth/guard";

/**
 * Gets students list with filters and pagination
 */
export async function getStudents(
  query?: string,
  filterStatus: "active" | "archived" = "active",
  page = 1,
  limit = 10,
  syId?: number,
  gradeLevel?: string
) {
  await validateActionSession(["admin", "staff"]);
  const offset = (page - 1) * limit;

  // Resolve which school year to filter on
  let resolvedSyId = syId;
  if (!resolvedSyId) {
    const [activeSY] = await db
      .select({ id: schoolYears.id })
      .from(schoolYears)
      .where(eq(schoolYears.isActive, true))
      .limit(1);
    resolvedSyId = activeSY?.id;
  }

  const baseFilter =
    filterStatus === "active"
      ? and(isNull(students.archivedAt), isNull(users.archivedAt))
      : or(isNotNull(students.archivedAt), isNotNull(users.archivedAt));

  let searchFilter = query
    ? and(
        baseFilter,
        or(
          ilike(students.lastName, `%${query}%`),
          ilike(students.firstName, `%${query}%`),
          ilike(students.lrn, `%${query}%`),
          ilike(
            sql`concat(${students.firstName}, ' ', ${students.lastName})`,
            `%${query}%`
          ),
          ilike(
            sql`concat(${students.firstName}, ' ', ${students.middleName})`,
            `%${query}%`
          ),
          ilike(
            sql`concat(${students.firstName}, ' ', ${students.middleName}, ' ', ${students.lastName})`,
            `%${query}%`
          )
        )
      )
    : baseFilter;

  if (gradeLevel) {
    searchFilter = and(
      searchFilter,
      eq(enrollmentForms.gradeLevel, gradeLevel as any)
    );
  }

  const [countResult] = await db
    .select({ value: count() })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(
      enrollmentForms,
      resolvedSyId
        ? and(
            eq(enrollmentForms.studentId, students.id),
            eq(enrollmentForms.schoolYearId, resolvedSyId)
          )
        : eq(enrollmentForms.studentId, students.id)
    )
    .where(searchFilter);

  const data = await db
    .select({
      id: students.id,
      userId: students.userId,
      lrn: students.lrn,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      gender: students.gender,
      birthdate: students.birthdate,
      guardianName: enrollmentForms.guardianName,
      guardianContact: enrollmentForms.guardianContact,
      email: users.email,
      gradeLevel: enrollmentForms.gradeLevel,
      isEnrolled: enrollmentForms.isEnrolled,
      statusNote: enrollmentForms.statusNote,
      studentType: enrollmentForms.studentType,
      enrollmentFormId: enrollmentForms.id,
      enrollmentSchoolYearId: enrollmentForms.schoolYearId,
      createdAt: students.createdAt,
      archivedAt: students.archivedAt,
      statusClinicDone: enrollmentForms.statusClinicDone,
      statusGuidanceDone: enrollmentForms.statusGuidanceDone,
      statusAccountingDone: enrollmentForms.statusAccountingDone,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(
      enrollmentForms,
      resolvedSyId
        ? and(
            eq(enrollmentForms.studentId, students.id),
            eq(enrollmentForms.schoolYearId, resolvedSyId)
          )
        : eq(enrollmentForms.studentId, students.id)
    )
    .where(searchFilter)
    .orderBy(desc(students.createdAt))
    .limit(limit)
    .offset(offset);

  let activeFilter = and(isNull(students.archivedAt), isNull(users.archivedAt));
  if (gradeLevel) {
    activeFilter = and(
      activeFilter,
      eq(enrollmentForms.gradeLevel, gradeLevel as any)
    );
  }

  const [activeRes] = await db
    .select({ value: count() })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(
      enrollmentForms,
      resolvedSyId
        ? and(
            eq(enrollmentForms.studentId, students.id),
            eq(enrollmentForms.schoolYearId, resolvedSyId)
          )
        : eq(enrollmentForms.studentId, students.id)
    )
    .where(activeFilter);

  let archivedFilter = or(
    isNotNull(students.archivedAt),
    isNotNull(users.archivedAt)
  );
  if (gradeLevel) {
    archivedFilter = and(
      archivedFilter,
      eq(enrollmentForms.gradeLevel, gradeLevel as any)
    );
  }

  const [archivedRes] = await db
    .select({ value: count() })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(
      enrollmentForms,
      resolvedSyId
        ? and(
            eq(enrollmentForms.studentId, students.id),
            eq(enrollmentForms.schoolYearId, resolvedSyId)
          )
        : eq(enrollmentForms.studentId, students.id)
    )
    .where(archivedFilter);

  return JSON.parse(
    JSON.stringify({
      data,
      totalCount: Number(countResult.value),
      activeCount: Number(activeRes.value),
      archivedCount: Number(archivedRes.value),
    })
  );
}

/**
 * Gets complete student dashboard data for a specific or active school year
 */
export async function getStudentDashboardData(userId: number, syId?: number) {
  // Guard allows the student themselves to see their own data
  const session = await validateActionSession(["admin", "staff", "student"]);

  // If not admin/staff, ensure they are requesting THEIR OWN userId
  if (session.user.role === "student" && session.user.id !== userId) {
    throw new Error("Unauthorized: Access denied to other student data");
  }

  let targetSyId = syId;

  if (!targetSyId) {
    const [activeSY] = await db
      .select({ id: schoolYears.id })
      .from(schoolYears)
      .where(eq(schoolYears.isActive, true))
      .limit(1);
    targetSyId = activeSY?.id;
  }

  if (!targetSyId) return null;

  const result = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      lrn: students.lrn,
      gender: students.gender,
      birthdate: students.birthdate,
      address: students.address,
      fatherName: students.fatherName,
      motherMaidenName: students.motherMaidenName,
      isEnrolled: enrollmentForms.isEnrolled,
      statusClinicDone: enrollmentForms.statusClinicDone,
      statusGuidanceDone: enrollmentForms.statusGuidanceDone,
      statusAccountingDone: enrollmentForms.statusAccountingDone,
      statusAccountingNote: enrollmentForms.statusAccountingNote,
      studentType: enrollmentForms.studentType,
      learnerType: enrollmentForms.learnerType,
      gradeLevel: enrollmentForms.gradeLevel,
      shsTrack: enrollmentForms.shsTrack,
      isEsc: enrollmentForms.isEsc,
      escNumber: enrollmentForms.escNumber,
      isShsVoucher: enrollmentForms.isShsVoucher,
      guardianName: enrollmentForms.guardianName,
      guardianContact: enrollmentForms.guardianContact,
      lastSchoolName: enrollmentForms.lastSchoolName,
      schoolYearName: schoolYears.name,
      isSchoolYearActive: schoolYears.isActive,
    })
    .from(students)
    .leftJoin(
      enrollmentForms,
      and(
        eq(enrollmentForms.studentId, students.id),
        eq(enrollmentForms.schoolYearId, targetSyId)
      )
    )
    .innerJoin(schoolYears, eq(enrollmentForms.schoolYearId, schoolYears.id))
    .where(eq(students.userId, userId))
    .limit(1);

  return result[0] ? JSON.parse(JSON.stringify(result[0])) : null;
}

/**
 * Update student bio-data
 */
export async function updateStudentBioDataQuery(
  id: number,
  data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    birthdate: string;
    gender: "male" | "female";
    lrn?: string;
    fatherName?: string;
    motherMaidenName?: string;
    guardianName?: string;
    guardianContact?: string;
    enrollmentFormId?: number;
  }
) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db.transaction(async (tx) => {
    await tx
      .update(students)
      .set({
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        suffix: data.suffix || null,
        birthdate: data.birthdate,
        gender: data.gender,
        lrn: data.lrn || null,
        fatherName: data.fatherName || null,
        motherMaidenName: data.motherMaidenName || null,
      })
      .where(eq(students.id, id));

    let targetFormId = data.enrollmentFormId;
    if (
      !targetFormId &&
      (data.guardianName !== undefined || data.guardianContact !== undefined)
    ) {
      const [latestForm] = await tx
        .select({ id: enrollmentForms.id })
        .from(enrollmentForms)
        .where(eq(enrollmentForms.studentId, id))
        .orderBy(desc(enrollmentForms.id))
        .limit(1);
      targetFormId = latestForm?.id;
    }

    if (targetFormId) {
      const updateFields: any = {};
      if (data.guardianName !== undefined) {
        updateFields.guardianName = data.guardianName || null;
      }
      if (data.guardianContact !== undefined) {
        updateFields.guardianContact = data.guardianContact || null;
      }

      if (Object.keys(updateFields).length > 0) {
        await tx
          .update(enrollmentForms)
          .set(updateFields)
          .where(eq(enrollmentForms.id, targetFormId));
      }
    }
  });
}

/**
 * Update student ESC number
 */
export async function updateStudentEscNumberQuery(
  id: number,
  escNumber: string | null
) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(enrollmentForms)
    .set({ escNumber })
    .where(eq(enrollmentForms.id, id));
}

/**
 * Reset student password
 */
export async function resetStudentPasswordQuery(
  studentId: number,
  passwordHash: string
) {
  await validateActionSession(["admin", "staff"], "registrar");

  const [student] = await db
    .select({ userId: students.userId })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) {
    throw new Error("Student not found");
  }

  return db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, student.userId));
}

/**
 * Archive a student and their associated user account
 */
export async function archiveStudentQuery(id: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db.transaction(async (tx) => {
    const [student] = await tx
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      throw new Error("Student not found");
    }

    const now = new Date().toISOString();

    await tx
      .update(users)
      .set({ archivedAt: now })
      .where(eq(users.id, student.userId));

    await tx
      .update(students)
      .set({ archivedAt: now })
      .where(eq(students.id, id));
  });
}

/**
 * Restore an archived student and their associated user account
 */
export async function restoreStudentQuery(id: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db.transaction(async (tx) => {
    const [student] = await tx
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      throw new Error("Student not found");
    }

    await tx
      .update(users)
      .set({ archivedAt: null })
      .where(eq(users.id, student.userId));

    await tx
      .update(students)
      .set({ archivedAt: null })
      .where(eq(students.id, id));
  });
}

/**
 * Gets all school years where the student has an enrollment record
 */
export async function getStudentEnrollmentHistory(userId: number) {
  const session = await validateActionSession(["admin", "staff", "student"]);

  if (session.user.role === "student" && session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const history = await db
    .select({
      id: schoolYears.id,
      name: schoolYears.name,
      isActive: schoolYears.isActive,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .innerJoin(schoolYears, eq(enrollmentForms.schoolYearId, schoolYears.id))
    .where(eq(students.userId, userId))
    .orderBy(desc(schoolYears.name));

  return JSON.parse(JSON.stringify(history));
}
