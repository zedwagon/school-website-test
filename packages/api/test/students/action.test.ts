import { describe, it, expect, vi } from "vitest";
import { updateStudentBioData, resetStudentPassword } from "../../src/students/action";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 100, role: "admin" },
  }),
}));

describe("Students Server Actions Integration", () => {
  describe("updateStudentBioData action", () => {
    it("should return validation error for invalid LRN", async () => {
      const result = await updateStudentBioData(1, {
        firstName: "John",
        lastName: "Doe",
        birthdate: "2010-01-01",
        gender: "male",
        lrn: "123", // invalid length, must be 12 digits
      });

      expect(result).toHaveProperty("error");
      expect(result.error).toContain("LRN must be exactly 12 digits");
    });
  });

  describe("resetStudentPassword action", () => {
    it("should return error if student does not exist", async () => {
      const result = await resetStudentPassword(9999999);
      expect(result).toEqual({ error: "Student not found" });
    });
  });
});
