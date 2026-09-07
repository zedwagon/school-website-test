"use server";

import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
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
  subjects,
  users,
} from "@school/db";
import { validateActionSession } from "../auth/guard";

/**
 * Gets sections with pagination and filters
 */
export async function getSections(
  schoolYearId?: number,
  query?: string,
  filterStatus: "active" | "archived" = "active",
  page = 1,
  limit = 10
) {
  await validateActionSession(["admin", "staff"], "registrar");
  const offset = (page - 1) * limit;

  let filter =
    filterStatus === "active"
      ? isNull(sections.archivedAt)
      : isNotNull(sections.archivedAt);

  if (schoolYearId) {
    filter = and(filter, eq(sections.schoolYearId, schoolYearId))!;
  }
  if (query) {
    filter = and(filter, ilike(sections.name, `%${query}%`))!;
  }

  const [countResult] = await db
    .select({ value: count() })
    .from(sections)
    .where(filter);

  const data = await db
    .select({
      id: sections.id,
      name: sections.name,
      gradeLevel: sections.gradeLevel,
      room: sections.room,
      schoolYearId: sections.schoolYearId,
      schoolYearName: schoolYears.name,
      adviserId: sections.adviserId,
      adviserName: staff.lastName,
      adviserFirstName: staff.firstName,
      studentCount: sql<number>`(select count(*) from section_rosters sr where sr.section_id = ${sections.id} and sr.archived_at is null)`,
    })
    .from(sections)
    .leftJoin(schoolYears, eq(sections.schoolYearId, schoolYears.id))
    .leftJoin(staff, eq(sections.adviserId, staff.id))
    .where(filter)
    .orderBy(desc(sections.id))
    .limit(limit)
    .offset(offset);

  // Get counts for pills
  let activeCountFilter = isNull(sections.archivedAt);
  let archivedCountFilter = isNotNull(sections.archivedAt);

  if (schoolYearId) {
    activeCountFilter = and(
      activeCountFilter,
      eq(sections.schoolYearId, schoolYearId)
    )!;
    archivedCountFilter = and(
      archivedCountFilter,
      eq(sections.schoolYearId, schoolYearId)
    )!;
  }

  const [[activeRes], [archivedRes]] = await Promise.all([
    db.select({ value: count() }).from(sections).where(activeCountFilter),
    db.select({ value: count() }).from(sections).where(archivedCountFilter),
  ]);

  return {
    data,
    totalCount: Number(countResult.value),
    activeCount: Number(activeRes.value),
    archivedCount: Number(archivedRes.value),
  };
}

/**
 * Gets active staff for adviser dropdown
 */
export async function getActiveStaff() {
  await validateActionSession(["admin", "staff"], "registrar");
  return await db
    .select({
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      department: staff.department,
    })
    .from(users)
    .innerJoin(staff, eq(users.id, staff.userId))
    .where(and(eq(users.role, "staff"), isNull(users.archivedAt)));
}

/**
 * Gets a section by ID with counts and joined metadata
 */
export async function getSectionByIdQuery(id: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  const [section] = await db
    .select({
      id: sections.id,
      name: sections.name,
      gradeLevel: sections.gradeLevel,
      room: sections.room,
      schoolYearId: sections.schoolYearId,
      schoolYearName: schoolYears.name,
      adviserId: sections.adviserId,
      adviserFirstName: staff.firstName,
      adviserLastName: staff.lastName,
      createdAt: sections.createdAt,
      studentCount: sql<number>`(select count(*) from section_rosters sr where sr.section_id = ${sections.id} and sr.archived_at is null)`,
    })
    .from(sections)
    .leftJoin(schoolYears, eq(sections.schoolYearId, schoolYears.id))
    .leftJoin(staff, eq(sections.adviserId, staff.id))
    .where(and(eq(sections.id, id), isNull(sections.archivedAt)))
    .limit(1);

  return section || null;
}

/**
 * Gets students currently assigned to a section roster
 */
export async function getStudentsInSectionQuery(sectionId: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .select({
      id: students.id,
      enrollmentId: enrollmentForms.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      lrn: students.lrn,
      gender: students.gender,
      gradeLevel: enrollmentForms.gradeLevel,
      assignedAt: sectionRosters.createdAt,
    })
    .from(sectionRosters)
    .innerJoin(
      enrollmentForms,
      eq(sectionRosters.enrollmentId, enrollmentForms.id)
    )
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .where(
      and(
        eq(sectionRosters.sectionId, sectionId),
        isNull(sectionRosters.archivedAt)
      )
    )
    .orderBy(students.lastName, students.firstName);
}

/**
 * Section CRUD Operations
 */

export async function createSectionQuery(data: {
  name: string;
  gradeLevel:
    | "nursery"
    | "kinder_1"
    | "kinder_2"
    | "grade_1"
    | "grade_2"
    | "grade_3"
    | "grade_4"
    | "grade_5"
    | "grade_6"
    | "grade_7"
    | "grade_8"
    | "grade_9"
    | "grade_10"
    | "grade_11"
    | "grade_12";
  schoolYearId: number;
  adviserId?: number | null;
  room?: string | null;
}) {
  return db.insert(sections).values({
    name: data.name,
    gradeLevel: data.gradeLevel,
    schoolYearId: data.schoolYearId,
    adviserId: data.adviserId ?? null,
    room: data.room ?? null,
  });
}

