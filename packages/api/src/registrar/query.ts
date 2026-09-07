"use server";

import { count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@school/db";
import { contacts } from "@school/db";
import { validateActionSession } from "../auth/guard";

/**
 * Fetch contact messages
 */
export async function getContactMessagesQuery(
  query?: string,
  page = 1,
  limit = 10
) {
  await validateActionSession(["admin", "staff"], "registrar");
  const offset = (page - 1) * limit;

  let conditions;
  if (query) {
    conditions = or(
      ilike(contacts.name, `%${query}%`),
      ilike(contacts.email, `%${query}%`),
      ilike(contacts.subject, `%${query}%`)
    );
  }

  const [countResult] = await db
    .select({ value: count() })
    .from(contacts)
    .where(conditions);

  const messages = await db
    .select()
    .from(contacts)
    .where(conditions)
    .orderBy(desc(contacts.createdAt))
    .limit(limit)
    .offset(offset);

  return JSON.parse(
    JSON.stringify({
      data: messages,
      totalCount: Number(countResult.value),
    })
  );
}
