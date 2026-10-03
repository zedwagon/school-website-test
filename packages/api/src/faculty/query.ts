import "server-only";
import { validateActionSession } from "../auth/guard";
import { db, staff, users } from "@school/db";
import {
	and,
	asc,
	count,
	eq,
	ilike,
	isNotNull,
	isNull,
	or,
	sql,
} from "drizzle-orm";


// Resolve the linked account in the same transaction as the mutation. Never
// trust a caller-supplied user ID to identify the account being edited.
async function requireTeacherTarget(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], id: number, userId: number) {
	const [teacher] = await tx
		.select({ userId: staff.userId })
		.from(staff)
		.innerJoin(users, eq(users.id, staff.userId))
		.where(and(
			eq(staff.id, id),
			eq(users.role, "staff"),
			or(eq(staff.department, "faculty"), isNull(staff.department)),
		))
		.for("update");
	if (!teacher || teacher.userId !== userId) {
		throw new Error("Teacher not found");
	}
	return teacher.userId;
}

/**
 * Gets teachers (staff in faculty or no department) with filters and pagination
 */
export async function getTeachers(
	query?: string,
	filterStatus: "active" | "archived" = "active",
	page = 1,
	limit = 10,
) {
	const offset = (page - 1) * limit;

	const baseFilter =
		filterStatus === "active"
			? and(
					eq(users.role, "staff"),
					isNull(users.archivedAt),
					isNull(staff.archivedAt),
					or(isNull(staff.department), eq(staff.department, "faculty")),
				)
			: and(
					eq(users.role, "staff"),
					or(isNotNull(users.archivedAt), isNotNull(staff.archivedAt)),
					or(isNull(staff.department), eq(staff.department, "faculty")),
				);

	const searchFilter = query
		? and(
				baseFilter,
				or(
					ilike(staff.lastName, `%${query}%`),
					ilike(staff.firstName, `%${query}%`),
					ilike(staff.middleName, `%${query}%`),
					ilike(users.email, `%${query}%`),
					ilike(
						sql`concat(${staff.firstName}, ' ', ${staff.lastName})`,
						`%${query}%`,
					),
					ilike(
						sql`concat(${staff.firstName}, ' ', ${staff.middleName})`,
						`%${query}%`,
					),
					ilike(
						sql`concat(${staff.firstName}, ' ', ${staff.middleName}, ' ', ${staff.lastName})`,
						`%${query}%`,
					),
				),
			)
		: baseFilter;

	const [countResult] = await db
		.select({ value: count() })
		.from(users)
		.innerJoin(staff, eq(users.id, staff.userId))
		.where(searchFilter);

	const data = await db
		.select({
			id: staff.id,
			userId: users.id,
			firstName: staff.firstName,
			middleName: staff.middleName,
			lastName: staff.lastName,
			email: users.email,
			department: staff.department,
			createdAt: staff.createdAt,
			archivedAt: staff.archivedAt,
		})
		.from(users)
		.innerJoin(staff, eq(users.id, staff.userId))
		.where(searchFilter)
		.orderBy(asc(staff.lastName))
		.limit(limit)
		.offset(offset);

	const [activeRes] = await db
		.select({ value: count() })
		.from(users)
		.innerJoin(staff, eq(users.id, staff.userId))
		.where(
			and(
				eq(users.role, "staff"),
				isNull(users.archivedAt),
				isNull(staff.archivedAt),
				or(isNull(staff.department), eq(staff.department, "faculty")),
			),
		);

	const [archivedRes] = await db
		.select({ value: count() })
		.from(users)
		.innerJoin(staff, eq(users.id, staff.userId))
		.where(
			and(
				eq(users.role, "staff"),
				or(isNotNull(users.archivedAt), isNotNull(staff.archivedAt)),
				or(isNull(staff.department), eq(staff.department, "faculty")),
			),
		);

	return {
		data,
		totalCount: Number(countResult.value),
		activeCount: Number(activeRes.value),
		archivedCount: Number(archivedRes.value),
	};
}

/**
 * Creates a new teacher record (User + Staff)
 */
export async function createTeacherQuery(data: {
	email: string;
	passwordHash: string;
	firstName: string;
	middleName?: string | null;
	lastName: string;
}) {
	await validateActionSession(["admin", "staff"], "registrar");
	return db.transaction(async (tx) => {
		const [newUser] = await tx
			.insert(users)
			.values({
				email: data.email,
				passwordHash: data.passwordHash,
				role: "staff",
			})
			.returning({ id: users.id });

		await tx.insert(staff).values({
			userId: newUser.id,
			firstName: data.firstName,
			middleName: data.middleName || null,
			lastName: data.lastName,
			department: "faculty",
		});

		return { id: newUser.id };
	});
}

/**
 * Updates an existing teacher's info across User and Staff tables
 */
export async function updateTeacherQuery(
	id: number,
	data: {
		userId: number;
		email: string;
		passwordHash?: string;
		firstName: string;
		middleName?: string | null;
		lastName: string;
	},
) {
	await validateActionSession(["admin", "staff"], "registrar");
	return db.transaction(async (tx) => {
		await requireTeacherTarget(tx, id, data.userId);
		// Update user info
		const userUpdate: Record<string, string> = { email: data.email };
		if (data.passwordHash) {
			userUpdate.passwordHash = data.passwordHash;
		}

		await tx.update(users).set(userUpdate).where(eq(users.id, data.userId));

		// Update staff info
		await tx
			.update(staff)
			.set({
				firstName: data.firstName,
				middleName: data.middleName || null,
				lastName: data.lastName,
			})
			.where(eq(staff.id, id));
	});
}

/**
 * Archives both User and Staff records
 */
export async function archiveTeacherQuery(id: number, userId: number) {
	await validateActionSession(["admin", "staff"], "registrar");
	const now = new Date().toISOString();
	return db.transaction(async (tx) => {
		await requireTeacherTarget(tx, id, userId);
		await tx.update(users).set({ archivedAt: now, sessionVersion: sql`${users.sessionVersion} + 1` }).where(eq(users.id, userId));
		await tx.update(staff).set({ archivedAt: now }).where(eq(staff.id, id));
	});
}

/**
 * Restores both User and Staff records
 */
export async function restoreTeacherQuery(id: number, userId: number) {
	await validateActionSession(["admin", "staff"], "registrar");
	return db.transaction(async (tx) => {
		await requireTeacherTarget(tx, id, userId);
		await tx
			.update(users)
			.set({ archivedAt: null })
			.where(eq(users.id, userId));
		await tx.update(staff).set({ archivedAt: null }).where(eq(staff.id, id));
	});
}
