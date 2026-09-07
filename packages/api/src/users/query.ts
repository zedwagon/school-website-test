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
import { staff, students, users } from "@school/db";

/**
 * Fetch all users with optional search
 * Note: Authorization should be handled by the caller
 */
export async function getUsersQuery(
  query?: string,
  filterStatus: "active" | "archived" = "active",
  page = 1,
  limit = 10,
  userType?: "staff" | "student"
) {
  const offset = (page - 1) * limit;

  let baseFilter =
    filterStatus === "active"
      ? isNull(users.archivedAt)
      : isNotNull(users.archivedAt);

  if (userType) {
    baseFilter = and(baseFilter, eq(users.role, userType))!;
  }

  const searchCondition = query
    ? and(
        baseFilter,
        or(
          ilike(users.email, `%${query}%`),
          ilike(staff.firstName, `%${query}%`),
          ilike(staff.middleName, `%${query}%`),
          ilike(staff.lastName, `%${query}%`),
          ilike(
            sql`concat(${staff.firstName}, ' ', ${staff.lastName})`,
            `%${query}%`
          ),
          ilike(
            sql`concat(${staff.firstName}, ' ', ${staff.middleName})`,
            `%${query}%`
          ),
          ilike(
            sql`concat(${staff.firstName}, ' ', ${staff.middleName}, ' ', ${staff.lastName})`,
            `%${query}%`
          ),
          ilike(students.firstName, `%${query}%`),
          ilike(students.middleName, `%${query}%`),
          ilike(students.lastName, `%${query}%`),
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

  // Get total count
  const [countResult] = await db
    .select({ value: count() })
    .from(users)
    .leftJoin(staff, eq(users.id, staff.userId))
    .leftJoin(students, eq(users.id, students.userId))
    .where(searchCondition);

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      firstName: sql<
        string | null
      >`COALESCE(${staff.firstName}, ${students.firstName})`,
      middleName: sql<
        string | null
      >`COALESCE(${staff.middleName}, ${students.middleName})`,
      lastName: sql<
        string | null
      >`COALESCE(${staff.lastName}, ${students.lastName})`,
      staffDepartment: staff.department,
      createdAt: users.createdAt,
      archivedAt: users.archivedAt,
    })
    .from(users)
    .leftJoin(staff, eq(users.id, staff.userId))
    .leftJoin(students, eq(users.id, students.userId))
    .where(searchCondition)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    data: allUsers,
    totalCount: Number(countResult.value),
  };
}

export async function getAllUsers() {
  return await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);
}

export async function getUserById(id: number | string) {
  const numericId = typeof id === "string" ? Number.parseInt(id, 10) : id;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, numericId))
    .limit(1);
  return result[0] || null;
}
