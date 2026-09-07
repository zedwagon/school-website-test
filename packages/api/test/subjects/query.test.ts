import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { getSubjects } from "../../src/subjects/query";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "admin" },
  }),
}));

describe("Subjects Module Integration", () => {
  it("should fetch subjects list", async () => {
    const result = await getSubjects();
    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(true);
  });
});
