"use server";

import { and, asc, count, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";
import { db } from "@school/db";
import { subjects } from "@school/db";
import { validateActionSession } from "../auth/guard";

/**
 * Gets subjects with pagination and filters
 */
export async function getSubjects(
  query?: string,
  filterStatus: "active" | "archived" = "active",
  page = 1,
  limit = 10
) {
  await validateActionSession(["admin", "staff"], "registrar");
  const offset = (page - 1) * limit;

  const baseFilter =
    filterStatus === "active"
      ? isNull(subjects.archivedAt)
      : isNotNull(subjects.archivedAt);

  const searchFilter = query
    ? and(
        baseFilter,
        or(
          ilike(subjects.name, `%${query}%`),
          ilike(subjects.code, `%${query}%`)
        )
      )
    : baseFilter;

  const [countResult] = await db
    .select({ value: count() })
    .from(subjects)
    .where(searchFilter);

  const data = await db
    .select()
    .from(subjects)
    .where(searchFilter)
    .orderBy(asc(subjects.name))
    .limit(limit)
    .offset(offset);

  const [activeRes] = await db
    .select({ value: count() })
    .from(subjects)
    .where(isNull(subjects.archivedAt));

  const [archivedRes] = await db
    .select({ value: count() })
    .from(subjects)
    .where(isNotNull(subjects.archivedAt));

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
 * Creates a new subject
 */
export async function createSubjectQuery(data: {
  name: string;
  code?: string | null;
  description?: string | null;
}) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db.insert(subjects).values({
    name: data.name,
    code: data.code ?? null,
    description: data.description ?? null,
  });
}

/**
 * Updates an existing subject
 */
export async function updateSubjectQuery(
  id: number,
  data: {
    name: string;
    code?: string | null;
    description?: string | null;
  }
) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(subjects)
    .set({
      name: data.name,
      code: data.code ?? null,
      description: data.description ?? null,
    })
    .where(eq(subjects.id, id));
}

/**
 * Archives a subject by setting archivedAt
 */
export async function archiveSubjectQuery(id: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(subjects)
    .set({ archivedAt: new Date().toISOString() })
    .where(eq(subjects.id, id));
}

/**
 * Restores an archived subject by clearing archivedAt
 */
export async function restoreSubjectQuery(id: number) {
  await validateActionSession(["admin", "staff"], "registrar");
  return db
    .update(subjects)
    .set({ archivedAt: null })
    .where(eq(subjects.id, id));
}
