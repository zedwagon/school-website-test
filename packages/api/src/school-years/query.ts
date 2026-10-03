"use server";

import { classSchedules, db, schoolYears, sections } from "@school/db";
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { validateActionSession } from "../auth/guard";

/**
 * Gets currently active school year
 */
export async function getActiveSchoolYear() {
	await validateActionSession(["admin", "staff", "student"]);
	const [sy] = await db
		.select()
		.from(schoolYears)
		.where(and(eq(schoolYears.isActive, true), isNull(schoolYears.archivedAt)))
		.limit(1);
	return sy ? JSON.parse(JSON.stringify(sy)) : null;
}

/**
 * Gets all school years with optional search, filtering, and pagination
 */
export async function getSchoolYears(
	query?: string,
	filterStatus: "active" | "archived" = "active",
	page = 1,
	limit = 20,
) {
	await validateActionSession(["admin", "staff"]);
	const offset = (page - 1) * limit;

	const baseFilter =
		filterStatus === "active"
			? isNull(schoolYears.archivedAt)
			: isNotNull(schoolYears.archivedAt);

	const searchFilter = query
		? and(baseFilter, ilike(schoolYears.name, `%${query}%`))
		: baseFilter;

	const [countResult] = await db
		.select({ value: count() })
		.from(schoolYears)
		.where(searchFilter);

	const data = await db
		.select()
		.from(schoolYears)
		.where(searchFilter)
		.orderBy(desc(schoolYears.name))
		.limit(limit)
		.offset(offset);

	const [activeRes] = await db
		.select({ value: count() })
		.from(schoolYears)
		.where(isNull(schoolYears.archivedAt));

	const [archivedRes] = await db
		.select({ value: count() })
		.from(schoolYears)
		.where(isNotNull(schoolYears.archivedAt));

	return JSON.parse(
		JSON.stringify({
			data,
			totalCount: Number(countResult.value),
			activeCount: Number(activeRes.value),
			archivedCount: Number(archivedRes.value),
		}),
	);
}

/**
 * Creates a new school year
 */
export async function createSchoolYearQuery(data: {
	name: string;
	startDate?: string | null;
	endDate?: string | null;
}) {
	await validateActionSession(["admin", "staff"], "registrar");
	return db.insert(schoolYears).values({
		name: data.name,
		startDate: data.startDate,
		endDate: data.endDate,
		isActive: false,
	});
}

/**
 * Updates an existing school year
 */
export async function updateSchoolYearQuery(
	id: number,
	data: {
		name: string;
		startDate?: string | null;
		endDate?: string | null;
	},
) {
	await validateActionSession(["admin", "staff"], "registrar");
	return db
		.update(schoolYears)
		.set({
			name: data.name,
			startDate: data.startDate,
			endDate: data.endDate,
		})
		.where(eq(schoolYears.id, id));
}

/**
 * Archives a school year by setting archivedAt
 */
export async function archiveSchoolYearQuery(id: number) {
	await validateActionSession(["admin", "staff"], "registrar");
	return db.transaction(async (tx) => {
		await tx.execute(sql`select pg_advisory_xact_lock(hashtext('mpps:school-year-activation'))`);
		const [year] = await tx.select().from(schoolYears).where(eq(schoolYears.id, id)).for("update");
		if (!year) throw new Error("School year not found");
		if (year.isActive) throw new Error("Select another active school year before archiving this one");
		return tx.update(schoolYears).set({ archivedAt: new Date().toISOString(), isActive: false })
			.where(eq(schoolYears.id, id));
	});
}

/**
 * Restores an archived school year by clearing archivedAt
 */
export async function restoreSchoolYearQuery(id: number) {
	await validateActionSession(["admin", "staff"], "registrar");
	return db
		.update(schoolYears)
		.set({ archivedAt: null })
		.where(eq(schoolYears.id, id));
}

/**
 * Sets one school year as active and deactivates others
 */
