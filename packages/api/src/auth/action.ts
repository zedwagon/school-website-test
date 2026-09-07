"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@school/db";
import { users } from "@school/db";
import { validateActionSession } from "./guard";
import { getUserWithProfileByIdQuery } from "./query";
import {
  createSession,
  deleteSession,
  hashPassword,
  verifyPassword,
} from "./util";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function login(_prevState: unknown, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Invalid email or password format" };
  }

  const { email, password } = parsed.data;

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return { error: "Invalid email or password" };
    }

    const validPassword = await verifyPassword(password, user[0].passwordHash);
    if (!validPassword) {
      return { error: "Invalid email or password" };
    }

    // Check if account is archived
    if (user[0].archivedAt) {
      return {
        error:
          "Your account has been deactivated. Please contact administration.",
      };
    }

    // Fetch full profile to encode role/department in JWT
    const profile = await getUserWithProfileByIdQuery(user[0].id);

    if (!profile) {
      return { error: "Could not retrieve user profile" };
    }

    // Authenticate: create secure session with role and department
    await createSession(
      profile.userId,
      profile.userRole,
      profile.userEmail,
      profile.staffFirstName || profile.studentFirstName,
      profile.staffMiddleName || profile.studentMiddleName,
      profile.staffLastName || profile.studentLastName,
      (profile as any).studentSuffix || null,
      profile.staffDepartment
    );

    // Gatekeeper: Handoff to proxy for redirection logic
    redirect("/dashboard");
  } catch (error) {
    // Re-throw Next.js internal redirect errors
    if (
      (error as Error).message === "NEXT_REDIRECT" ||
      (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("Login Error:", error);
    return { error: "Authentication failed. Please try again later." };
  }
}

/**
 * LOGOUT ACTION
 * Clears session and redirects to home.
 */
export async function logout() {
  await deleteSession();
  redirect("/");
}

/**
 * Changes the current user's password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const { user } = await validateActionSession(["student", "staff", "admin"]);

    // Verify current password
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));

    if (!dbUser) {
      return { error: "User not found" };
    }

    const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      return { error: "Current password is incorrect" };
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
      })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to change password",
    };
  }
}
