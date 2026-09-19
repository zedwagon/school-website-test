"use server";

import { z, ZodError } from "zod";
import {
	archiveSchoolYearQuery,
	createSchoolYearQuery,
	restoreSchoolYearQuery,
	rolloverSchoolYearQuery,
	toggleActiveSchoolYearQuery,
	updateSchoolYearQuery,
} from "./query";

const schoolYearSchema = z.object({
	name: z.string().min(1, "Name is required").max(15, "Name is too long"),
	startDate: z.string().min(1, "Start Date is required"),
	endDate: z.string().min(1, "End Date is required"),
});

const rolloverSchema = z.object({
	sourceSyId: z.number(),
	targetSyId: z.number(),
	copySections: z.boolean(),
	copySubjects: z.boolean(),
	copyTeachers: z.boolean(),
	copySchedules: z.boolean(),
});

export async function createSchoolYear(data: z.infer<typeof schoolYearSchema>) {
	try {
		const validated = schoolYearSchema.parse(data);

		await createSchoolYearQuery({
			name: validated.name,
			startDate: validated.startDate,
			endDate: validated.endDate,
		});

		return { success: true };
	} catch (err: unknown) {
		console.error("Create SY Error:", err);
		if (err instanceof ZodError) {
			return { error: err.issues[0].message };
		}
		return {
			error:
				err instanceof Error ? err.message : "Failed to create school year",
		};
	}
}

export async function updateSchoolYear(
	id: number,
	data: z.infer<typeof schoolYearSchema>,
) {
	try {
		const validated = schoolYearSchema.parse(data);

		await updateSchoolYearQuery(id, {
			name: validated.name,
			startDate: validated.startDate,
			endDate: validated.endDate,
		});

		return { success: true };
	} catch (err: unknown) {
		console.error("Update SY Error:", err);
		if (err instanceof ZodError) {
			return { error: err.issues[0].message };
		}
		return {
			error:
				err instanceof Error ? err.message : "Failed to update school year",
		};
	}
}

export async function archiveSchoolYear(id: number) {
	try {
		await archiveSchoolYearQuery(id);
		return { success: true };
	} catch (err: unknown) {
		return {
			error:
				err instanceof Error ? err.message : "Failed to archive school year",
		};
	}
}

export async function restoreSchoolYear(id: number) {
	try {
		await restoreSchoolYearQuery(id);
		return { success: true };
	} catch (err: unknown) {
		return {
			error:
				err instanceof Error ? err.message : "Failed to restore school year",
		};
	}
}

export async function toggleActiveSchoolYear(id: number) {
	try {
		await toggleActiveSchoolYearQuery(id);
		return { success: true };
	} catch (err: unknown) {
		return {
			error:
				err instanceof Error ? err.message : "Failed to set active school year",
		};
	}
}

export async function rolloverSchoolYear(data: z.infer<typeof rolloverSchema>) {
	try {
		const validated = rolloverSchema.parse(data);

		const result = await rolloverSchoolYearQuery(validated);

		return { success: true, sectionsCount: result.sectionsCount };
	} catch (err: unknown) {
		console.error("Rollover Error:", err);
		return {
			error: err instanceof Error ? err.message : "Failed to perform rollover",
		};
	}
}
