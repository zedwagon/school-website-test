import { describe, it, expect, vi, afterAll } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));
import { getUsers, createUserAccount, archiveUserAccount } from "../../src/users/action";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 100, role: "admin" },
  }),
}));

describe("Users Server Actions Integration", () => {
  let createdUserId: number | null = null;
  let createdUserEmail: string = "";

  // Helper to cleanup database after tests
  afterAll(async () => {
    if (createdUserId) {
      const { db } = await import("@school/db");
      const { users, staff } = await import("@school/db");
      const { eq } = await import("drizzle-orm");
      await db.delete(staff).where(eq(staff.userId, createdUserId));
      await db.delete(users).where(eq(users.id, createdUserId));
    }
  });

  describe("getUsers action", () => {
    it("should return users data successfully for admin", async () => {
      const result = await getUsers(undefined, "active", 1, 5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(typeof result.totalCount).toBe("number");
      }
    });
  });

  describe("createUserAccount action", () => {
    it("should return invalid input error when schema parsing fails", async () => {
      const formData = new FormData();
      formData.append("email", "not-an-email");
      formData.append("firstName", "");
      formData.append("lastName", "Smith");
      formData.append("department", "faculty");
      formData.append("password", "123");

      const result = await createUserAccount(null, formData);
      expect(result).toHaveProperty("error", "Invalid input");
      expect(result).toHaveProperty("fieldErrors");
    });

    it("should create a staff account successfully", async () => {
      const formData = new FormData();
      const testEmail = `test_${Date.now()}@school.edu`;
      formData.append("email", testEmail);
      formData.append("firstName", "John");
      formData.append("lastName", "Doe");
      formData.append("department", "registrar");
      formData.append("password", "password123");

      const result = await createUserAccount(null, formData);
      expect(result).toEqual({
        success: true,
        message: "Staff account for John created successfully.",
      });

      // Fetch the created user to use in the next tests
      const usersRes = await getUsers(testEmail);
      if (usersRes.success && usersRes.data.length > 0) {
        createdUserId = usersRes.data[0].id;
        createdUserEmail = usersRes.data[0].email;
      }
    });
  });

  describe("updateUserAccount action", () => {
    it("should update a user account successfully", async () => {
      if (!createdUserId) return; // Skip if creation failed
      
      const formData = new FormData();
      formData.append("email", createdUserEmail);
      formData.append("firstName", "Johnny");
      formData.append("lastName", "Doe");
      formData.append("department", "accounting");
      
      const { updateUserAccount } = await import("../../src/users/action");
      const result = await updateUserAccount(createdUserId, formData);
      expect(result).toEqual({
        success: true,
        message: "User updated successfully",
      });
    });
  });

  describe("archiveUserAccount action", () => {
    it("should prevent admin from archiving their own account", async () => {
      // Session user ID is 100
      const result = await archiveUserAccount(100, "admin@school.edu");
      expect(result).toEqual({ error: "You cannot archive your own account" });
    });

    it("should archive a user successfully", async () => {
      if (!createdUserId) return; // Skip if creation failed
      
      const result = await archiveUserAccount(createdUserId, createdUserEmail);
      expect(result).toEqual({ success: true });
    });
  });

  describe("restoreUserAccount action", () => {
    it("should restore an archived user successfully", async () => {
      if (!createdUserId) return; // Skip if creation failed
      
      const { restoreUserAccount } = await import("../../src/users/action");
      const result = await restoreUserAccount(createdUserId);
      expect(result).toEqual({ success: true });
    });
  });
});
