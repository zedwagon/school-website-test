import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { getDepartmentStaff } from "../../src/departments/query";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "admin" },
  }),
}));

describe("Departments Module Integration", () => {
  it("should fetch department staff", async () => {
    const result = await getDepartmentStaff();
    expect(Array.isArray(result)).toBe(true);
  });
});
