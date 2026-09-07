"use server";

import { validateActionSession } from "../auth/guard";
import { getEnrollmentFormById } from "../enrollment/query";
import { editPaymentStatusQuery, updatePaymentStatusQuery } from "./query";

/**
 * Records payment — sets isPaid flag only.
 * The Registrar must do the final approval to set isEnrolled = true.
 */
export async function updatePaymentStatus(
  formId: number,
  status: "full_payment" | "down_payment" | "insufficient" | "promissory_note",
  notes?: string,
  siNumber?: string
) {
  try {
    const { user } = await validateActionSession(
      ["admin", "staff"],
      "accounting"
    );

    const form = await getEnrollmentFormById(formId);
    if (!form) {
      return { error: "Enrollment form not found" };
    }

    await updatePaymentStatusQuery(formId, user.id, status, notes, siNumber);

    return { success: true };
  } catch (error) {
    console.error("Update payment status error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to update payment",
    };
  }
}

/**
 * Edits already confirmed tuition payment records.
 */
export async function editPaymentStatus(
  formId: number,
  status: "full_payment" | "down_payment" | "insufficient" | "promissory_note",
  notes?: string,
  siNumber?: string
) {
  try {
    await validateActionSession(["admin", "staff"], "accounting");

    const form = await getEnrollmentFormById(formId);
    if (!form) {
      return { error: "Enrollment form not found" };
    }

    await editPaymentStatusQuery(formId, status, notes, siNumber);

    return { success: true };
  } catch (error) {
    console.error("Edit payment status error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to edit payment",
    };
  }
}
