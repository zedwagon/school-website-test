import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePayrollsForPeriod, createEmployee } from "./action";
import { db } from "@school/db";

vi.mock("server-only", () => {
  return {};
});

// Mock the db
vi.mock("@school/db", () => {
  const mDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
  };
  return { db: mDb };
});

describe("Payroll Generation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Re-apply default mock ReturnThis since resetAllMocks clears them!
    (db as any).select.mockReturnThis();
    (db as any).from.mockReturnThis();
    (db as any).insert.mockReturnThis();
    (db as any).values.mockReturnThis();
    (db as any).returning.mockResolvedValue([{ id: 1 }]);
    (db as any).update.mockReturnThis();
    (db as any).set.mockReturnThis();
    (db as any).where.mockReturnThis();
    (db as any).delete.mockReturnThis();
    (db as any).innerJoin.mockReturnThis();
  });

  it("should calculate correct net pay for standard employee", async () => {
    const mockContracts = [
      {
        contract: {
          employeeId: 1,
          baseSalary: "15000.00",
          transpoAllowance: "0.00",
          positionPay: "0.00",
          advisoryPay: "0.00",
          holidayPay: "0.00",
          additionalPay: "0.00",
          moderatorPay: "0.00",
          dailySalary: "0.00",
          subjectHoursPerDay: "0.00",
          sssEe: "375.00",
          sssEr: "375.00",
          philhealthEe: "200.00",
          philhealthEr: "200.00",
          pagIbigEe: "2500.00",
          pagIbigEr: "0.00",
        },
        type: "teaching",
      },
    ];

    // Note: generatePayrollsForPeriod does db.select().from().where(), so we mock 'where'
    vi.mocked((db as any).where)
      .mockResolvedValueOnce([{ status: 'DRAFT' }]) // First where: payrollPeriods
      .mockResolvedValueOnce([{ id: 1 }]) // Second where: activeEmployees
      .mockResolvedValueOnce(mockContracts as any); // Third where: contractsQuery

    await generatePayrollsForPeriod(1);

    // Verify what was passed to db.insert().values()
    expect((db as any).values).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          employeeId: 1,
          baseSalary: "15000.00",
          halfSalary: "7500.00", 
          totalEarnings: "7500.00",
          totalDeductions: "3075.00",
          netPay: "4425.00",
        }),
      ])
    );
  });
});

describe("Employee HR Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an employee", async () => {
    const testEmployee = {
      firstName: "John",
      lastName: "Doe",
      type: "non_teaching" as any,
    };
    
    vi.mocked((db as any).returning).mockResolvedValueOnce([{ id: 2, ...testEmployee }]);
    
    const result = await createEmployee(testEmployee);
    
    expect((db as any).insert).toHaveBeenCalled();
    expect((db as any).values).toHaveBeenCalledWith(testEmployee);
    expect(result).toHaveProperty("id", 2);
  });
});
