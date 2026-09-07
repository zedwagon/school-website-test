import {
  boolean,
  date,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { schoolYears } from "./academic-core";
import {
  genderEnum,
  gradeLevelEnum,
  learnerTypeEnum,
  paymentStatusEnum,
  shsTrackEnum,
  studentTypeEnum,
} from "../shared/enums";
import { users } from "./users";

export const students = pgTable("students", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),

  // Student identification
  lrn: varchar({ length: 12 }).unique(), // Learner Reference Number
  psaBirthCertNo: varchar("psa_birth_cert_no", { length: 50 }),

  // Personal Information (static)
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  suffix: varchar({ length: 20 }),
  birthdate: date().notNull(),
  gender: genderEnum().notNull(),

  // Address
  address: text("address"),
  zipCode: varchar("zip_code", { length: 10 }),

  // Parent info (static, stays with student)
  fatherName: varchar("parent_father_name", { length: 255 }),
  motherMaidenName: varchar("parent_mother_maiden_name", { length: 255 }),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const enrollmentForms = pgTable("enrollment_forms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  schoolYearId: integer("school_year_id")
    .notNull()
    .references(() => schoolYears.id),

  // Student Classification (Per Year)
  studentType: studentTypeEnum("student_type").notNull(),
  isEnrolled: boolean("is_enrolled").default(false).notNull(),
  statusNote: text("status_note"), // e.g. 'dropped', 'transferred', or any custom note

  // Academic (can change yearly)
  gradeLevel: gradeLevelEnum("grade_level").notNull(),
  shsTrack: shsTrackEnum("shs_track"), // Only for SENIOR_HIGH
  learnerType: learnerTypeEnum("learner_type").notNull(),

  // Guardian info (per enrollment year)
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianContact: varchar("guardian_contact", { length: 50 }),
  guardianRelationship: varchar("guardian_relationship", { length: 100 }),

  // Education History (For transferees/balik-aral)
  lastGradeLevelCompleted: varchar("last_grade_level_completed", {
    length: 100,
  }),
  lastSchoolYearCompleted: varchar("last_school_year_completed", {
    length: 50,
  }),
  lastSchoolName: varchar("last_school_name", { length: 255 }),
  lastSchoolId: varchar("last_school_id", { length: 50 }),
  lastSchoolAddress: text("last_school_address"),

  // Enrollment Tags (e.g. Subsidy status)
  isEsc: boolean("is_esc").default(false).notNull(),
  escNumber: varchar("esc_number", { length: 50 }),
  isShsVoucher: boolean("is_shs_voucher").default(false).notNull(),

  assistedById: integer("assisted_by_id").references(() => users.id),
  assistedAt: timestamp("assisted_at", { mode: "string" }),

  // Station 2: Clinic (Physical Exam)
  statusClinicDone: boolean("status_clinic_done").default(false).notNull(),
  statusClinicFinishedAt: timestamp("status_clinic_finished_at", {
    mode: "string",
  }),
  statusClinicNote: text("status_clinic_note"),
  statusClinicMedicalHistory: json("status_clinic_medical_history"),

  // Station 3: Guidance
  statusGuidanceDone: boolean("status_guidance_done").default(false).notNull(),
  statusGuidanceFinishedAt: timestamp("status_guidance_finished_at", {
    mode: "string",
  }),
  statusGuidanceNote: text("status_guidance_note"),
  statusGuidanceProfile: json("status_guidance_profile"),
  statusGuidanceNeeds: json("status_guidance_needs"),
  statusGuidanceHasDiagnosis: boolean("status_guidance_has_diagnosis").default(
    false
  ),

  // Station 4: Accounting
  statusAccountingDone: boolean("status_accounting_done")
    .default(false)
    .notNull(),
  statusAccountingFinishedAt: timestamp("status_accounting_finished_at", {
    mode: "string",
  }),
  statusAccountingNote: text("status_accounting_note"),
  statusRegistrarNote: text("status_registrar_note"),
  statusAccountingSiNumber: text("status_accounting_si_number"),
  statusAccountingPaymentType: paymentStatusEnum(
    "status_accounting_payment_type"
  )
    .default("pending")
    .notNull(),

  // Tracking: Who approved what?
  statusClinicApprovedById: integer("status_clinic_approved_by_id").references(
    () => users.id
  ),
  statusGuidanceApprovedById: integer(
    "status_guidance_approved_by_id"
  ).references(() => users.id),
  statusAccountingApprovedById: integer(
    "status_accounting_approved_by_id"
  ).references(() => users.id),
  statusRegistrarApprovedById: integer(
    "status_registrar_approved_by_id"
  ).references(() => users.id),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
  exitAt: timestamp("exit_at", { mode: "string" }),
});
