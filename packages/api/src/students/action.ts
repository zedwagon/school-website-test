"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import {
  archiveStudentQuery,
  resetStudentPasswordQuery,
  restoreStudentQuery,
  updateStudentBioDataQuery,
  updateStudentEscNumberQuery,
} from "./query";

const updateStudentBioDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  birthdate: z.string().min(1, "Birthdate is required"),
  gender: z.enum(["male", "female"]),
  lrn: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: "LRN must be exactly 12 digits",
    }),
  fatherName: z.string().optional(),
  motherMaidenName: z.string().optional(),
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
  enrollmentFormId: z.number().optional(),
});

export async function updateStudentBioData(
  id: number,
  data: z.infer<typeof updateStudentBioDataSchema>
) {
  try {
    // Note: session check is handled inside query
    const validated = updateStudentBioDataSchema.parse(data);

    await updateStudentBioDataQuery(id, validated);

    return { success: true };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "23505"
    ) {
      return { error: "LRN already in use" };
    }
    return {
      error:
        err instanceof Error ? err.message : "Failed to update student details",
    };
  }
}

export async function resetStudentPassword(studentId: number) {
  try {
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const defaultPassword = `MPPSI-${year}-${randomPart}`;
    const hashedPassword = await hash(defaultPassword, 12);
    await resetStudentPasswordQuery(studentId, hashedPassword);
    return { success: true, defaultPassword };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to reset password",
    };
  }
}

export async function updateStudentEscNumber(
  id: number,
  escNumber: string | null
) {
  try {
    await updateStudentEscNumberQuery(id, escNumber);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update ESC number",
    };
  }
}

export async function archiveStudent(id: number) {
  try {
    await archiveStudentQuery(id);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to archive student",
    };
  }
}

export async function restoreStudent(id: number) {
  try {
    await restoreStudentQuery(id);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to restore student",
    };
  }
}
