import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { getPendingGuidance, getClearedGuidance } from "../../src/guidance/query";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "staff", department: "guidance" },
  }),
}));

describe("Guidance Department Integration", () => {
  describe("Queries", () => {
    it("should fetch pending guidance interviews", async () => {
      const result = await getPendingGuidance();
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should fetch cleared guidance records", async () => {
      const result = await getClearedGuidance();
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
