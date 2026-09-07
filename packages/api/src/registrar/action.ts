"use server";

import { validateActionSession } from "../auth/guard";
import { getContactMessagesQuery } from "./query";

/**
 * Fetch contact messages (Registrar function)
 */
export async function getContactMessages(query?: string, page = 1, limit = 10) {
  try {
    // Both admin and registrar can access
    await validateActionSession(["admin", "staff"], "registrar");
    const result = await getContactMessagesQuery(query, page, limit);

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error("Get contact messages error:", error);
    return {
      success: false as const,
      error: "Failed to fetch contact messages",
    };
  }
}
