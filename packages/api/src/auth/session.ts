import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "../constants";
import { decryptSession } from "./util";

const SESSION_COOKIE_NAME = AUTH_COOKIE.NAME;

/**
 * RETRIEVES THE CURRENT SESSION & USER (Database-dependent)
 * Verifies the JWT and fetches fresh user data from the DB.
 * Used for pages and server actions where fresh data is required.
 * This is isolated from the main util.ts to keep the Edge runtime
 * (Middleware) from importing the database.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  // Basic check: JWT should have 3 parts separated by dots.
  if (token.split(".").length !== 3) {
    return null;
  }

  try {
    // Verify the JWT payload statelessly
    const payload = await decryptSession(token);

    if (!payload || !payload.userId) return null;

    // Map payload to a cleaner user & session object (Stateless)
    const session = {
      userId: payload.userId,
      // JWT handles expiration itself
      expiresAt: new Date(((payload as any).exp as number) * 1000),
    };

    const user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,

      // Integrated identity fields from JWT
      staffDepartment: payload.staffDepartment,
      firstName: payload.firstName,
      middleName: payload.middleName,
      lastName: payload.lastName,
      suffix: payload.suffix,
    };

    return { user, session };
  } catch (error) {
    console.error("Session Retrieval Error:", error);
    return null;
  }
}
