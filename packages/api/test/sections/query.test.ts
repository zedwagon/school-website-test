import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { getSections } from "../../src/sections/query";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "admin" },
  }),
}));

describe("Sections Module Integration", () => {
  it("should fetch sections list", async () => {
    const result = await getSections();
    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should fetch active staff for adviser dropdown", async () => {
    const { getActiveStaff } = await import("../../src/sections/query");
    const result = await getActiveStaff();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("firstName");
      expect(result[0]).toHaveProperty("lastName");
      expect(result[0].department).toBeDefined();
    }
  });

  it("should handle getting a section by ID", async () => {
    const { getSectionByIdQuery } = await import("../../src/sections/query");
    // Just testing it doesn't crash on invalid ID
    const result = await getSectionByIdQuery(999999);
    expect(result).toBeNull();
  });

  it("should handle getting students in a section", async () => {
    const { getStudentsInSectionQuery } = await import("../../src/sections/query");
    const result = await getStudentsInSectionQuery(999999);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("Sections CRUD Operations Integration", () => {
  it("should create, update, archive, and restore a section", async () => {
    const { 
      createSectionQuery, 
      updateSectionQuery, 
      archiveSectionQuery, 
      restoreSectionQuery 
    } = await import("../../src/sections/query");

    const { db } = await import("@school/db");
    const { sections, schoolYears } = await import("@school/db");
    const { eq } = await import("drizzle-orm");

    // 0. Create a school year for the foreign key
    const [sy] = await db.insert(schoolYears).values({
      name: "SY 2099-2100",
      startDate: "2099-08-01",
      endDate: "2100-05-31",
      isActive: false
    }).returning();

    const sectionName = `Test Section ${Date.now()}`;
    // 1. Create
    await createSectionQuery({
      name: sectionName,
      gradeLevel: "grade_1",
      schoolYearId: sy.id,
    });
    
    // Fetch it manually
    const [newSection] = await db.select().from(sections).where(eq(sections.name, sectionName)).limit(1);
    
    expect(newSection).toHaveProperty("id");
    expect(newSection.name).toBe(sectionName);

    // 2. Update
    await updateSectionQuery(newSection.id, {
      name: "Updated Test Section",
      gradeLevel: "grade_1",
      schoolYearId: sy.id,
    });
    
    const [updatedSection] = await db.select().from(sections).where(eq(sections.id, newSection.id));
    expect(updatedSection.name).toBe("Updated Test Section");

    // 3. Archive
    await archiveSectionQuery(newSection.id);
    const archivedResult = await db.select().from(sections).where(eq(sections.id, newSection.id));
    expect(archivedResult[0].archivedAt).not.toBeNull();

    // 4. Restore
    await restoreSectionQuery(newSection.id);
    const restoredResult = await db.select().from(sections).where(eq(sections.id, newSection.id));
    expect(restoredResult[0].archivedAt).toBeNull();
    
    // Cleanup
    await db.delete(sections).where(eq(sections.id, newSection.id));
    await db.delete(schoolYears).where(eq(schoolYears.id, sy.id));
  });
});
