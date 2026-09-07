import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));
import { login, changePassword } from "../../src/auth/action";

// Mock next/navigation redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error("NEXT_REDIRECT");
    (err as any).digest = `NEXT_REDIRECT;replace;${url};`;
    throw err;
  }),
}));

// Mock next/headers cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 999999, role: "admin" },
  }),
}));

describe("Auth Server Actions Integration", () => {
  describe("login action", () => {
    it("should return error for invalid email format", async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "password123");

      const result = await login(null, formData);
      expect(result).toEqual({ error: "Invalid email or password format" });
    });

    it("should return error for non-existent user", async () => {
      const formData = new FormData();
      formData.append("email", "nonexistent_test_user_12345@school.edu");
      formData.append("password", "password123");

      const result = await login(null, formData);
      expect(result).toEqual({ error: "Invalid email or password" });
    });
  });

  describe("changePassword action", () => {
    it("should return error if user does not exist in DB", async () => {
      const result = await changePassword("oldpass", "newpass");
      expect(result).toEqual({ error: "User not found" });
    });
  });
});
