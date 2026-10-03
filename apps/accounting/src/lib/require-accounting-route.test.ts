import { beforeEach, expect, it, vi } from "vitest";
import { validateRouteSession } from "@school/api/auth/guard";
import { requireAccountingRoute } from "./require-accounting-route";
vi.mock("server-only", () => ({}));
vi.mock("@school/api/auth/guard", () => ({validateRouteSession: vi.fn()}));
vi.mock("next/navigation", () => ({redirect: vi.fn((destination: string) => { throw new Error(`redirect:${destination}`); })}));
beforeEach(() => vi.clearAllMocks());
it("requests both role and Accounting department validation", async () => {
    const auth = {success: true, user: {role: "admin"}} as const;
    vi.mocked(validateRouteSession).mockResolvedValue(auth as any);
    expect(await requireAccountingRoute()).toBe(auth);
    expect(validateRouteSession).toHaveBeenCalledWith(["admin", "staff"], "accounting");
});
it.each([[401, "/login"], [403, "/dashboard"]])("blocks failed access %s before returning to a print page", async (status, destination) => {
    vi.mocked(validateRouteSession).mockResolvedValue({success: false, error: "denied", status: Number(status)});
    await expect(requireAccountingRoute()).rejects.toThrow(`redirect:${destination}`);
});