export async function updateSectionQuery(
  id: number,
  data: {
    name: string;
    gradeLevel:
      | "nursery"
      | "kinder_1"
      | "kinder_2"
      | "grade_1"
      | "grade_2"
      | "grade_3"
      | "grade_4"
      | "grade_5"
      | "grade_6"
      | "grade_7"
      | "grade_8"
      | "grade_9"
      | "grade_10"
      | "grade_11"
      | "grade_12";
    schoolYearId: number;
    adviserId?: number | null;
    room?: string | null;
  }
) {
  return db
    .update(sections)
    .set({
      name: data.name,
      gradeLevel: data.gradeLevel,
      schoolYearId: data.schoolYearId,
      adviserId: data.adviserId ?? null,
      room: data.room ?? null,
    })
    .where(eq(sections.id, id));
}

export async function archiveSectionQuery(id: number) {
  return db
    .update(sections)
    .set({ archivedAt: new Date().toISOString() })
    .where(eq(sections.id, id));
}

export async function restoreSectionQuery(id: number) {
  return db
    .update(sections)
    .set({ archivedAt: null })
    .where(eq(sections.id, id));
}

/**
 * Class Builder / Schedule Operations
 */

export async function getSectionScheduleQuery(
  sectionId: number,
  includeArchived = false
) {
  await validateActionSession(["admin", "staff"], "registrar");
  const filter = includeArchived
    ? eq(classSchedules.sectionId, sectionId)
    : and(
        eq(classSchedules.sectionId, sectionId),
        isNull(classSchedules.archivedAt)
      );

  return db
    .select({
      id: classSchedules.id,
      subjectId: subjects.id,
      subjectName: subjects.name,
      subjectCode: subjects.code,
      teacherId: staff.id,
      teacherFirstName: staff.firstName,
      teacherLastName: staff.lastName,
      dayOfWeek: classSchedules.dayOfWeek,
      startTime: classSchedules.startTime,
      endTime: classSchedules.endTime,
      archivedAt: classSchedules.archivedAt,
    })
    .from(classSchedules)
    .innerJoin(subjects, eq(classSchedules.subjectId, subjects.id))
    .leftJoin(staff, eq(classSchedules.teacherId, staff.id))
    .where(filter)
    .orderBy(
      classSchedules.archivedAt,
      classSchedules.dayOfWeek,
      classSchedules.startTime
    );
}

export async function checkExistingAssignmentQuery(
  sectionId: number,
  subjectId: number
) {
  const [existing] = await db
    .select()
    .from(classSchedules)
    .where(
      and(
        eq(classSchedules.sectionId, sectionId),
        eq(classSchedules.subjectId, subjectId),
        isNull(classSchedules.archivedAt)
      )
    )
    .limit(1);

  return existing || null;
}

export async function assignSubjectToSectionQuery(data: {
  sectionId: number;
  subjectId: number;
  teacherId?: number | null;
  dayOfWeek?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | null;
  startTime?: string | null;
  endTime?: string | null;
}) {
  return db.insert(classSchedules).values({
    sectionId: data.sectionId,
    subjectId: data.subjectId,
    teacherId: data.teacherId ?? null,
    dayOfWeek: data.dayOfWeek ?? null,
    startTime: data.startTime ?? null,
    endTime: data.endTime ?? null,
  });
}

export async function updateSectionSubjectQuery(
  id: number,
  data: {
    teacherId?: number | null;
    dayOfWeek?:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | null;
    startTime?: string | null;
    endTime?: string | null;
  }
) {
  return db.update(classSchedules).set(data).where(eq(classSchedules.id, id));
}

export async function removeSectionSubjectQuery(id: number) {
  return db
    .update(classSchedules)
    .set({ archivedAt: new Date().toISOString() })
    .where(eq(classSchedules.id, id));
}

export async function restoreSectionSubjectQuery(id: number) {
  return db
    .update(classSchedules)
    .set({ archivedAt: null })
    .where(eq(classSchedules.id, id));
}

/**
 * Roster Management Operations
 */

export async function getEnrollmentRecordQuery(enrollmentId: number) {
  const [enrollment] = await db
    .select({
      id: enrollmentForms.id,
      isEnrolled: enrollmentForms.isEnrolled,
      gradeLevel: enrollmentForms.gradeLevel,
      schoolYearId: enrollmentForms.schoolYearId,
    })
    .from(enrollmentForms)
    .where(eq(enrollmentForms.id, enrollmentId))
    .limit(1);

  return enrollment || null;
}

export async function checkExistingRosterQuery(enrollmentId: number) {
  const [existing] = await db
    .select({ id: sectionRosters.id })
    .from(sectionRosters)
    .where(
      and(
        eq(sectionRosters.enrollmentId, enrollmentId),
        isNull(sectionRosters.archivedAt)
      )
    )
    .limit(1);

  return existing || null;
}

export async function getSectionMetadataQuery(sectionId: number) {
  const [section] = await db
    .select({
      gradeLevel: sections.gradeLevel,
      schoolYearId: sections.schoolYearId,
    })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  return section || null;
}

export async function assignStudentToSectionQuery(data: {
  enrollmentId: number;
  sectionId: number;
}) {
  return db.insert(sectionRosters).values({
    enrollmentId: data.enrollmentId,
    sectionId: data.sectionId,
  });
}

export async function unassignStudentFromSectionQuery(
  enrollmentId: number,
  sectionId: number
) {
  return db
    .update(sectionRosters)
    .set({ archivedAt: sql`CURRENT_TIMESTAMP` })
    .where(
      and(
        eq(sectionRosters.enrollmentId, enrollmentId),
        eq(sectionRosters.sectionId, sectionId),
        isNull(sectionRosters.archivedAt)
      )
    );
}
