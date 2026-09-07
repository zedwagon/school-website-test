import { describe, it, expect } from "vitest";
import { getUsersQuery } from "../../src/users/query";

describe("Users Query Integration", () => {
  it("should fetch active users with pagination metadata", async () => {
    const result = await getUsersQuery(undefined, "active", 1, 10);
    
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("totalCount");
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.totalCount).toBe("number");

    // Because this hits staging DB, we might or might not have users. 
    // We just ensure the shape of the data is correct if any exist.
    if (result.data.length > 0) {
      const user = result.data[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("role");
      expect(user.archivedAt).toBeNull();
    }
  });

  it("should fetch staff specifically", async () => {
    const result = await getUsersQuery(undefined, "active", 1, 10, "staff");
    
    expect(Array.isArray(result.data)).toBe(true);
    if (result.data.length > 0) {
      expect(result.data[0].role).toBe("staff");
    }
  });

  it("should search users by email partial match", async () => {
    // Attempting to search for something broad like "a" to ensure search logic doesn't crash
    const result = await getUsersQuery("a", "active", 1, 5);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should fetch archived users specifically", async () => {
    const result = await getUsersQuery(undefined, "archived", 1, 10);
    expect(Array.isArray(result.data)).toBe(true);
    
    // Verify archived condition
    if (result.data.length > 0) {
      expect(result.data[0].archivedAt).not.toBeNull();
    }
  });

  it("should fetch students specifically", async () => {
    const result = await getUsersQuery(undefined, "active", 1, 10, "student");
    expect(Array.isArray(result.data)).toBe(true);
    
    // Verify role filtering
    if (result.data.length > 0) {
      expect(result.data[0].role).toBe("student");
    }
  });
});
