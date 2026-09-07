"use server";

import { validateActionSession } from "../auth/guard";
import { getEnrollmentFormById } from "../enrollment/query";

import { approveGuidanceQuery, updateGuidanceQuery } from "./query";

/**
 * Issues guidance clearance and advances student to Accounting (pending_payment)
 */
export async function approveGuidance(
  formId: number,
  notes?: string,
  profile?: any,
  needs?: any,
  hasDiagnosis?: boolean
) {
  try {
    const { user } = await validateActionSession(
      ["admin", "staff"],
      "guidance"
    );

    const form = await getEnrollmentFormById(formId);
    if (!form) {
      return { error: "Enrollment form not found" };
    }

    // Filter out empty strings and undefined/null fields in profile
    const cleanedProfile = profile
      ? Object.fromEntries(
          Object.entries(profile)
            .map(([key, value]) => {
              if (typeof value === "string") {
                const trimmed = value.trim();
                return [key, trimmed === "" ? null : trimmed];
              }
              if (Array.isArray(value)) {
                // Filter out empty values in arrays (like siblings list or household members)
                const cleanedArray = value
                  .map((item: any) => {
                    if (item && typeof item === "object") {
                      const cleanedItem = Object.fromEntries(
                        Object.entries(item)
                          .map(([k, v]) => [
                            k,
                            typeof v === "string" ? v.trim() : v,
                          ])
                          .filter(
                            ([_, v]) =>
                              v !== "" && v !== null && v !== undefined
                          )
                      );
                      return Object.keys(cleanedItem).length > 0
                        ? cleanedItem
                        : null;
                    }
                    return item;
                  })
                  .filter((item) => item !== null && item !== undefined);
                return [key, cleanedArray.length > 0 ? cleanedArray : null];
              }
              return [key, value];
            })
            .filter(([_, value]) => value !== null && value !== undefined)
        )
      : null;

    // Filter out categories in needs that have no selected items (empty arrays)
    const cleanedNeeds = needs
      ? Object.fromEntries(
          Object.entries(needs)
            .map(([category, items]) => {
              if (Array.isArray(items)) {
                const activeItems = items.filter((item) => !!item);
                return [category, activeItems.length > 0 ? activeItems : null];
              }
              return [category, items];
            })
            .filter(([_, value]) => value !== null && value !== undefined)
        )
      : null;

    await approveGuidanceQuery(
      formId,
      user.id,
      notes,
      cleanedProfile,
      cleanedNeeds,
      hasDiagnosis
    );

    return { success: true };
  } catch (error) {
    console.error("Approve guidance error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to issue guidance clearance",
    };
  }
}

/**
 * Updates an already approved/cleared guidance record
 */
export async function updateGuidance(
  formId: number,
  notes?: string,
  profile?: any,
  needs?: any,
  hasDiagnosis?: boolean
) {
  try {
    await validateActionSession(["admin", "staff"], "guidance");

    const form = await getEnrollmentFormById(formId);
    if (!form) {
      return { error: "Enrollment form not found" };
    }

    // Filter out empty strings and undefined/null fields in profile
    const cleanedProfile = profile
      ? Object.fromEntries(
          Object.entries(profile)
            .map(([key, value]) => {
              if (typeof value === "string") {
                const trimmed = value.trim();
                return [key, trimmed === "" ? null : trimmed];
              }
              if (Array.isArray(value)) {
                const cleanedArray = value
                  .map((item: any) => {
                    if (item && typeof item === "object") {
                      const cleanedItem = Object.fromEntries(
                        Object.entries(item)
                          .map(([k, v]) => [
                            k,
                            typeof v === "string" ? v.trim() : v,
                          ])
                          .filter(
                            ([_, v]) =>
                              v !== "" && v !== null && v !== undefined
                          )
                      );
                      return Object.keys(cleanedItem).length > 0
                        ? cleanedItem
                        : null;
                    }
                    return item;
                  })
                  .filter((item) => item !== null && item !== undefined);
                return [key, cleanedArray.length > 0 ? cleanedArray : null];
              }
              return [key, value];
            })
            .filter(([_, value]) => value !== null && value !== undefined)
        )
      : null;

    // Filter out categories in needs that have no selected items (empty arrays)
    const cleanedNeeds = needs
      ? Object.fromEntries(
          Object.entries(needs)
            .map(([category, items]) => {
              if (Array.isArray(items)) {
                const activeItems = items.filter((item) => !!item);
                return [category, activeItems.length > 0 ? activeItems : null];
              }
              return [category, items];
            })
            .filter(([_, value]) => value !== null && value !== undefined)
        )
      : null;

    await updateGuidanceQuery(
      formId,
      notes,
      cleanedProfile,
      cleanedNeeds,
      hasDiagnosis
    );

    return { success: true };
  } catch (error) {
    console.error("Update guidance error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update guidance record",
    };
  }
}
