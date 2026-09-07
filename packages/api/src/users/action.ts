"use server";

import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@school/db";
import { staff, students, users } from "@school/db";
import { validateActionSession } from "../auth/guard";
import { hashPassword } from "../auth/util";
import { getUsersQuery } from "./query";

const createStaffSchema = z.object({
  email: z.email(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  department: z.enum([
    "registrar",
    "clinic",
    "guidance",
    "accounting",
    "faculty",
    "admin",
  ]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const updateStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  department: z.string().optional(),
  email: z.string().email(),
  password: z.string().optional(),
});

// ============================================================================
// USER MANAGEMENT ACTIONS
// ============================================================================

/**
 * Fetch all users with optional search
 */
export async function getUsers(
  query?: string,
  filterStatus: "active" | "archived" = "active",
  page = 1,
  limit = 10,
  type?: "staff" | "student"
) {
  try {
    await validateActionSession(["admin"]);
    const result = await getUsersQuery(query, filterStatus, page, limit, type);

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false as const, error: "Failed to fetch users" };
  }
}

/**
 * Create a new Staff or Admin account
 */
export async function createUserAccount(
  _prevState: unknown,
  formData: FormData
) {
  try {
    await validateActionSession(["admin"]);

    const data = Object.fromEntries(formData.entries());
    const parsed = createStaffSchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { email, firstName, middleName, lastName, department, password } =
      parsed.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return { error: "Email already in use" };
    }

    const hashedPassword = await hashPassword(password);

    // Create user account
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
        role: department === "admin" ? "admin" : "staff",
      })
      .returning();

    // Create staff record
    await db.insert(staff).values({
      userId: newUser.id,
      firstName,
      middleName: middleName || null,
      lastName,
      department: department as any,
    });

    return {
      success: true,
      message: `Staff account for ${firstName} created successfully.`,
    };
  } catch (error) {
    console.error("Create staff account error:", error);
    return { error: "Failed to create staff account" };
  }
}

/**
 * Update a user account
 */
export async function updateUserAccount(userId: number, formData: FormData) {
  try {
    await validateActionSession(["admin"]);
    const data = Object.fromEntries(formData.entries());

    if (!data.password || data.password === "") {
      delete data.password;
    }

    const parsed = updateStaffSchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { email, firstName, middleName, lastName, department, password } =
      parsed.data;

    // Check email uniqueness if changed
    const existingUser = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, userId)));
    if (existingUser.length > 0) {
      return { error: "Email already in use" };
    }

    // Retrieve target user role
    const [targetUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId));
    if (!targetUser) {
      return { error: "User not found" };
    }

    // Update user email and password if provided
    const userUpdateData: any = { email };

    if (password && password.length >= 6) {
      userUpdateData.passwordHash = await hashPassword(password);
    }

    if (department === "admin") {
      userUpdateData.role = "admin";
    } else if (department) {
      userUpdateData.role = "staff";
    }

    await db.update(users).set(userUpdateData).where(eq(users.id, userId));

    if (targetUser.role === "student") {
      // Update student details
      await db
        .update(students)
        .set({
          firstName,
          middleName: middleName || null,
          lastName,
        })
        .where(eq(students.userId, userId));
    } else if (targetUser.role === "staff") {
      // Update staff details
      await db
        .update(staff)
        .set({
          firstName,
          middleName: middleName || null,
          lastName,
          department: department as typeof staff.$inferSelect.department,
        })
        .where(eq(staff.userId, userId));
    }

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "Failed to update user" };
  }
}

/**
 * Archive a user account (soft delete)
 */
export async function archiveUserAccount(
  userId: number,
  emailConfirmation: string
) {
  try {
    const { user: currentUser } = await validateActionSession(["admin"]);

    if (userId === currentUser.id) {
      return { error: "You cannot archive your own account" };
    }

    // Verify user exists and email matches
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (targetUser.length === 0) {
      return { error: "User not found" };
    }
    if (targetUser[0].email !== emailConfirmation) {
      return { error: "Email confirmation does not match" };
    }

    // Soft delete (Archive)
    const now = new Date().toISOString();
    await db.update(users).set({ archivedAt: now }).where(eq(users.id, userId));

    // If user is a student, delete their profile too
    await db
      .update(students)
      .set({ archivedAt: now })
      .where(eq(students.userId, userId));

    return { success: true };
  } catch (error: unknown) {
    console.error("Archive user error:", error);
    return { error: "Failed to archive user" };
  }
}

/**
 * Restore an archived user account
 */
export async function restoreUserAccount(userId: number) {
  try {
    await validateActionSession(["admin"]);

    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (targetUser.length === 0) {
      return { error: "User not found" };
    }

    // Restore user
    await db
      .update(users)
      .set({ archivedAt: null })
      .where(eq(users.id, userId));

    // Restore associated student profile
    await db
      .update(students)
      .set({ archivedAt: null })
      .where(eq(students.userId, userId));

    return { success: true };
  } catch (error: unknown) {
    console.error("Restore user error:", error);
    return { error: "Failed to restore user" };
  }
}
