import { describe, it, expect } from "vitest";
import { getTeachers } from "../../src/faculty/query";

describe("Faculty Query Integration", () => {
  it("should fetch active teachers with counts", async () => {
    const result = await getTeachers(undefined, "active", 1, 10);
    
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("totalCount");
    expect(result).toHaveProperty("activeCount");
    expect(result).toHaveProperty("archivedCount");
    
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.totalCount).toBe("number");
    expect(typeof result.activeCount).toBe("number");
    expect(typeof result.archivedCount).toBe("number");
  });

  it("should support searching teachers by query string", async () => {
    const result = await getTeachers("a", "active", 1, 10);
    expect(Array.isArray(result.data)).toBe(true);
  });
});
