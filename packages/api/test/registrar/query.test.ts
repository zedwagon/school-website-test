import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { getContactMessages } from "../../src/registrar/action";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "staff", department: "registrar" },
  }),
}));

describe("Registrar Department Integration", () => {
  it("should fetch contact messages with pagination", async () => {
    const result = await getContactMessages(undefined, 1, 10);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.totalCount).toBe("number");
    }
  });

  it("should support searching contact messages by query", async () => {
    const result = await getContactMessages("test", 1, 10);
    expect(result.success).toBe(true);
  });
});
