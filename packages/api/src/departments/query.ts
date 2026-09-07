import { db, staff } from "@school/db";
import { isNotNull } from "drizzle-orm";

export async function getDepartmentStaff() {
  return await db
    .select({
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      department: staff.department,
    })
    .from(staff)
    .where(isNotNull(staff.department));
}
