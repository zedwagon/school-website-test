import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { getPendingPhysicals, getClearedPhysicals } from "../../src/clinic/query";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "staff", department: "clinic" },
  }),
}));

describe("Clinic Department Integration", () => {
  describe("Queries", () => {
    it("should fetch pending physical exams", async () => {
      const result = await getPendingPhysicals();
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should fetch cleared physical exams", async () => {
      const result = await getClearedPhysicals();
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
