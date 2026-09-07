"use server";

import {
  aliasedTable,
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
import {
  classSchedules,
  enrollmentForms,
  schoolYears,
  sectionRosters,
  sections,
  staff,
  students,
  users,
} from "@school/db";
import { validateActionSession } from "../auth/guard";

/**
 * Gets enrollment statistics for registrar dashboard
 */
export async function getEnrollmentStats() {
  await validateActionSession(["admin", "staff"]);
  const activeSY = await db
    .select()
    .from(schoolYears)
    .where(eq(schoolYears.isActive, true))
    .limit(1);

  if (!activeSY.length) {
    return {
      data: {
        total: 0,
        pendingPhysical: 0,
        pendingPayment: 0,
        enrolled: 0,
      },
    };
  }

  const syId = activeSY[0].id;

  const [totalStudents] = await db
    .select({ count: count() })
    .from(enrollmentForms)
    .where(
      and(
        eq(enrollmentForms.schoolYearId, syId),
        isNull(enrollmentForms.statusNote),
        isNull(enrollmentForms.archivedAt)
      )
    );

  const [pendingPhysical] = await db
    .select({ count: count() })
    .from(enrollmentForms)
    .where(
      and(
        eq(enrollmentForms.schoolYearId, syId),
        eq(enrollmentForms.statusClinicDone, false),
        isNull(enrollmentForms.statusNote),
        isNull(enrollmentForms.archivedAt)
      )
    );

  const [pendingPayment] = await db
    .select({ count: count() })
    .from(enrollmentForms)
    .where(
      and(
        eq(enrollmentForms.schoolYearId, syId),
        eq(enrollmentForms.statusGuidanceDone, true),
        eq(enrollmentForms.statusAccountingDone, false),
        isNull(enrollmentForms.statusNote),
        isNull(enrollmentForms.archivedAt)
      )
    );

  const [enrolled] = await db
    .select({ count: count() })
    .from(enrollmentForms)
    .where(
      and(
        eq(enrollmentForms.schoolYearId, syId),
        eq(enrollmentForms.isEnrolled, true),
        isNull(enrollmentForms.archivedAt)
      )
    );

  return {
    data: {
      total: totalStudents.count,
      pendingPhysical: pendingPhysical.count,
      pendingPayment: pendingPayment.count,
      enrolled: enrolled.count,
    },
  };
}

/**
 * Gets detailed enrollment form for a student
 */
export async function getStudentEnrollmentDetails(
  studentId: number,
  syId?: number
) {
  await validateActionSession(["admin", "staff"]);
  const result = await db
    .select({
      student: students,
      form: enrollmentForms,
    })
    .from(students)
    .leftJoin(
      enrollmentForms,
      syId
        ? and(
            eq(students.id, enrollmentForms.studentId),
            eq(enrollmentForms.schoolYearId, syId)
          )
        : eq(students.id, enrollmentForms.studentId)
    )
    .where(eq(students.id, studentId))
    .orderBy(desc(enrollmentForms.id));

  if (result.length === 0) {
    return { error: "Student not found" };
  }

  const { student, form } = result[0];

  const data = {
    ...student,
    parentName: form?.guardianName ?? null,
    parentContact: form?.guardianContact ?? null,
    fatherName: student.fatherName,
    motherMaidenName: student.motherMaidenName,
    ...(form || {}),
    id: student.id,
    enrollmentFormId: form?.id,
    isEsc: form?.isEsc ?? false,
    escNumber: form?.escNumber ?? null,
    isShsVoucher: form?.isShsVoucher ?? false,
  };

  return JSON.parse(JSON.stringify({ data, error: undefined }));
}

/**
 * Gets an enrollment form by its ID
 */
export async function getEnrollmentFormById(formId: number) {
  await validateActionSession(["admin", "staff"]);
  const [form] = await db
    .select()
    .from(enrollmentForms)
    .where(eq(enrollmentForms.id, formId));
  return form ? JSON.parse(JSON.stringify(form)) : null;
}

/**
 * Gets pending enrollments (not yet fully enrolled)
 */
export async function getPendingEnrollments(
  query?: string,
  page = 1,
  limit = 10,
  syId?: number
) {
  await validateActionSession(["admin", "staff"]);
  const offset = (page - 1) * limit;

  // Resolve school year — default to active
  let resolvedSyId = syId;
  if (!resolvedSyId) {
    const [activeSY] = await db
      .select({ id: schoolYears.id })
      .from(schoolYears)
      .where(eq(schoolYears.isActive, true))
      .limit(1);
    resolvedSyId = activeSY?.id;
  }

  let conditions = and(
    eq(enrollmentForms.isEnrolled, false),
    isNull(enrollmentForms.statusNote),
    isNull(enrollmentForms.archivedAt),
    ...(resolvedSyId ? [eq(enrollmentForms.schoolYearId, resolvedSyId)] : [])
  )!;

  if (query) {
    conditions = and(
      conditions,
      or(
        ilike(students.firstName, `%${query}%`),
        ilike(students.lastName, `%${query}%`),
        ilike(students.lrn, `%${query}%`)
      )
    )!;
  }

  const [countResult] = await db
    .select({ value: count() })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .where(conditions);

  const staffClinic = aliasedTable(staff, "staff_clinic");
  const staffGuidance = aliasedTable(staff, "staff_guidance");
  const staffAccounting = aliasedTable(staff, "staff_accounting");

  const pending = await db
    .select({
      id: enrollmentForms.id,
      studentId: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      gradeLevel: enrollmentForms.gradeLevel,
      learnerType: enrollmentForms.learnerType,
      shsTrack: enrollmentForms.shsTrack,
      status: enrollmentForms.isEnrolled,
      statusNote: enrollmentForms.statusNote,
      studentType: enrollmentForms.studentType,
      submittedAt: enrollmentForms.assistedAt,
      lrn: students.lrn,
      email: users.email,
      statusClinicDone: enrollmentForms.statusClinicDone,
      statusGuidanceDone: enrollmentForms.statusGuidanceDone,
      statusAccountingDone: enrollmentForms.statusAccountingDone,
      statusClinicNote: enrollmentForms.statusClinicNote,
      statusGuidanceNote: enrollmentForms.statusGuidanceNote,
      statusAccountingNote: enrollmentForms.statusAccountingNote,
      statusClinicApprovedByName: sql<string>`case when ${staffClinic.id} is not null then concat(${staffClinic.firstName}, ' ', ${staffClinic.lastName}) when ${enrollmentForms.statusClinicApprovedById} is not null then 'Admin' else null end`,
      statusGuidanceApprovedByName: sql<string>`case when ${staffGuidance.id} is not null then concat(${staffGuidance.firstName}, ' ', ${staffGuidance.lastName}) when ${enrollmentForms.statusGuidanceApprovedById} is not null then 'Admin' else null end`,
      statusAccountingApprovedByName: sql<string>`case when ${staffAccounting.id} is not null then concat(${staffAccounting.firstName}, ' ', ${staffAccounting.lastName}) when ${enrollmentForms.statusAccountingApprovedById} is not null then 'Admin' else null end`,
      isAssigned: sql<boolean>`case when ${sectionRosters.id} is not null then true else false end`,
      sectionName: sections.name,
      assistedByFirstName: sql<string>`case when ${staff.id} is not null then ${staff.firstName} when ${enrollmentForms.assistedById} is not null then 'Admin' else null end`,
      assistedByLastName: sql<string>`case when ${staff.id} is not null then ${staff.lastName} else '' end`,
      assistedAt: enrollmentForms.assistedAt,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(staff, eq(enrollmentForms.assistedById, staff.userId))
    .leftJoin(
      staffClinic,
      eq(enrollmentForms.statusClinicApprovedById, staffClinic.userId)
    )
    .leftJoin(
      staffGuidance,
      eq(enrollmentForms.statusGuidanceApprovedById, staffGuidance.userId)
    )
    .leftJoin(
      staffAccounting,
      eq(enrollmentForms.statusAccountingApprovedById, staffAccounting.userId)
    )
    .leftJoin(
      sectionRosters,
      and(
        eq(enrollmentForms.id, sectionRosters.enrollmentId),
        isNull(sectionRosters.archivedAt)
      )
    )
    .leftJoin(sections, eq(sectionRosters.sectionId, sections.id))
    .where(conditions)
    .orderBy(desc(enrollmentForms.createdAt))
    .limit(limit)
    .offset(offset);

  return JSON.parse(
    JSON.stringify({
      data: pending,
      totalCount: Number(countResult.value),
    })
  );
}

/**
 * Gets fully enrolled students
 */
export async function getEnrolledStudents(
  query?: string,
  page = 1,
  limit = 10,
  syId?: number
) {
  await validateActionSession(["admin", "staff"]);
  const offset = (page - 1) * limit;

  // Resolve school year — default to active
  let resolvedSyId = syId;
  if (!resolvedSyId) {
    const [activeSY] = await db
      .select({ id: schoolYears.id })
      .from(schoolYears)
      .where(eq(schoolYears.isActive, true))
      .limit(1);
    resolvedSyId = activeSY?.id;
  }

  let conditions = and(
    eq(enrollmentForms.isEnrolled, true),
    isNull(enrollmentForms.archivedAt),
    ...(resolvedSyId ? [eq(enrollmentForms.schoolYearId, resolvedSyId)] : [])
  )!;

  if (query) {
    conditions = and(
      conditions,
      or(
        ilike(students.firstName, `%${query}%`),
        ilike(students.lastName, `%${query}%`),
        ilike(students.lrn, `%${query}%`)
      )
    )!;
  }

  const [countResult] = await db
    .select({ value: count() })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .where(conditions);

  const enrolled = await db
    .select({
      id: enrollmentForms.id,
      studentId: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      gradeLevel: enrollmentForms.gradeLevel,
      learnerType: enrollmentForms.learnerType,
      shsTrack: enrollmentForms.shsTrack,
      studentType: enrollmentForms.studentType,
      isEsc: enrollmentForms.isEsc,
      escNumber: enrollmentForms.escNumber,
      statusRegistrarNote: enrollmentForms.statusRegistrarNote,
      lrn: students.lrn,
      email: users.email,
      enrolledAt: enrollmentForms.createdAt,
      isAssigned: sql<boolean>`case when ${sectionRosters.id} is not null then true else false end`,
      sectionName: sections.name,
      assistedByFirstName: staff.firstName,
      assistedByLastName: staff.lastName,
      assistedAt: enrollmentForms.assistedAt,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .leftJoin(staff, eq(enrollmentForms.assistedById, staff.userId))
    .leftJoin(
      sectionRosters,
      and(
        eq(enrollmentForms.id, sectionRosters.enrollmentId),
        isNull(sectionRosters.archivedAt)
      )
    )
    .leftJoin(sections, eq(sectionRosters.sectionId, sections.id))
    .where(conditions)
    .orderBy(desc(enrollmentForms.createdAt))
    .limit(limit)
    .offset(offset);

  return JSON.parse(
    JSON.stringify({
      data: enrolled,
      totalCount: Number(countResult.value),
    })
  );
}

/**
 * Gets students who dropped or transferred
 */
export async function getDroppedTransferredStudents(
  schoolYearId: number,
  search?: string
) {
  await validateActionSession(["admin", "staff"]);
  const conditions = [
    eq(enrollmentForms.schoolYearId, schoolYearId),
    eq(enrollmentForms.isEnrolled, false),
    isNotNull(enrollmentForms.statusNote),
  ];

  if (search) {
    conditions.push(
      or(
        ilike(students.firstName, `%${search}%`),
        ilike(students.lastName, `%${search}%`),
        ilike(students.lrn, `%${search}%`)
      ) as import("drizzle-orm").SQL
    );
  }

  const records = await db
    .select({
      id: enrollmentForms.id,
      studentId: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      gradeLevel: enrollmentForms.gradeLevel,
      studentType: enrollmentForms.studentType,
      lrn: students.lrn,
      email: users.email,
      statusNote: enrollmentForms.statusNote,
      exitAt: enrollmentForms.exitAt,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(enrollmentForms.exitAt));

  return JSON.parse(
    JSON.stringify({
      data: records,
      count: records.length,
    })
  );
}

/**
 * Approves an enrollment form (final step)
 */
export async function approveEnrollmentQuery(formId: number, notes?: string) {
  const { user } = await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(enrollmentForms)
    .set({
      isEnrolled: true,
      statusNote: null,
      statusRegistrarNote: notes ?? null,
      statusRegistrarApprovedById: user.id,
    })
    .where(eq(enrollmentForms.id, formId));
}

/**
 * Updates the registrar note of an enrollment form
 */
export async function updateRegistrarNoteQuery(
  enrollmentId: number,
  note: string | null
) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(enrollmentForms)
    .set({
      statusRegistrarNote: note ?? null,
    })
    .where(eq(enrollmentForms.id, enrollmentId));
}

/**
 * Updates enrollment status (dropped, transferred, enrolled)
 */
export async function updateEnrollmentStatusQuery(
  enrollmentId: number,
  isEnrolled: boolean,
  statusNote: string | null
) {
  const { user } = await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(enrollmentForms)
    .set({
      isEnrolled,
      statusNote,
      statusRegistrarApprovedById: user.id,
      exitAt: isEnrolled ? null : new Date().toISOString(),
    })
    .where(eq(enrollmentForms.id, enrollmentId));
}

/**
 * Searches for an existing student by LRN or name (Enrollment Wizard search)
 */
export async function searchStudentsQuery(query: string) {
  await validateActionSession(["admin", "staff"]);
  const trim = query.trim();
  const result = await db
    .select({
      id: students.id,
      lrn: students.lrn,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      birthdate: students.birthdate,
      gender: students.gender,
      address: students.address,
      zipCode: students.zipCode,
      fatherName: students.fatherName,
      motherMaidenName: students.motherMaidenName,
      psaBirthCertNo: students.psaBirthCertNo,
      email: users.email,
      archivedAt: students.archivedAt,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(
      or(
        ilike(students.lrn, `%${trim}%`),
        ilike(students.firstName, `%${trim}%`),
        ilike(students.lastName, `%${trim}%`),
        ilike(
          sql`concat(${students.firstName}, ' ', ${students.lastName})`,
          `%${trim}%`
        ),
        ilike(
          sql`concat(${students.firstName}, ' ', ${students.middleName}, ' ', ${students.lastName})`,
          `%${trim}%`
        )
      )
    )
    .limit(8);

  return JSON.parse(JSON.stringify(result));
}

/**
 * Transactional Enrollment Wizard:
 * 1. Creates a new student record (with User account) if studentId is missing.
 * 2. Creates an enrollment form for the student.
 */
export async function enrollStudentQuery(data: {
  studentId?: number;
  newUser?: {
    email: string;
    passwordHash: string;
  };
  newStudent?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    birthdate: string;
    gender: "male" | "female";
    lrn?: string;
    fatherName?: string;
    motherMaidenName?: string;
    psaBirthCertNo?: string;
    address?: string;
    zipCode?: string;
  };
  form: {
    schoolYearId: number;
    gradeLevel: any;
    studentType: any;
    learnerType: any;
    shsTrack?: any;
    guardianName?: string;
    guardianContact?: string;
    guardianRelationship?: string;
    lastGradeLevelCompleted?: string;
    lastSchoolYearCompleted?: string;
    lastSchoolName?: string;
    lastSchoolId?: string;
    lastSchoolAddress?: string;
    isEsc?: boolean;
    escNumber?: string;
    isShsVoucher?: boolean;
  };
}) {
  const { user } = await validateActionSession(
    ["admin", "staff"],
    ["registrar", "faculty"]
  );
  let studentId = data.studentId;
  const now = new Date().toISOString();

  // 1. Pre-check for existing email/user if creating new student
  if (!studentId && data.newUser?.email) {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.newUser.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("A user with this email already exists in the system.");
    }
  }

  // 2. Pre-check for existing LRN if provided
  if (!studentId && data.newStudent?.lrn) {
    const existingStudent = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.lrn, data.newStudent.lrn))
      .limit(1);

    if (existingStudent.length > 0) {
      throw new Error(
        `Student with LRN ${data.newStudent.lrn} is already registered.`
      );
    }
  }

  return db.transaction(async (tx) => {
    // Create new student/user if needed
    if (!studentId && data.newUser && data.newStudent) {
      const [user] = await tx
        .insert(users)
        .values({
          email: data.newUser.email,
          passwordHash: data.newUser.passwordHash,
          role: "student",
        })
        .returning({ id: users.id });

      const [student] = await tx
        .insert(students)
        .values({
          userId: user.id,
          ...data.newStudent,
          gender: data.newStudent.gender as any,
        })
        .returning({ id: students.id });

      studentId = student.id;
    }

    if (!studentId) {
      throw new Error("Student ID is required for enrollment");
    }

    // Check for duplicate form
    const existing = await tx
      .select({ id: enrollmentForms.id })
      .from(enrollmentForms)
      .where(
        and(
          eq(enrollmentForms.studentId, studentId),
          eq(enrollmentForms.schoolYearId, data.form.schoolYearId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Enrollment form already exists for this school year");
    }

    // Insert form
    return tx.insert(enrollmentForms).values({
      studentId,
      schoolYearId: data.form.schoolYearId,
      gradeLevel: data.form.gradeLevel,
      studentType: data.form.studentType,
      learnerType: data.form.learnerType,
      shsTrack: data.form.shsTrack,
      guardianName: data.form.guardianName,
      guardianContact: data.form.guardianContact,
      guardianRelationship: data.form.guardianRelationship,
      lastGradeLevelCompleted: data.form.lastGradeLevelCompleted,
      lastSchoolYearCompleted: data.form.lastSchoolYearCompleted,
      lastSchoolName: data.form.lastSchoolName,
      lastSchoolId: data.form.lastSchoolId,
      lastSchoolAddress: data.form.lastSchoolAddress,
      isEsc: data.form.isEsc ?? false,
      escNumber: data.form.isEsc ? data.form.escNumber : null,
      isShsVoucher: data.form.isShsVoucher ?? false,
      isEnrolled: false,
      assistedById: user.id,
      assistedAt: now,
    });
  });
}

/**
 * Updates clearance status for various stations (Clinic, Guidance, Accounting, Registrar)
 */
export async function updateClearanceStatusQuery(
  formId: number,
  data: Partial<typeof enrollmentForms.$inferSelect>
) {
  await validateActionSession(["admin", "staff"]);
  return db
    .update(enrollmentForms)
    .set(data)
    .where(eq(enrollmentForms.id, formId));
}

/**
 * Shared helper: gets the active enrollment form for a student in the current year
 */
export async function getActiveFormQuery(studentId: number) {
  await validateActionSession(["admin", "staff"]);
  const [activeSY] = await db
    .select({ id: schoolYears.id })
    .from(schoolYears)
    .where(eq(schoolYears.isActive, true))
    .limit(1);

  if (!activeSY) throw new Error("No active school year");

  const [form] = await db
    .select()
    .from(enrollmentForms)
    .where(
      and(
        eq(enrollmentForms.studentId, studentId),
        eq(enrollmentForms.schoolYearId, activeSY.id)
      )
    )
    .limit(1);

  return JSON.parse(JSON.stringify({ form, syId: activeSY.id }));
}

/**
 * Checks if a user or student with the given email or LRN already exists.
 */
export async function checkStudentIdentityQuery(email: string, lrn?: string) {
  const duplicateEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (duplicateEmail.length > 0) {
    return {
      duplicate: "email",
      message: "A user with this email already exists in the system.",
    };
  }

  if (lrn) {
    const duplicateLRN = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.lrn, lrn))
      .limit(1);

    if (duplicateLRN.length > 0) {
      return {
        duplicate: "lrn",
        message: `Student with LRN ${lrn} is already registered.`,
      };
    }
  }

  return { duplicate: null };
}
