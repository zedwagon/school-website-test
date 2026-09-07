"use server";

import { and, count, desc, eq, ilike, isNotNull, isNull } from "drizzle-orm";
import { db } from "@school/db";
import { classSchedules, schoolYears, sections } from "@school/db";
import { validateActionSession } from "../auth/guard";

/**
 * Gets currently active school year
 */
export async function getActiveSchoolYear() {
  await validateActionSession(["admin", "staff", "student"]);
  const [sy] = await db
    .select()
    .from(schoolYears)
    .where(eq(schoolYears.isActive, true))
    .limit(1);
  return sy ? JSON.parse(JSON.stringify(sy)) : null;
}

/**
 * Gets all school years with optional search, filtering, and pagination
 */
export async function getSchoolYears(
  query?: string,
  filterStatus: "active" | "archived" = "active",
  page = 1,
  limit = 20
) {
  await validateActionSession(["admin", "staff"]);
  const offset = (page - 1) * limit;

  const baseFilter =
    filterStatus === "active"
      ? isNull(schoolYears.archivedAt)
      : isNotNull(schoolYears.archivedAt);

  const searchFilter = query
    ? and(baseFilter, ilike(schoolYears.name, `%${query}%`))
    : baseFilter;

  const [countResult] = await db
    .select({ value: count() })
    .from(schoolYears)
    .where(searchFilter);

  const data = await db
    .select()
    .from(schoolYears)
    .where(searchFilter)
    .orderBy(desc(schoolYears.name))
    .limit(limit)
    .offset(offset);

  const [activeRes] = await db
    .select({ value: count() })
    .from(schoolYears)
    .where(isNull(schoolYears.archivedAt));

  const [archivedRes] = await db
    .select({ value: count() })
    .from(schoolYears)
    .where(isNotNull(schoolYears.archivedAt));

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
 * Creates a new school year
 */
export async function createSchoolYearQuery(data: {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
}) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db.insert(schoolYears).values({
    name: data.name,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    isActive: false,
  });
}

/**
 * Updates an existing school year
 */
export async function updateSchoolYearQuery(
  id: number,
  data: {
    name: string;
    startDate?: string | null;
    endDate?: string | null;
  }
) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(schoolYears)
    .set({
      name: data.name,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
    })
    .where(eq(schoolYears.id, id));
}

/**
 * Archives a school year by setting archivedAt
 */
export async function archiveSchoolYearQuery(id: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(schoolYears)
    .set({ archivedAt: new Date().toISOString() })
    .where(eq(schoolYears.id, id));
}

/**
 * Restores an archived school year by clearing archivedAt
 */
export async function restoreSchoolYearQuery(id: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(schoolYears)
    .set({ archivedAt: null })
    .where(eq(schoolYears.id, id));
}

/**
 * Sets one school year as active and deactivates others
 */
export async function toggleActiveSchoolYearQuery(id: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db.transaction(async (tx) => {
    // 1. Deactivate all
    await tx.update(schoolYears).set({ isActive: false });

    // 2. Activate target
    await tx
      .update(schoolYears)
      .set({ isActive: true })
      .where(eq(schoolYears.id, id));
  });
}

/**
 * Performs a rollover of data from one school year to another
 */
export async function rolloverSchoolYearQuery(data: {
  sourceSyId: number;
  targetSyId: number;
  copySections: boolean;
  copySubjects: boolean;
  copyTeachers: boolean;
  copySchedules: boolean;
}) {
  await validateActionSession(["admin", "staff"], "registrar");
  const {
    sourceSyId,
    targetSyId,
    copySections,
    copySubjects,
    copyTeachers,
    copySchedules,
  } = data;

  if (!copySections) {
    return { sectionsCount: 0 };
  }

  // 1. Get all sections from source year
  const sourceSections = await db
    .select()
    .from(sections)
    .where(
      and(eq(sections.schoolYearId, sourceSyId), isNull(sections.archivedAt))
    );

  if (sourceSections.length === 0) {
    return { sectionsCount: 0 };
  }

  let sectionsCreated = 0;

  // 2. Loop through sections and create copies
  for (const sourceSection of sourceSections) {
    const [newSection] = await db
      .insert(sections)
      .values({
        name: sourceSection.name,
        gradeLevel: sourceSection.gradeLevel,
        schoolYearId: targetSyId,
        adviserId: sourceSection.adviserId,
        room: sourceSection.room,
      })
      .returning({ id: sections.id });

    sectionsCreated++;

    // 3. Copy subjects if requested
    if (copySubjects) {
      const sourceAssignments = await db
        .select()
        .from(classSchedules)
        .where(
          and(
            eq(classSchedules.sectionId, sourceSection.id),
            isNull(classSchedules.archivedAt)
          )
        );

      if (sourceAssignments.length > 0) {
        const newAssignments = sourceAssignments.map((assignment) => ({
          sectionId: newSection.id,
          subjectId: assignment.subjectId,
          teacherId: copyTeachers ? assignment.teacherId : null,
          dayOfWeek: copySchedules ? assignment.dayOfWeek : null,
          startTime: copySchedules ? assignment.startTime : null,
          endTime: copySchedules ? assignment.endTime : null,
        }));

        await db.insert(classSchedules).values(newAssignments);
      }
    }
  }

  return JSON.parse(JSON.stringify({ sectionsCount: sectionsCreated }));
}
