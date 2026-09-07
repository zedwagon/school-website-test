"use server";

import { validateActionSession } from "../auth/guard";
import { getEnrollmentFormById } from "../enrollment/query";

import { approvePhysicalQuery, updatePhysicalQuery } from "./query";

/**
 * Clears a student's physical exam and advances to Guidance (not Payment)
 */
export async function approvePhysical(
  formId: number,
  notes?: string,
  medicalHistory?: any
) {
  try {
    const { user } = await validateActionSession(["admin", "staff"], "clinic");

    const form = await getEnrollmentFormById(formId);
    if (!form) {
      return { error: "Enrollment form not found" };
    }

    await approvePhysicalQuery(formId, user.id, notes, medicalHistory);

    return { success: true };
  } catch (error) {
    console.error("Approve physical error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to clear physical exam",
    };
  }
}

/**
 * Updates an already approved physical exam (notes and history answers)
 */
export async function updatePhysical(
  formId: number,
  notes?: string,
  medicalHistory?: any
) {
  try {
    await validateActionSession(["admin", "staff"], "clinic");

    const form = await getEnrollmentFormById(formId);
    if (!form) {
      return { error: "Enrollment form not found" };
    }

    await updatePhysicalQuery(formId, notes, medicalHistory);

    return { success: true };
  } catch (error) {
    console.error("Update physical error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update physical exam",
    };
  }
}
