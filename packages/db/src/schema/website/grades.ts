import {
  boolean,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { schoolYears, subjects } from "./academic-core";
import { sections } from "./sections";
import { students } from "./students";
import { users } from "./users";

export const grades = pgTable("grades", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  subjectId: integer("subject_id").references(() => subjects.id), // Nullable for general average
  sectionId: integer("section_id")
    .notNull()
    .references(() => sections.id),
  schoolYearId: integer("school_year_id")
    .notNull()
    .references(() => schoolYears.id),

  grade: decimal("grade", { precision: 5, scale: 2 }), // Allow null if not yet graded
  isGeneralAverage: boolean("is_general_average").default(false).notNull(),
  remarks: text("remarks"),

  encodedById: integer("encoded_by_id").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
