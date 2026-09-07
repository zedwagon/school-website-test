export type AuthResult = {
  user: {
    id: number;
    email: string;
    role: "student" | "staff" | "admin";
    staffDepartment?: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  session: {
    userId: number;
    expiresAt: Date;
  };
};

import { getSession } from "./session";

/**
 * Validates the current session for server actions (throws error if invalid)
 */
export async function validateActionSession(
  allowedRoles?: ("admin" | "staff" | "student")[],
  allowedDepartments?: string | string[]
): Promise<AuthResult> {
  const auth = await getSession();

  if (!auth || !auth.user) {
    throw new Error("Unauthorized: No session found");
  }

  const { user } = auth;

  // Check roles (Admin bypasses role check)
  if (
    allowedRoles &&
    user.role !== "admin" &&
    !allowedRoles.includes(user.role as any)
  ) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  // Check departments (Admin bypasses department check)
  if (allowedDepartments && user.role === "staff") {
    const depts = Array.isArray(allowedDepartments)
      ? allowedDepartments
      : [allowedDepartments];
    if (!user.staffDepartment || !depts.includes(user.staffDepartment)) {
      throw new Error("Forbidden: Access to this department is restricted");
    }
  }

  return auth as AuthResult;
}

/**
 * Validates the current session for routes (returns success flag)
 */
export async function validateRouteSession(
  allowedRoles?: ("admin" | "staff" | "student")[],
  allowedDepartments?: string | string[]
): Promise<
  | ({ success: true } & AuthResult)
  | { success: false; error: string; status: number }
> {
  try {
    const auth = await validateActionSession(allowedRoles, allowedDepartments);
    return { success: true, ...auth };
  } catch (error: any) {
    if (
      error &&
      (error.message?.includes("Dynamic server usage") ||
        error.digest === "DYNAMIC_SERVER_USAGE")
    ) {
      throw error;
    }
    console.error("Auth validation failed:", error);
    return {
      success: false,
      error: error?.message || "Unknown auth error",
      status: error?.message?.includes("Forbidden") ? 403 : 401,
    };
  }
}
