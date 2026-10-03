import { describe, expect, it, vi } from "vitest";

// Mock auth util and server-only
vi.mock("server-only", () => ({}));
vi.mock("@school/api/auth/session", () => ({
	getSessionFromToken: vi.fn().mockImplementation(async (token: string) => {
		if (token === "student-token") return { user: { role: "student" } };
		if (token === "admin-token") return { user: { role: "admin" } };
		if (token === "staff-token")
			return { user: { role: "staff", staffDepartment: "registrar" } };
		return null;
	}),
}));

import type { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("Proxy Gatekeeper Routing", () => {
	it("should allow unauthenticated users to access /login", async () => {
		const mockReq = {
			nextUrl: { pathname: "/login" },
			cookies: { get: vi.fn().mockReturnValue(undefined) },
			url: "http://localhost:3000/login",
		} as unknown as NextRequest;

		const res = await proxy(mockReq);
		expect(res).toBeDefined();
	});

	it("should redirect unauthenticated users away from /dashboard to /", async () => {
		const mockReq = {
			nextUrl: { pathname: "/dashboard/admin" },
			cookies: { get: vi.fn().mockReturnValue(undefined) },
			url: "http://localhost:3000/dashboard/admin",
		} as unknown as NextRequest;

		const res = await proxy(mockReq);
		expect(res.headers.get("location")).toBe("http://localhost:3000/");
	});
});

it.each(["/dashboard/admin", "/dashboard/staff/registrar"])("rejects revoked tokens at %s", async (pathname) => {
 const request = { nextUrl: { pathname }, cookies: { get: () => ({ value: "revoked-token" }) }, url: `http://localhost:3000${pathname}` } as unknown as NextRequest;
 expect((await proxy(request)).headers.get("location")).toBe("http://localhost:3000/");
});
it("allows revoked sessions to return to login", async () => {
 const request = { nextUrl: { pathname: "/login" }, cookies: { get: () => ({ value: "revoked-token" }) }, url: "http://localhost:3000/login" } as unknown as NextRequest;
 expect((await proxy(request)).headers.get("location")).toBeNull();
});
