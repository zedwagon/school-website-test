import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	date,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

export const schoolYears = pgTable(
	"school_years",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: varchar({ length: 50 }).notNull(), // e.g., "SY 2025-2026"
		startDate: date("start_date"),
		endDate: date("end_date"),
		isActive: boolean("is_active").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		archivedAt: timestamp("archived_at", { mode: "string" }),
	},
	(table) => [
		uniqueIndex("school_years_one_active")
			.on(table.isActive)
			.where(sql`${table.isActive} = true`),
		check(
			"school_years_active_not_archived",
			sql`not ${table.isActive} or ${table.archivedAt} is null`,
		),
	],
);

export const subjects = pgTable("subjects", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 50 }),
	description: text(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	archivedAt: timestamp("archived_at", { mode: "string" }),
});
