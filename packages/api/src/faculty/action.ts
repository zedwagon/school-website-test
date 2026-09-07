"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@school/db";
import { staff } from "@school/db";
import { validateActionSession } from "../auth/guard";
import { hashPassword } from "../auth/util";
import {
  archiveTeacherQuery,
  createTeacherQuery,
  restoreTeacherQuery,
  updateTeacherQuery,
} from "./query";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createTeacherSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password is required"),
});

const updateTeacherSchema = createTeacherSchema.extend({
  password: z.string().min(6, "Password is required").optional(),
});

// ============================================================================
// FACULTY ACTIONS
// ============================================================================

export async function createTeacher(data: z.infer<typeof createTeacherSchema>) {
  try {
    await validateActionSession(["staff"], "registrar");
    const validated = createTeacherSchema.parse(data);

    const hashedPassword = await hashPassword(validated.password);

    await createTeacherQuery({
      email: validated.email,
      passwordHash: hashedPassword,
      firstName: validated.firstName,
      middleName: validated.middleName,
      lastName: validated.lastName,
    });

    return { success: true };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "23505"
    ) {
      return { error: "Email already in use" };
    }
    return {
      error: err instanceof Error ? err.message : "Failed to create teacher",
    };
  }
}

export async function updateTeacher(
  id: number,
  data: z.infer<typeof updateTeacherSchema>
) {
  try {
    await validateActionSession(["staff"], "registrar");
    const validated = updateTeacherSchema.parse(data);

    const staffRecord = await db
      .select({ userId: staff.userId })
      .from(staff)
      .where(eq(staff.id, id))
      .limit(1);
    if (!staffRecord.length) {
      return { error: "Teacher not found" };
    }

    const hashedPassword = validated.password
      ? await hashPassword(validated.password)
      : undefined;

    await updateTeacherQuery(id, {
      userId: staffRecord[0].userId,
      email: validated.email,
      passwordHash: hashedPassword,
      firstName: validated.firstName,
      middleName: validated.middleName,
      lastName: validated.lastName,
    });

    return { success: true };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "23505"
    ) {
      return { error: "Email already in use" };
    }
    return {
      error: err instanceof Error ? err.message : "Failed to update teacher",
    };
  }
}

export async function archiveTeacher(id: number) {
  try {
    await validateActionSession(["staff"], "registrar");

    const staffRecord = await db
      .select({ userId: staff.userId })
      .from(staff)
      .where(eq(staff.id, id))
      .limit(1);
    if (!staffRecord.length) {
      return { error: "Teacher not found" };
    }

    await archiveTeacherQuery(id, staffRecord[0].userId);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to archive teacher",
    };
  }
}

export async function restoreTeacher(id: number) {
  try {
    await validateActionSession(["staff"], "registrar");

    const staffRecord = await db
      .select({ userId: staff.userId })
      .from(staff)
      .where(eq(staff.id, id))
      .limit(1);
    if (!staffRecord.length) {
      return { error: "Teacher not found" };
    }

    await restoreTeacherQuery(id, staffRecord[0].userId);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to restore teacher",
    };
  }
}
