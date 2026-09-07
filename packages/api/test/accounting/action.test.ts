import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { updatePaymentStatus, editPaymentStatus } from "../../src/accounting/action";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "staff", department: "accounting" },
  }),
}));

describe("Accounting Department Actions", () => {
  it("should return error if enrollment form does not exist on payment update", async () => {
    const result = await updatePaymentStatus(9999999, "full_payment");
    expect(result).toEqual({ error: "Enrollment form not found" });
  });

  it("should return error if enrollment form does not exist on payment edit", async () => {
    const result = await editPaymentStatus(9999999, "full_payment");
    expect(result).toEqual({ error: "Enrollment form not found" });
  });
});
