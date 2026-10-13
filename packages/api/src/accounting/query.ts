import {
	db,
	enrollmentForms,
	schoolYears,
	staff,
	students,
	users,
} from "@school/db";
import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";

/**
 * Gets all students pending payment (Station 4)
 * Note: Authorization should be handled by the caller
 */
export async function getPendingPayments(search?: string, gradeLevel?: string) {
	const [activeSY] = await db
		.select()
		.from(schoolYears)
		.where(eq(schoolYears.isActive, true))
		.limit(1);

	if (!activeSY) {
		return { data: [] };
	}

	let filter = and(
		eq(enrollmentForms.schoolYearId, activeSY.id),
		eq(enrollmentForms.statusGuidanceDone, true),
		eq(enrollmentForms.statusAccountingDone, false),
		isNull(enrollmentForms.statusNote),
		isNull(enrollmentForms.archivedAt),
		isNull(students.archivedAt),
		isNull(users.archivedAt),
		...(gradeLevel ? [eq(enrollmentForms.gradeLevel, gradeLevel as any)] : []),
	)!;

	const [totalResult] = await db
		.select({ value: count() })
		.from(enrollmentForms)
		.innerJoin(students, eq(enrollmentForms.studentId, students.id))
		.innerJoin(users, eq(students.userId, users.id))
		.where(filter);

	if (search) {
		filter = and(
			filter,
			or(
				ilike(students.firstName, `%${search}%`),
				ilike(students.lastName, `%${search}%`),
			),
		)!;
	}

	const pending = await db
		.select({
			id: students.id,
			enrollmentFormId: enrollmentForms.id,
			firstName: students.firstName,
			middleName: students.middleName,
			lastName: students.lastName,
			suffix: students.suffix,
			gradeLevel: enrollmentForms.gradeLevel,
			statusAccountingPaymentType: enrollmentForms.statusAccountingPaymentType,
			statusGuidanceFinishedAt: enrollmentForms.statusGuidanceFinishedAt,
		})
		.from(enrollmentForms)
		.innerJoin(students, eq(enrollmentForms.studentId, students.id))
		.innerJoin(users, eq(students.userId, users.id))
		.where(filter);

	return { data: pending, totalCount: Number(totalResult.value) };
}

/**
 * Gets all students cleared by accounting
 */
export async function getClearedPayments(search?: string, gradeLevel?: string) {
	const [activeSY] = await db
		.select()
		.from(schoolYears)
		.where(eq(schoolYears.isActive, true))
		.limit(1);

	if (!activeSY) {
		return { data: [] };
	}

	let filter = and(
		eq(enrollmentForms.schoolYearId, activeSY.id),
		eq(enrollmentForms.statusAccountingDone, true),
		isNull(enrollmentForms.statusNote),
		isNull(enrollmentForms.archivedAt),
		...(gradeLevel ? [eq(enrollmentForms.gradeLevel, gradeLevel as any)] : []),
	)!;

	const [totalResult] = await db
		.select({ value: count() })
		.from(enrollmentForms)
		.where(filter);

	if (search) {
		filter = and(
			filter,
			or(
				ilike(students.firstName, `%${search}%`),
				ilike(students.lastName, `%${search}%`),
			),
		)!;
	}

	const cleared = await db
		.select({
			id: students.id,
			enrollmentFormId: enrollmentForms.id,
			firstName: students.firstName,
			middleName: students.middleName,
			lastName: students.lastName,
			suffix: students.suffix,
			gradeLevel: enrollmentForms.gradeLevel,
			statusAccountingPaymentType: enrollmentForms.statusAccountingPaymentType,
			statusAccountingSiNumber: enrollmentForms.statusAccountingSiNumber,
			statusAccountingNote: enrollmentForms.statusAccountingNote,
			statusAccountingFinishedAt: enrollmentForms.statusAccountingFinishedAt,
			approvedByFirstName: staff.firstName,
			approvedByLastName: staff.lastName,
		})
		.from(enrollmentForms)
		.innerJoin(students, eq(enrollmentForms.studentId, students.id))
		.leftJoin(
			staff,
			eq(enrollmentForms.statusAccountingApprovedById, staff.userId),
		)
		.where(filter)
		.orderBy(desc(enrollmentForms.statusAccountingFinishedAt));

	return { data: cleared, totalCount: Number(totalResult.value) };
}

export async function updatePaymentStatusQuery(
	formId: number,
	approvedById: number,
	status: "full_payment" | "down_payment" | "insufficient" | "promissory_note",
	notes?: string,
	siNumber?: string,
) {
	const shouldMarkPaid =
		status === "full_payment" ||
		status === "down_payment" ||
		status === "promissory_note";

	const result = await db
		.update(enrollmentForms)
		.set({
			statusAccountingPaymentType: status,
			statusAccountingSiNumber: siNumber ?? null,
			statusAccountingNote: notes ?? null,
			statusAccountingDone: shouldMarkPaid,
			statusAccountingFinishedAt: shouldMarkPaid
				? new Date().toISOString()
				: null,
			statusAccountingApprovedById: approvedById,
		})
		.where(
			and(
				eq(enrollmentForms.id, formId),
				isNull(enrollmentForms.archivedAt),
				eq(enrollmentForms.statusClinicDone, true),
				eq(enrollmentForms.statusGuidanceDone, true),
			),
		)
		.returning({ id: enrollmentForms.id });
	if (!result.length)
		throw new Error(
			"Clinic and Guidance clearances are required for an active enrollment before payment confirmation",
		);
}

export async function editPaymentStatusQuery(
	formId: number,
	status: "full_payment" | "down_payment" | "insufficient" | "promissory_note",
	notes?: string,
	siNumber?: string,
) {
	const shouldMarkPaid =
		status === "full_payment" ||
		status === "down_payment" ||
		status === "promissory_note";

	await db
		.update(enrollmentForms)
		.set({
			statusAccountingPaymentType: status,
			statusAccountingSiNumber: siNumber ?? null,
			statusAccountingNote: notes ?? null,
			statusAccountingDone: shouldMarkPaid,
		})
		.where(eq(enrollmentForms.id, formId));
}
