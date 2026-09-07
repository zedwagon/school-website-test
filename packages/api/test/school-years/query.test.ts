import { describe, it, expect, vi } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { getSchoolYears, getActiveSchoolYear } from "../../src/school-years/query";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "admin" },
  }),
}));

describe("School Years Module Integration", () => {
  it("should fetch all school years", async () => {
    const result = await getSchoolYears();
    expect(result).toHaveProperty("data");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should fetch active school year or return null/data", async () => {
    const result = await getActiveSchoolYear();
    if (result) {
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
    } else {
      expect(result).toBeNull();
    }
  });
});

describe("School Years CRUD and Actions Integration", () => {
  it("should create, update, archive, and restore a school year", async () => {
    const {
      createSchoolYearQuery,
      updateSchoolYearQuery,
      archiveSchoolYearQuery,
      restoreSchoolYearQuery,
      toggleActiveSchoolYearQuery,
      rolloverSchoolYearQuery
    } = await import("../../src/school-years/query");

    // 1. Create
    const syName = `SY Test ${Date.now()}`;
    await createSchoolYearQuery({
      name: syName,
      startDate: "2099-08-01",
      endDate: "2100-05-31",
    });

    const { db } = await import("@school/db");
    const { schoolYears } = await import("@school/db");
    const { eq } = await import("drizzle-orm");

    const [newSy] = await db.select().from(schoolYears).where(eq(schoolYears.name, syName));

    expect(newSy).toHaveProperty("id");
    expect(newSy.name).toBe(syName);
    expect(newSy.isActive).toBe(false);

    // 2. Update
    await updateSchoolYearQuery(newSy.id, {
      name: `${syName} Updated`,
    });
    
    const [updatedSy] = await db.select().from(schoolYears).where(eq(schoolYears.id, newSy.id));
    expect(updatedSy.name).toBe(`${syName} Updated`);

    // 3. Archive
    await archiveSchoolYearQuery(newSy.id);
    const [archivedSy] = await db.select().from(schoolYears).where(eq(schoolYears.id, newSy.id));
    expect(archivedSy.archivedAt).not.toBeNull();

    // 4. Restore
    await restoreSchoolYearQuery(newSy.id);
    const [restoredSy] = await db.select().from(schoolYears).where(eq(schoolYears.id, newSy.id));
    expect(restoredSy.archivedAt).toBeNull();

    // 5. Toggle Active (sets target to true, others to false)
    await toggleActiveSchoolYearQuery(newSy.id);
    const activeCheck = await db.select().from(schoolYears).where(eq(schoolYears.id, newSy.id));
    expect(activeCheck[0].isActive).toBe(true);

    // 6. Rollover (without copying sections for simple test)
    const targetSyName = `SY Test Target ${Date.now()}`;
    await createSchoolYearQuery({
      name: targetSyName,
    });
    const [targetSy] = await db.select().from(schoolYears).where(eq(schoolYears.name, targetSyName));

    const rolloverResult = await rolloverSchoolYearQuery({
      sourceSyId: newSy.id,
      targetSyId: targetSy.id,
      copySections: false,
      copySubjects: false,
      copyTeachers: false,
      copySchedules: false,
    });
    
    expect(rolloverResult.sectionsCount).toBe(0);

    // Cleanup
    await db.delete(schoolYears).where(eq(schoolYears.id, targetSy.id));
    await db.delete(schoolYears).where(eq(schoolYears.id, newSy.id));
  });
});