export async function toggleActiveSchoolYearQuery(id: number) {
	await validateActionSession(["admin", "staff"], "registrar");
	return db.transaction(async (tx) => {
		// Serialize switches with archival; validate first so an invalid request
		// cannot clear the current active year.
		await tx.execute(sql`select pg_advisory_xact_lock(hashtext('mpps:school-year-activation'))`);
		const [target] = await tx.select().from(schoolYears)
			.where(and(eq(schoolYears.id, id), isNull(schoolYears.archivedAt))).for("update");
		if (!target) throw new Error("School year not found or archived");
		await tx.update(schoolYears).set({ isActive: false }).where(eq(schoolYears.isActive, true));
		await tx.update(schoolYears).set({ isActive: true }).where(eq(schoolYears.id, id));
	});
}

/**
 * Performs a rollover of data from one school year to another
 */
export async function rolloverSchoolYearQuery(data: {
	sourceSyId: number;
	targetSyId: number;
	copySections: boolean;
	copySubjects: boolean;
	copyTeachers: boolean;
	copySchedules: boolean;
}) {
	await validateActionSession(["admin", "staff"], "registrar");
	const { sourceSyId, targetSyId, copySections, copySubjects, copyTeachers, copySchedules } = data;
	if (!Number.isInteger(sourceSyId) || sourceSyId <= 0 || !Number.isInteger(targetSyId) || targetSyId <= 0) {
		throw new Error("Valid source and target school years are required");
	}
	if (sourceSyId === targetSyId) throw new Error("Source and target school years must be different");
	if (!copySections) return { sectionsCount: 0 };

	return db.transaction(async (tx) => {
		// Use the same lifecycle lock as activation/archival before row locks,
		// avoiding an activation-versus-rollover lock-order inversion.
		await tx.execute(sql`select pg_advisory_xact_lock(hashtext('mpps:school-year-activation'))`);
		// Lock both years in a stable order; concurrent rollovers into the same
		// target see previously committed copies before deciding what to insert.
		const years = await tx.select().from(schoolYears)
			.where(inArray(schoolYears.id, [sourceSyId, targetSyId])).orderBy(asc(schoolYears.id)).for("update");
		if (years.length !== 2 || years.some((year) => year.archivedAt)) {
			throw new Error("Source and target school years must exist and not be archived");
		}
		const sourceSections = await tx.select().from(sections)
			.where(and(eq(sections.schoolYearId, sourceSyId), isNull(sections.archivedAt)));
		const targetSections = await tx.select().from(sections).where(eq(sections.schoolYearId, targetSyId));
		const identity = (section: { name: string; gradeLevel: string }) => JSON.stringify([section.name, section.gradeLevel]);
		const existing = new Set(targetSections.map(identity));
		let sectionsCreated = 0;
		for (const sourceSection of sourceSections) {
			// Preserve existing target data, including archived matches; do not
			// replace target subjects or advisers during a repeated import.
			if (existing.has(identity(sourceSection))) continue;
			const [newSection] = await tx.insert(sections).values({
				name: sourceSection.name, gradeLevel: sourceSection.gradeLevel,
				schoolYearId: targetSyId, adviserId: copyTeachers ? sourceSection.adviserId : null,
				room: sourceSection.room,
			}).returning({ id: sections.id });
			existing.add(identity(sourceSection));
			sectionsCreated++;
			if (copySubjects) {
				const assignments = await tx.select().from(classSchedules)
					.where(and(eq(classSchedules.sectionId, sourceSection.id), isNull(classSchedules.archivedAt)));
				if (assignments.length) await tx.insert(classSchedules).values(assignments.map((assignment) => ({
					sectionId: newSection.id, subjectId: assignment.subjectId,
					teacherId: copyTeachers ? assignment.teacherId : null,
					dayOfWeek: copySchedules ? assignment.dayOfWeek : null,
					startTime: copySchedules ? assignment.startTime : null,
					endTime: copySchedules ? assignment.endTime : null,
				})));
			}
		}
		return { sectionsCount: sectionsCreated };
	});
}
