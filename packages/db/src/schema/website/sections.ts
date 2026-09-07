import {
  integer,
  pgTable,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { schoolYears, subjects } from "./academic-core";
import { dayOfWeekEnum, gradeLevelEnum } from "../shared/enums";
import { enrollmentForms } from "./students";
import { staff } from "./users";

export const sections = pgTable("sections", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(), // e.g., "Apple"
  gradeLevel: gradeLevelEnum("grade_level").notNull(),
  schoolYearId: integer("school_year_id")
    .notNull()
    .references(() => schoolYears.id),
  adviserId: integer("adviser_id").references(() => staff.id),
  room: varchar({ length: 100 }), // Room number/name
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const classSchedules = pgTable("class_schedules", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sectionId: integer("section_id")
    .notNull()
    .references(() => sections.id),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  teacherId: integer("teacher_id").references(() => staff.id),

  // Schedule
  dayOfWeek: dayOfWeekEnum("day_of_week"),
  startTime: time("start_time"),
  endTime: time("end_time"),

  archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const sectionRosters = pgTable("section_rosters", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  enrollmentId: integer("enrollment_id")
    .notNull()
    .references(() => enrollmentForms.id),
  sectionId: integer("section_id")
    .notNull()
    .references(() => sections.id),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});
