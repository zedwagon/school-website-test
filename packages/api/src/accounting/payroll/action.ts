"use server";
import { db } from "@school/db";
import { employeeContracts, payrollPeriods, payrolls, employees } from "@school/db/schema";
import { eq, isNull, inArray, and } from "drizzle-orm";

import { revalidatePath } from "next/cache";

export async function createPayrollPeriod(data: { name: string; startDate: string; endDate: string }) {
  const existing = await db.select().from(payrollPeriods).where(
    eq(payrollPeriods.name, data.name)
  );

  if (existing.length > 0) {
    throw new Error(`A payroll period for ${data.startDate} to ${data.endDate} already exists.`);
  }

  const result = await db.insert(payrollPeriods).values(data).returning();
  revalidatePath("/dashboard/payroll");
  return result[0];
}

export async function generatePayrollsForPeriod(periodId: number) {
  const period = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, periodId));
  if (period[0]?.status !== 'DRAFT') {
    throw new Error("Cannot regenerate payrolls for a finalized period.");
  }

  const activeEmployees = await db.select({ id: employees.id }).from(employees).where(isNull(employees.archivedAt));
  const activeEmployeeIds = activeEmployees.map(e => e.id);
  
  if (activeEmployeeIds.length === 0) {
    throw new Error("No active employees found.");
  }
  
  // Fetch contracts only for active employees, alongside their type
  const contractsQuery = await db.select({
    contract: employeeContracts,
    type: employees.type,
  }).from(employeeContracts)
    .innerJoin(employees, eq(employeeContracts.employeeId, employees.id))
    .where(inArray(employeeContracts.employeeId, activeEmployeeIds));

  if (contractsQuery.length === 0) {
    throw new Error("No employee contracts found. Please set up contracts first.");
  }

  // Clear existing un-finalized payrolls for this period to prevent duplicates
  await db.delete(payrolls).where(eq(payrolls.periodId, periodId));

  const payrollInserts = contractsQuery.map((row) => {
    const c = row.contract;
    const type = row.type;

    // Fixed base values
    const base = parseFloat(c.baseSalary);
    const half = base / 2; // Typically 15 days cut-off
    const transpo = parseFloat(c.transpoAllowance);
    const posPay = parseFloat(c.positionPay);
    const advPay = parseFloat(c.advisoryPay);
    const holiday = parseFloat(c.holidayPay);
    const additional = parseFloat(c.additionalPay);
    const modPay = parseFloat(c.moderatorPay);
    
    // Part-time specific
    const daily = parseFloat(c.dailySalary);
    const subjHours = parseFloat(c.subjectHoursPerDay);

    let totalEarn = 0;
    
    if (type === "administrators") {
      totalEarn = half;
    } else if (type === "teaching") {
      totalEarn = half + posPay + advPay;
    } else if (type === "non_teaching") {
      totalEarn = half + additional + transpo + holiday + modPay;
    } else if (type === "part_time_teaching") {
      // Generated with 0 classes by default, to be updated in DRAFT mode
      totalEarn = 0; 
    }

    // Deductions calculation
    const sEe = parseFloat(c.sssEe);
    const pEe = parseFloat(c.philhealthEe);
    const iEe = parseFloat(c.pagIbigEe);

    // Part-time has NO standard deductions
    const totalDed = type === "part_time_teaching" ? 0 : sEe + pEe + iEe; 
    const net = totalEarn - totalDed;

    return {
      periodId,
      employeeId: c.employeeId,
      employeeType: type,
      baseSalary: base.toFixed(2),
      halfSalary: half.toFixed(2),
      transpoAllowance: transpo.toFixed(2),
      positionPay: posPay.toFixed(2),
      advisoryPay: advPay.toFixed(2),
      holidayPay: holiday.toFixed(2),
      subjectOverload: "0.00",
      additionalPay: additional.toFixed(2),
      moderatorPay: modPay.toFixed(2),
      dailySalary: daily.toFixed(2),
      subjectHoursPerDay: subjHours.toFixed(2),
      numberOfClasses: 0,
      totalEarnings: totalEarn.toFixed(2),
      sssEe: type === "part_time_teaching" ? "0.00" : c.sssEe,
      sssEr: type === "part_time_teaching" ? "0.00" : c.sssEr,
      philhealthEe: type === "part_time_teaching" ? "0.00" : c.philhealthEe,
      philhealthEr: type === "part_time_teaching" ? "0.00" : c.philhealthEr,
      pagIbigEe: type === "part_time_teaching" ? "0.00" : c.pagIbigEe,
      pagIbigEr: type === "part_time_teaching" ? "0.00" : c.pagIbigEr,
      loanDeduction: "0.00",
      totalDeductions: totalDed.toFixed(2),
      netPay: net.toFixed(2),
    };
  });

  return await db.insert(payrolls).values(payrollInserts).returning();
}

