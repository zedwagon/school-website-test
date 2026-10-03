import { beforeEach, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { createSession, decryptSession } from "./util";
import { getSession, getSessionFromToken } from "./session";
import { validateActionSession } from "./guard";
import { getUserWithProfileByIdQuery } from "./query";
vi.mock("server-only", () => ({}));
vi.mock("./query", () => ({ getUserWithProfileByIdQuery: vi.fn() }));
const cookie = vi.hoisted(() => ({ token: "", set: vi.fn(), delete: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: cookie.token }), set: cookie.set, delete: cookie.delete }) }));
const profile = {
 userId: 1, userEmail: "staff@example.com", userRole: "staff" as const,
 userSessionVersion: 0, userPasswordHash: "old-bcrypt-hash", userArchivedAt: null, staffArchivedAt: null,
 studentArchivedAt: null, userCreatedAt: "2026-01-01", staffDepartment: "registrar" as const,
 staffFirstName: "Current", staffMiddleName: null, staffLastName: "Name",
 studentFirstName: null, studentMiddleName: null, studentLastName: null, studentSuffix: null,
};
beforeEach(async () => {
 vi.clearAllMocks();
 vi.stubEnv("JWT_SECRET", "test-only-session-secret-for-revocation");
 cookie.set.mockImplementation((_: string, token: string) => { cookie.token = token; });
 vi.mocked(getUserWithProfileByIdQuery).mockResolvedValue({ ...profile });
 await createSession(1, "staff", "old@example.com", "Old", null, "Name", null, profile.userPasswordHash, "registrar");
});
it("uses current profile data and permits an unchanged authorized account", async () => {
 expect(await getSession()).toMatchObject({ user: { email: profile.userEmail, firstName: "Current" } });
 await expect(validateActionSession(["staff"], "registrar")).resolves.toBeDefined();
 const payload = await decryptSession(cookie.token);
 expect(payload?.passwordFingerprint).toBeDefined();
 expect(JSON.stringify(payload)).not.toContain(profile.userPasswordHash);
});
it.each(["userArchivedAt", "staffArchivedAt"] as const)("rejects accounts with %s", async (field) => {
 vi.mocked(getUserWithProfileByIdQuery).mockResolvedValue({ ...profile, [field]: "2026-10-02" });
 expect(await getSession()).toBeNull();
 await expect(validateActionSession(["staff"], "registrar")).rejects.toThrow("Unauthorized");
});
it("rejects deleted accounts", async () => {
 vi.mocked(getUserWithProfileByIdQuery).mockResolvedValue(null);
 expect(await getSession()).toBeNull();
});
it.each([
 { userRole: "student" as const }, { staffDepartment: "accounting" as const },
 { userPasswordHash: "replacement-bcrypt-hash" },
])("revokes existing tokens when credentials or permissions change: %j", async (change) => {
 vi.mocked(getUserWithProfileByIdQuery).mockResolvedValue({ ...profile, ...change });
 expect(await getSession()).toBeNull();
});
it("accepts a new login after a password reset", async () => {
 vi.mocked(getUserWithProfileByIdQuery).mockResolvedValue({ ...profile, userPasswordHash: "new-hash" });
 await createSession(1, "staff", profile.userEmail, "Current", null, "Name", null, "new-hash", "registrar");
 expect(await getSession()).not.toBeNull();
});
it("rejects legacy tokens without the password fingerprint", async () => {
 const token = await new SignJWT({ userId: 1, role: "staff" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(new TextEncoder().encode(process.env.JWT_SECRET));
 expect(await getSessionFromToken(token)).toBeNull();
});
it.each([undefined, "invalid", "bad.token.signature"])("rejects missing or invalid token %s", async (token) => {
 expect(await getSessionFromToken(token)).toBeNull();
 expect(getUserWithProfileByIdQuery).not.toHaveBeenCalled();
});

it("keeps the old token revoked after archive and restore, but accepts a fresh login", async () => {
 const oldToken = cookie.token;
 vi.mocked(getUserWithProfileByIdQuery).mockResolvedValue({ ...profile, userSessionVersion: 1, userArchivedAt: "2026-10-03" });
 expect(await getSessionFromToken(oldToken)).toBeNull();
 vi.mocked(getUserWithProfileByIdQuery).mockResolvedValue({ ...profile, userSessionVersion: 1 });
 expect(await getSessionFromToken(oldToken)).toBeNull();
 await createSession(1, "staff", profile.userEmail, "Current", null, "Name", null, profile.userPasswordHash, "registrar", 1);
 expect(await getSession()).not.toBeNull();
});
