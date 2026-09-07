import { describe, it, expect, vi, beforeEach } from "vitest";



import { hashPassword, verifyPassword, decryptSession } from "../../src/auth/util";

// Mock server-only to prevent Next.js build errors in tests
vi.mock("server-only", () => ({}));

// Mock next/headers for cookie manipulation
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe("Auth Utilities", () => {
  describe("Password Hashing", () => {
    it("should hash a password into a different string", async () => {
      const password = "mySecretPassword123!";
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(typeof hash).toBe("string");
    });

    it("should correctly verify a matching password", async () => {
      const password = "mySecretPassword123!";
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "mySecretPassword123!";
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword("wrongpassword", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("Session Decryption", () => {
    it("should return null for an invalid token", async () => {
      const payload = await decryptSession("invalid.token.here");
      expect(payload).toBeNull();
    });
  });
});
