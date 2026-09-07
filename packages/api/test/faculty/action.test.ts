import { describe, it, expect, vi, afterAll } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));
import { createTeacher, archiveTeacher } from "../../src/faculty/action";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 100, role: "staff", department: "registrar" },
  }),
}));

describe("Faculty Server Actions Integration", () => {
  let createdTeacherId: number | null = null;
  let createdUserId: number | null = null;

  afterAll(async () => {
    if (createdTeacherId || createdUserId) {
      const { db } = await import("@school/db");
      const { staff, users } = await import("@school/db");
      const { eq, or } = await import("drizzle-orm");
      
      if (createdTeacherId) {
        await db.delete(staff).where(eq(staff.id, createdTeacherId));
      }
      if (createdUserId) {
        await db.delete(users).where(eq(users.id, createdUserId));
      }
    }
  });

  describe("createTeacher action", () => {
    it("should return error for invalid email format", async () => {
      const result = await createTeacher({
        firstName: "Jane",
        lastName: "Doe",
        email: "not-an-email",
        password: "password123",
      });

      expect(result).toHaveProperty("error");
      expect(result.error).toContain("Invalid email");
    });

    it("should create a teacher successfully", async () => {
      const testEmail = `teacher_${Date.now()}@school.edu`;
      const result = await createTeacher({
        firstName: "Jane",
        lastName: "Doe",
        email: testEmail,
        password: "password123",
      });

      expect(result).toHaveProperty("success", true);
      
      const { db } = await import("@school/db");
      const { staff, users } = await import("@school/db");
      const { eq } = await import("drizzle-orm");

      const [user] = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
      if (user) {
        createdUserId = user.id;
        const [teacher] = await db.select().from(staff).where(eq(staff.userId, user.id)).limit(1);
        if (teacher) {
          createdTeacherId = teacher.id;
          expect(teacher.department).toBe("faculty");
        }
      }
    });
  });

  describe("updateTeacher action", () => {
    it("should update a teacher successfully", async () => {
      if (!createdTeacherId) return;
      const { updateTeacher } = await import("../../src/faculty/action");
      
      const result = await updateTeacher(createdTeacherId, {
        firstName: "Janet",
        lastName: "Doe",
        email: `updated_${Date.now()}@school.edu`,
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("archiveTeacher action", () => {
    it("should return error if teacher record is not found", async () => {
      const result = await archiveTeacher(9999999);
      expect(result).toEqual({ error: "Teacher not found" });
    });

    it("should archive a teacher successfully", async () => {
      if (!createdTeacherId) return;
      const result = await archiveTeacher(createdTeacherId);
      expect(result).toEqual({ success: true });
    });
  });

  describe("restoreTeacher action", () => {
    it("should restore a teacher successfully", async () => {
      if (!createdTeacherId) return;
      const { restoreTeacher } = await import("../../src/faculty/action");
      const result = await restoreTeacher(createdTeacherId);
      expect(result).toEqual({ success: true });
    });
  });
});
