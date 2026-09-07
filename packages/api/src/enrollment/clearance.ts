"use server";

import { validateActionSession } from "../auth/guard";
import { getActiveFormQuery, updateClearanceStatusQuery } from "./query";

// ============================================================================
// REVOKE: Registrar can undo final enrollment approval
// ============================================================================

export async function revokeRegistrarApproval(studentId: number) {
  try {
    await validateActionSession(["staff"], "registrar");
    const { form } = await getActiveFormQuery(studentId);

    if (!form.isEnrolled) {
      return { error: "Student is not currently enrolled" };
    }

    await updateClearanceStatusQuery(form.id, {
      isEnrolled: false,
      statusNote: null,
    });

    return { success: true };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to revoke registrar approval",
    };
  }
}
