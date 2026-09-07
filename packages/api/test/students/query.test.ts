import { describe, it, expect, vi } from "vitest";
import { getStudents } from "../../src/students/query";

// Mock the auth guard so we can test the DB query logic without a real session
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "admin" }
  })
}));

describe("Students Query Integration", () => {
  it("should fetch active students with counts", async () => {
    const result = await getStudents(undefined, "active", 1, 10);
    
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("totalCount");
    expect(result).toHaveProperty("activeCount");
    expect(result).toHaveProperty("archivedCount");
    
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.totalCount).toBe("number");
    expect(typeof result.activeCount).toBe("number");
    expect(typeof result.archivedCount).toBe("number");
  });

  it("should support searching students by query string", async () => {
    const result = await getStudents("test", "active", 1, 10);
    expect(Array.isArray(result.data)).toBe(true);
  });
});