export async function updatePayroll(id: number, data: Partial<typeof payrolls.$inferInsert>) {
  // Recalculate totals if any specific values change
  const current = await db
    .select()
    .from(payrolls)
    .where(eq(payrolls.id, id));
    
  if (!current[0]) throw new Error("Payroll not found");

  const sanitizeStr = (val: any) => (val === "" || val === null || val === undefined || isNaN(parseFloat(val))) ? "0" : String(val);
  
  // Sanitize incoming data to prevent Postgres "" errors
  const sanitizedData: any = {};
  for (const [key, value] of Object.entries(data)) {
    sanitizedData[key] = typeof value === 'string' ? sanitizeStr(value) : value;
  }

  const merged = { ...current[0], ...sanitizedData } as Record<string, any>;
  const type = merged.employeeType; // Use the snapshot type

  const safeParseFloat = (val: any) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  let totalEarn = 0;
  
  if (type === "administrators") {
    totalEarn = safeParseFloat(merged.halfSalary);
  } else if (type === "teaching") {
    totalEarn = safeParseFloat(merged.halfSalary) + safeParseFloat(merged.subjectOverload) + safeParseFloat(merged.positionPay) + safeParseFloat(merged.advisoryPay);
  } else if (type === "non_teaching") {
    totalEarn = safeParseFloat(merged.halfSalary) + safeParseFloat(merged.additionalPay) + safeParseFloat(merged.subjectOverload) + safeParseFloat(merged.transpoAllowance) + safeParseFloat(merged.holidayPay) + safeParseFloat(merged.moderatorPay);
  } else if (type === "part_time_teaching") {
    totalEarn = parseInt(merged.numberOfClasses || "0") * safeParseFloat(merged.dailySalary);
  }

  const totalDed = type === "part_time_teaching" ? 0 : safeParseFloat(merged.sssEe) + safeParseFloat(merged.philhealthEe) + safeParseFloat(merged.pagIbigEe) + safeParseFloat(merged.loanDeduction);
  const net = totalEarn - totalDed;

  const updateData = {
    ...data,
    totalEarnings: totalEarn.toFixed(2),
    totalDeductions: totalDed.toFixed(2),
    netPay: net.toFixed(2),
  };

  return await db.update(payrolls).set(updateData).where(eq(payrolls.id, id)).returning();
}

export async function updatePayrollPeriod(id: number, data: { status?: "DRAFT" | "FINALIZED" | "PAID"; name?: string }) {
  const result = await db.update(payrollPeriods).set(data).where(eq(payrollPeriods.id, id)).returning();
  return result[0];
}

export async function saveEmployeeContract(employeeId: number, data: Partial<typeof employeeContracts.$inferInsert>) {
  // Fetch employee to determine type and strictly zero out irrelevant fields
  const employeeRecord = await db.select({ type: employees.type }).from(employees).where(eq(employees.id, employeeId));
  const type = employeeRecord[0]?.type;

  const sanitizeStr = (val: any) => (val === "" || val === null || val === undefined || isNaN(parseFloat(val))) ? "0" : String(val);
  const sanitizedData: any = {};
  for (const [key, value] of Object.entries(data)) {
    sanitizedData[key] = typeof value === 'string' ? sanitizeStr(value) : value;
  }

  // Zero out fields based on employee type
  if (type === "part_time_teaching") {
    sanitizedData.baseSalary = "0";
    sanitizedData.transpoAllowance = "0";
    sanitizedData.positionPay = "0";
    sanitizedData.advisoryPay = "0";
    sanitizedData.holidayPay = "0";
    sanitizedData.additionalPay = "0";
    sanitizedData.moderatorPay = "0";
    sanitizedData.sssEe = "0";
    sanitizedData.sssEr = "0";
    sanitizedData.philhealthEe = "0";
    sanitizedData.philhealthEr = "0";
    sanitizedData.pagIbigEe = "0";
    sanitizedData.pagIbigEr = "0";
    sanitizedData.loanDeduction = "0";
  } else {
    sanitizedData.dailySalary = "0";
    sanitizedData.subjectHoursPerDay = "0";

    if (type === "administrators") {
      sanitizedData.transpoAllowance = "0";
      sanitizedData.positionPay = "0";
      sanitizedData.advisoryPay = "0";
      sanitizedData.holidayPay = "0";
      sanitizedData.additionalPay = "0";
      sanitizedData.moderatorPay = "0";
    } else if (type === "teaching") {
      sanitizedData.additionalPay = "0";
      sanitizedData.transpoAllowance = "0";
      sanitizedData.holidayPay = "0";
      sanitizedData.moderatorPay = "0";
    } else if (type === "non_teaching") {
      sanitizedData.positionPay = "0";
      sanitizedData.advisoryPay = "0";
    }
  }

  const existing = await db.select().from(employeeContracts).where(eq(employeeContracts.employeeId, employeeId));
  if (existing.length > 0) {
    const result = await db.update(employeeContracts).set(sanitizedData).where(eq(employeeContracts.employeeId, employeeId)).returning();
    return result[0];
  } else {
    const result = await db.insert(employeeContracts).values({ employeeId, ...sanitizedData }).returning();
    return result[0];
  }
}

export async function createEmployee(data: { firstName: string, lastName: string, middleName?: string, type: "part_time_teaching" | "non_teaching" | "teaching" | "administrators" }) {
  const result = await db.insert(employees).values(data).returning();
  return result[0];
}

export async function updateEmployee(id: number, data: Partial<typeof employees.$inferInsert>) {
  const result = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
  return result[0];
}

export async function updatePayrollRecord(id: number, data: any) {
  const result = await db.update(payrolls).set(data).where(eq(payrolls.id, id)).returning();
  return result[0];
}

export async function updatePayrollPeriodStatus(periodId: number, status: "DRAFT" | "FINALIZED" | "PAID") {
  const result = await db.update(payrollPeriods).set({ status }).where(eq(payrollPeriods.id, periodId)).returning();
  return result[0];
}

export async function toggleEmployeeStatus(employeeId: number, isActive: boolean) {
  const archivedAt = isActive ? null : new Date().toISOString();
  const result = await db.update(employees).set({ archivedAt }).where(eq(employees.id, employeeId)).returning();
  return result[0];
}
