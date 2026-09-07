import { describe, it, expect } from "vitest";
import { db } from "../src/db";
import * as schema from "../src/schema";

describe("Database Package Integrity (packages/db/src)", () => {
  it("should initialize Drizzle db instance", () => {
    expect(db).toBeDefined();
  });

  it("should export all database table schemas", () => {
    expect(schema).toHaveProperty("users");
    expect(schema).toHaveProperty("staff");
    expect(schema).toHaveProperty("students");
    expect(schema).toHaveProperty("enrollmentForms");
    expect(schema).toHaveProperty("schoolYears");
    expect(schema).toHaveProperty("sections");
    expect(schema).toHaveProperty("subjects");
    expect(schema).toHaveProperty("classSchedules");
    expect(schema).toHaveProperty("sectionRosters");
    expect(schema).toHaveProperty("contacts");
    expect(schema).toHaveProperty("grades");
    // Accounting & Payroll
    expect(schema).toHaveProperty("employees");
    expect(schema).toHaveProperty("employeeContracts");
    expect(schema).toHaveProperty("payrollPeriods");
    expect(schema).toHaveProperty("payrolls");
  });

  it("should export all 9 Postgres enum definitions", () => {
    expect(schema).toHaveProperty("roleEnum");
    expect(schema).toHaveProperty("gradeLevelEnum");
    expect(schema).toHaveProperty("studentTypeEnum");
    expect(schema).toHaveProperty("learnerTypeEnum");
    expect(schema).toHaveProperty("staffDepartmentEnum");
    expect(schema).toHaveProperty("genderEnum");
    expect(schema).toHaveProperty("shsTrackEnum");
    expect(schema).toHaveProperty("dayOfWeekEnum");
    expect(schema).toHaveProperty("paymentStatusEnum");
  });
});
