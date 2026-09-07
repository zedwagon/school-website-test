import { eq } from "drizzle-orm";
import { db } from "@school/db";
import { staff, students, users } from "@school/db";

/**
 * Optimized query to get user and joined profile data by ID.
 * This is used for session validation with JWTs.
 */
export async function getUserWithProfileByIdQuery(userId: number) {
  const result = await db
    .select({
      // User
      userId: users.id,
      userEmail: users.email,
      userRole: users.role,
      userCreatedAt: users.createdAt,

      // Staff (left joined)
      staffDepartment: staff.department,
      staffFirstName: staff.firstName,
      staffMiddleName: staff.middleName,
      staffLastName: staff.lastName,

      // Student (left joined)
      studentFirstName: students.firstName,
      studentMiddleName: students.middleName,
      studentLastName: students.lastName,
      studentSuffix: students.suffix,
    })
    .from(users)
    .leftJoin(staff, eq(users.id, staff.userId))
    .leftJoin(students, eq(users.id, students.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Returns a simple user without profile details.
 */
export async function getUserByIdQuery(userId: number) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
