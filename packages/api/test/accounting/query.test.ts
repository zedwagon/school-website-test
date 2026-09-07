import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { getPendingPayments, getClearedPayments } from "../../src/accounting/query";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "staff", department: "accounting" },
  }),
}));

describe("Accounting Department Integration", () => {
  describe("Queries", () => {
    it("should fetch pending payments", async () => {
      const result = await getPendingPayments();
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should fetch cleared payments", async () => {
      const result = await getClearedPayments();
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
