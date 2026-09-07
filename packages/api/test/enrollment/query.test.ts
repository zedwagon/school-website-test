import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import {
  getEnrollmentStats,
  getPendingEnrollments,
  getEnrolledStudents,
  checkStudentIdentityQuery
} from "../../src/enrollment/query";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "admin" },
  }),
}));

describe("Enrollment Module Integration", () => {
  describe("Queries", () => {
    it("should fetch enrollment stats", async () => {
      const result = await getEnrollmentStats();
      expect(result).toHaveProperty("data");
      expect(typeof result.data.total).toBe("number");
      expect(typeof result.data.pendingPhysical).toBe("number");
      expect(typeof result.data.pendingPayment).toBe("number");
      expect(typeof result.data.enrolled).toBe("number");
    });

    it("should fetch pending enrollments", async () => {
      const result = await getPendingEnrollments(undefined, 1, 5);
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.totalCount).toBe("number");
    });

    it("should fetch enrolled students", async () => {
      const result = await getEnrolledStudents(undefined, 1, 5);
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.totalCount).toBe("number");
    });

    it("should check student identity duplicate LRN/email", async () => {
      const result = await checkStudentIdentityQuery("nonexistent_test_email@school.edu", "999999999999");
      expect(result).toHaveProperty("duplicate");
    });
  });
});
