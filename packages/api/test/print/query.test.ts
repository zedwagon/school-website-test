import { describe, it, expect, vi } from "vitest";
import { getClinicPrintData } from "../../src/print/query";
import { db } from "@school/db";

// Mock the entire @school/db module
vi.mock("@school/db", () => {
  const mockQueryBuilder = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{ studentId: "student-1", firstName: "John" }]),
  };
  return {
    db: {
      select: vi.fn().mockReturnValue(mockQueryBuilder),
    },
    students: {},
    enrollmentForms: {},
    staff: {},
    schoolYears: {},
  };
});

describe("getClinicPrintData", () => {
  it("should return the formatted print data from the database", async () => {
    const data = await getClinicPrintData(123);
    
    // Verify that the query builder was called
    expect(db.select).toHaveBeenCalled();
    expect(data).toEqual({ studentId: "student-1", firstName: "John" });
  });
});
