import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { roleEnum, staffDepartmentEnum } from "../shared/enums";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),

  // Tracking
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const staff = pgTable("staff", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  department: staffDepartmentEnum("department"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});

export const contacts = pgTable("contacts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  subject: varchar({ length: 255 }).notNull(),
  message: text().notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
});
