import { describe, it, expect, vi } from "vitest";
import { validateActionSession } from "../../src/auth/guard";
import * as authSession from "../../src/auth/session";

// Mock the auth session
vi.mock("../../src/auth/session", () => ({
  getSession: vi.fn(),
}));

describe("validateActionSession", () => {
  it("should throw unauthorized if no session exists", async () => {
    vi.mocked(authSession.getSession).mockResolvedValue(null);
    
    await expect(validateActionSession()).rejects.toThrow("Unauthorized");
  });

  it("should return the session payload if valid", async () => {
    const mockPayload = { user: { id: 1, role: "admin", email: "test@test.com", firstName: null, lastName: null }, session: { userId: 1, expiresAt: new Date() } };
    vi.mocked(authSession.getSession).mockResolvedValue(mockPayload as any);

    const payload = await validateActionSession();
    expect(payload).toEqual(mockPayload);
  });

  it("should throw forbidden if user does not have required roles", async () => {
    const mockPayload = { user: { id: 1, role: "student", email: "test@test.com", firstName: null, lastName: null }, session: { userId: 1, expiresAt: new Date() } };
    vi.mocked(authSession.getSession).mockResolvedValue(mockPayload as any);

    await expect(validateActionSession(["admin", "staff"])).rejects.toThrow("Forbidden");
  });

  it("should pass if user has the required role", async () => {
    const mockPayload = { user: { id: 1, role: "admin", email: "test@test.com", firstName: null, lastName: null }, session: { userId: 1, expiresAt: new Date() } };
    vi.mocked(authSession.getSession).mockResolvedValue(mockPayload as any);

    const payload = await validateActionSession(["admin", "staff"]);
    expect(payload.user.role).toBe("admin");
  });
});
