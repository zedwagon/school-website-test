"use server";

import { validateActionSession } from "@school/api/auth/guard";
import { classSchedules, db, enrollmentForms, grades, sectionRosters, sections, staff, students } from "@school/db";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const gradeInputSchema = z.object({
	studentId: z.number().int().positive(),
	subjectId: z.number().int().positive().nullable(),
	grade: z.string().trim().refine(
		(value) => value === "" || (/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value) && Number(value) <= 100),
		"Grades must be a number between 0 and 100 with at most two decimal places",
	),
	isGeneralAverage: z.boolean(),
}).refine((item) => item.isGeneralAverage ? item.subjectId === null : item.subjectId !== null,
	"General averages must have no subject; subject grades require a subject");

export type GradeInput = z.infer<typeof gradeInputSchema>;

export async function saveAdvisoryGrades(
	sectionId: number,
	schoolYearId: number,
	gradesPayload: GradeInput[],
) {
	const { user } = await validateActionSession(["admin", "staff"], "faculty");
	z.number().int().positive().parse(sectionId);
	z.number().int().positive().parse(schoolYearId);
	const payload = z.array(gradeInputSchema).parse(gradesPayload);
	const identities = new Set<string>();
	for (const item of payload) {
		const identity = `${item.studentId}:${item.isGeneralAverage ? "average" : item.subjectId}`;
		if (identities.has(identity)) throw new Error("Duplicate grade in submission");
		identities.add(identity);
	}

	await db.transaction(async (tx) => {
		const staffRecord = await tx.query.staff.findFirst({
			where: and(eq(staff.userId, user.id), isNull(staff.archivedAt)),
		});
		if (!staffRecord && user.role !== "admin") {
			throw new Error("Unauthorized: Staff record not found");
		}
		// Serialize grade saves for this section, including empty-slot inserts.
		const [sectionRecord] = await tx.select().from(sections)
			.where(and(eq(sections.id, sectionId), isNull(sections.archivedAt)))
			.for("update");
		if (!sectionRecord) throw new Error("Section not found");
		if (user.role !== "admin" && sectionRecord.adviserId !== staffRecord?.id) {
			throw new Error("Unauthorized: You are not the adviser for this section");
		}
		if (sectionRecord.schoolYearId !== schoolYearId) {
			throw new Error("School year does not match the section");
		}

		const roster = await tx.select({ studentId: enrollmentForms.studentId })
			.from(sectionRosters)
			.innerJoin(enrollmentForms, eq(sectionRosters.enrollmentId, enrollmentForms.id))
			.innerJoin(students, eq(enrollmentForms.studentId, students.id))
			.where(and(
				eq(sectionRosters.sectionId, sectionId), isNull(sectionRosters.archivedAt),
				eq(enrollmentForms.schoolYearId, schoolYearId), isNull(enrollmentForms.archivedAt),
				isNull(students.archivedAt),
			));
		const schedules = await tx.query.classSchedules.findMany({
			where: and(eq(classSchedules.sectionId, sectionId), isNull(classSchedules.archivedAt)),
		});
		const studentIds = new Set(roster.map((entry) => entry.studentId));
		const subjectIds = new Set(schedules.map((entry) => entry.subjectId));
		// Validate the entire batch before any insert, update, or deletion.
		for (const item of payload) {
			if (!studentIds.has(item.studentId)) throw new Error("Student is not in this section's active roster");
			if (!item.isGeneralAverage && !subjectIds.has(item.subjectId as number)) {
				throw new Error("Subject is not assigned to this section");
			}
		}

		for (const item of payload) {
			const existing = await tx.query.grades.findFirst({
				where: and(
					eq(grades.studentId, item.studentId), eq(grades.sectionId, sectionId),
					eq(grades.schoolYearId, schoolYearId), eq(grades.isGeneralAverage, item.isGeneralAverage),
					item.isGeneralAverage ? isNull(grades.subjectId) : eq(grades.subjectId, item.subjectId as number),
				),
			});
			if (item.grade === "") {
				if (existing) await tx.delete(grades).where(eq(grades.id, existing.id));
				continue;
			}
			const grade = Number(item.grade).toFixed(2);
			if (existing) {
				await tx.update(grades).set({ grade, updatedAt: new Date().toISOString(), encodedById: user.id })
					.where(eq(grades.id, existing.id));
			} else {
				await tx.insert(grades).values({
					studentId: item.studentId, subjectId: item.subjectId, sectionId, schoolYearId,
					grade, isGeneralAverage: item.isGeneralAverage, encodedById: user.id,
				});
			}
		}
	});
	revalidatePath(`/dashboard/staff/faculty/advisory-grades/${sectionId}`);
	return { success: true };
}
