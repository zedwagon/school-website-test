import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

// Mock server-only before server actions are imported
vi.mock("server-only", () => ({}));

import { approveGuidance, updateGuidance } from "../../src/guidance/action";

// Mock validateActionSession
vi.mock("../../src/auth/guard", () => ({
  validateActionSession: vi.fn().mockResolvedValue({
    success: true,
    user: { id: 1, role: "staff", department: "guidance" },
  }),
}));

describe("Guidance Department Actions", () => {
  let testUserId: number;
  let testStudentId: number;
  let testSyId: number;
  let testFormId: number;

  beforeAll(async () => {
    const { db } = await import("@school/db");
    const { users, students, schoolYears, enrollmentForms } = await import("@school/db");
    const { eq } = await import("drizzle-orm");

    // Create user
    const testEmail = `guidance_${Date.now()}@test.com`;
    const [user] = await db.insert(users).values({
      email: testEmail,
      passwordHash: "password",
      role: "staff",
    }).returning({ id: users.id });
    testUserId = user.id;

    const { validateActionSession } = await import("../../src/auth/guard");
    vi.mocked(validateActionSession).mockResolvedValue({
      user: { id: testUserId, role: "staff", department: "guidance" } as any,
    } as any);

    // Create student
    const [student] = await db.insert(students).values({
      userId: testUserId,
      firstName: "Guidance",
      lastName: "Test",
      birthdate: "2010-01-01",
      gender: "male",
      address: "Test Address",
      zipCode: "1234",
      fatherName: "Father Test",
      motherMaidenName: "Mother Test",
    }).returning({ id: students.id });
    testStudentId = student.id;

    // Create school year
    const [sy] = await db.insert(schoolYears).values({
      name: `SY Guidance Test ${Date.now()}`,
    }).returning({ id: schoolYears.id });
    testSyId = sy.id;

    // Create form
    const [form] = await db.insert(enrollmentForms).values({
      studentId: testStudentId,
      schoolYearId: testSyId,
      studentType: "new",
      gradeLevel: "grade_1",
      learnerType: "elementary",
      statusClinicDone: true,
      statusGuidanceDone: false,
    }).returning({ id: enrollmentForms.id });
    testFormId = form.id;
  });

  afterAll(async () => {
    if (testFormId) {
      const { db } = await import("@school/db");
      const { enrollmentForms, students, schoolYears, users } = await import("@school/db");
      const { eq } = await import("drizzle-orm");
      
      await db.delete(enrollmentForms).where(eq(enrollmentForms.id, testFormId));
      await db.delete(students).where(eq(students.id, testStudentId));
      await db.delete(users).where(eq(users.id, testUserId));
      await db.delete(schoolYears).where(eq(schoolYears.id, testSyId));
    }
  });

  it("should return error if enrollment form does not exist on guidance approval", async () => {
    const result = await approveGuidance(9999999);
    expect(result).toEqual({ error: "Enrollment form not found" });
  });

  it("should approve guidance successfully", async () => {
    const result = await approveGuidance(testFormId, "Cleared by guidance", { livingWith: "Parents" }, { behavioral: ["Attention"] }, false);
    expect(result).toEqual({ success: true });

    const { db } = await import("@school/db");
    const { enrollmentForms } = await import("@school/db");
    const { eq } = await import("drizzle-orm");
    const [form] = await db.select().from(enrollmentForms).where(eq(enrollmentForms.id, testFormId));
    expect(form.statusGuidanceDone).toBe(true);
    expect(form.statusGuidanceNote).toBe("Cleared by guidance");
  });

  it("should return error if enrollment form does not exist on guidance update", async () => {
    const result = await updateGuidance(9999999);
    expect(result).toEqual({ error: "Enrollment form not found" });
  });

  it("should update guidance successfully", async () => {
    const result = await updateGuidance(testFormId, "Updated note", { livingWith: "Guardian" }, { behavioral: ["Attention", "Hyperactivity"] }, true);
    expect(result).toEqual({ success: true });

    const { db } = await import("@school/db");
    const { enrollmentForms } = await import("@school/db");
    const { eq } = await import("drizzle-orm");
    const [form] = await db.select().from(enrollmentForms).where(eq(enrollmentForms.id, testFormId));
    expect(form.statusGuidanceNote).toBe("Updated note");
    expect(form.statusGuidanceHasDiagnosis).toBe(true);
  });
});
