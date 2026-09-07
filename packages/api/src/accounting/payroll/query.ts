import "server-only";
import { db } from "@school/db";
import { employeeContracts, payrollPeriods, payrolls, employees } from "@school/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getPayrollPeriods() {
  return await db.select().from(payrollPeriods).orderBy(desc(payrollPeriods.startDate));
}

export async function getPayrollPeriodById(id: number) {
  const result = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, id));
  return result[0];
}

export async function getPayrollsByPeriod(periodId: number) {
  return await db.query.payrolls.findMany({
    where: eq(payrolls.periodId, periodId),
    with: {
      employee: true,
    },
  });
}

export async function getEmployeeContracts() {
  return await db.query.employeeContracts.findMany({
    with: {
      employee: true,
    },
  });
}

export async function getAllEmployeesWithContracts() {
  const result = await db
    .select({
      employee: employees,
      contract: employeeContracts,
    })
    .from(employees)
    .leftJoin(employeeContracts, eq(employees.id, employeeContracts.employeeId))
    .orderBy(desc(employees.createdAt));
    
  return result;
}

export async function getPayrollsForPrint(periodId: number) {
  return await db.query.payrolls.findMany({
    where: eq(payrolls.periodId, periodId),
    with: {
      employee: true,
      period: true,
    },
  });
}

