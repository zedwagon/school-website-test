import {
  integer,
  pgTable,
  text,
  timestamp,
  numeric,
  date,
  varchar,
  pgSchema,
} from "drizzle-orm/pg-core";
import { users } from "../website/users";
import { employeeTypeEnum } from "../shared/enums";
import { relations } from "drizzle-orm";

export const accountingSchema = pgSchema("accounting");

// 1. Employees (Accounting HR Roster)
export const employees = accountingSchema.table("employees", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  type: employeeTypeEnum("type").notNull(),
  userId: integer("user_id").references(() => users.id), // Nullable link to system access
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  contract: one(employeeContracts, {
    fields: [employees.id],
    references: [employeeContracts.employeeId],
  }),
  payrolls: many(payrolls),
}));

// 2. Employee Contracts
// Stores the permanent/reusable base salary and standard allowances/deductions for a staff member.
export const employeeContracts = accountingSchema.table("employee_contracts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  employeeId: integer("employee_id").notNull().unique().references(() => employees.id),
  
  // Earnings
  baseSalary: numeric("base_salary", { precision: 10, scale: 2 }).default("0").notNull(),
  transpoAllowance: numeric("transpo_allowance", { precision: 10, scale: 2 }).default("0").notNull(),
  positionPay: numeric("position_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  advisoryPay: numeric("advisory_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  holidayPay: numeric("holiday_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  additionalPay: numeric("additional_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  moderatorPay: numeric("moderator_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  dailySalary: numeric("daily_salary", { precision: 10, scale: 2 }).default("0").notNull(),
  subjectHoursPerDay: numeric("subject_hours_per_day", { precision: 10, scale: 2 }).default("0").notNull(),

  // Standard Deductions
  sssEe: numeric("sss_ee", { precision: 10, scale: 2 }).default("0").notNull(),
  sssEr: numeric("sss_er", { precision: 10, scale: 2 }).default("0").notNull(),
  philhealthEe: numeric("philhealth_ee", { precision: 10, scale: 2 }).default("0").notNull(),
  philhealthEr: numeric("philhealth_er", { precision: 10, scale: 2 }).default("0").notNull(),
  pagIbigEe: numeric("pag_ibig_ee", { precision: 10, scale: 2 }).default("0").notNull(),
  pagIbigEr: numeric("pag_ibig_er", { precision: 10, scale: 2 }).default("0").notNull(),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const employeeContractsRelations = relations(employeeContracts, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeContracts.employeeId],
    references: [employees.id],
  }),
}));

// 3. Payroll Periods
// Tracks a specific cut-off (e.g., "June 16-31, 2026")
export const payrollPeriods = accountingSchema.table("payroll_periods", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(), // e.g. "JUNE 16-31, 2026"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status", { enum: ["DRAFT", "FINALIZED", "PAID"] }).default("DRAFT").notNull(),
  
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const payrollPeriodsRelations = relations(payrollPeriods, ({ many }) => ({
  payrolls: many(payrolls),
}));

// 4. Payrolls
// A specific payroll record for a specific staff member during a specific period.
export const payrolls = accountingSchema.table("payrolls", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  periodId: integer("period_id").notNull().references(() => payrollPeriods.id),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  employeeType: employeeTypeEnum("employee_type").default("teaching").notNull(),

  // Snapshot of Earnings for this specific period
  baseSalary: numeric("base_salary", { precision: 10, scale: 2 }).default("0").notNull(),
  halfSalary: numeric("half_salary", { precision: 10, scale: 2 }).default("0").notNull(), // Usually baseSalary / 2
  transpoAllowance: numeric("transpo_allowance", { precision: 10, scale: 2 }).default("0").notNull(),
  positionPay: numeric("position_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  advisoryPay: numeric("advisory_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  holidayPay: numeric("holiday_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  subjectOverload: numeric("subject_overload", { precision: 10, scale: 2 }).default("0").notNull(),
  additionalPay: numeric("additional_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  moderatorPay: numeric("moderator_pay", { precision: 10, scale: 2 }).default("0").notNull(),
  dailySalary: numeric("daily_salary", { precision: 10, scale: 2 }).default("0").notNull(),
  subjectHoursPerDay: numeric("subject_hours_per_day", { precision: 10, scale: 2 }).default("0").notNull(),
  numberOfClasses: integer("number_of_classes").default(0).notNull(),
  totalEarnings: numeric("total_earnings", { precision: 10, scale: 2 }).default("0").notNull(),

  // Snapshot of Deductions for this specific period
  sssEe: numeric("sss_ee", { precision: 10, scale: 2 }).default("0").notNull(),
  sssEr: numeric("sss_er", { precision: 10, scale: 2 }).default("0").notNull(),
  philhealthEe: numeric("philhealth_ee", { precision: 10, scale: 2 }).default("0").notNull(),
  philhealthEr: numeric("philhealth_er", { precision: 10, scale: 2 }).default("0").notNull(),
  pagIbigEe: numeric("pag_ibig_ee", { precision: 10, scale: 2 }).default("0").notNull(),
  pagIbigEr: numeric("pag_ibig_er", { precision: 10, scale: 2 }).default("0").notNull(),
  loanDeduction: numeric("loan_deduction", { precision: 10, scale: 2 }).default("0").notNull(),
  totalDeductions: numeric("total_deductions", { precision: 10, scale: 2 }).default("0").notNull(),
  
  // Net Pay
  netPay: numeric("net_pay", { precision: 10, scale: 2 }).default("0").notNull(),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const payrollsRelations = relations(payrolls, ({ one }) => ({
  period: one(payrollPeriods, {
    fields: [payrolls.periodId],
    references: [payrollPeriods.id],
  }),
  employee: one(employees, {
    fields: [payrolls.employeeId],
    references: [employees.id],
  }),
}));


