import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { approvePhysical, updatePhysical } from "../../src/clinic/action";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "staff", department: "clinic" },
  }),
}));

describe("Clinic Department Actions", () => {
  it("should return error if enrollment form does not exist on physical approval", async () => {
    const result = await approvePhysical(9999999);
    expect(result).toEqual({ error: "Enrollment form not found" });
  });

  it("should return error if enrollment form does not exist on physical update", async () => {
    const result = await updatePhysical(9999999);
    expect(result).toEqual({ error: "Enrollment form not found" });
  });
});
