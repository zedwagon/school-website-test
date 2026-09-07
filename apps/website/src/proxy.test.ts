import { describe, it, expect, vi } from "vitest";

// Mock auth util and server-only
vi.mock("server-only", () => ({}));
vi.mock("@school/api/auth/util", () => ({
  decryptSession: vi.fn().mockImplementation(async (token: string) => {
    if (token === "student-token") return { role: "student" };
    if (token === "admin-token") return { role: "admin" };
    if (token === "staff-token")
      return { role: "staff", staffDepartment: "registrar" };
    return null;
  }),
}));

import { proxy } from "./proxy";
import type { NextRequest } from "next/server";

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
