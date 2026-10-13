import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import WebSocket, { WebSocketServer } from "ws";
import { DatabaseWebSocket } from "../src/database-websocket";
import { RecoveringPool } from "../src/recovering-pool";
import * as schema from "../src/schema";

// Only the request session and Next cache are replaced. Authorization, actions,
// transactions and Neon transport run against a fresh loopback-only database.
const state = vi.hoisted(() => ({
	db: undefined as unknown,
	auth: null as import("../../api/src/auth/guard").AuthResult | null,
}));
vi.mock("../src/index", async () => ({
	...(await vi.importActual("../src/schema")),
	get db() {
		return state.db;
	},
}));
vi.mock("../../api/node_modules/server-only/index.js", () => ({}));
vi.mock("../../api/src/auth/session", () => ({ getSession: () => state.auth }));
vi.mock("../../api/node_modules/next/cache.js", () => ({
	revalidatePath: vi.fn(),
}));
vi.mock("../../../apps/website/node_modules/next/cache.js", () => ({
	revalidatePath: vi.fn(),
}));

import { saveAdvisoryGrades } from "../../../apps/website/src/app/dashboard/staff/faculty/advisory-grades/actions";
import { updatePaymentStatus } from "../../api/src/accounting/action";
import { approvePhysical } from "../../api/src/clinic/action";
import {
	approveEnrollment,
	enrollStudentForSY,
	updateEnrollmentStatus,
} from "../../api/src/enrollment/action";
import { approveGuidance } from "../../api/src/guidance/action";
import {
	assignStudentToSection,
	unassignStudentFromSection,
} from "../../api/src/sections/action";

describe.skipIf(process.env.RUN_ENROLLMENT_INTEGRATION !== "1")(
	"enrollment workflow against disposable PostgreSQL",
	() => {
		const pgBin = process.env.PG_BIN || "/usr/lib/postgresql/18/bin";
		const postgresPort = 55444;
		let dataDir: string;
		let started = false;
		let server: WebSocketServer;
		let pool: RecoveringPool;
		const sockets = new Set<net.Socket>();
		const original = {
			wsProxy: neonConfig.wsProxy,
			webSocketConstructor: neonConfig.webSocketConstructor,
			useSecureWebSocket: neonConfig.useSecureWebSocket,
			forceDisablePgSSL: neonConfig.forceDisablePgSSL,
			pipelineConnect: neonConfig.pipelineConnect,
		};
		beforeAll(async () => {
			dataDir = mkdtempSync(join(tmpdir(), "mpps-enrollment-pg-"));
			execFileSync(
				join(pgBin, "initdb"),
				["-D", dataDir, "-A", "trust", "-U", "enrollment_test", "--no-locale"],
				{ stdio: "pipe" },
			);
			execFileSync(
				join(pgBin, "pg_ctl"),
				[
					"-D",
					dataDir,
					"-l",
					join(dataDir, "server.log"),
					"-o",
					`-h 127.0.0.1 -k ${dataDir} -p ${postgresPort}`,
					"-w",
					"start",
				],
				{ stdio: "pipe" },
			);
			started = true;
			server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
			await new Promise<void>((resolve) => server.once("listening", resolve));
			server.on("connection", (ws) => {
				const tcp = net.connect(postgresPort, "127.0.0.1");
				sockets.add(tcp);
				ws.on("message", (data) => tcp.write(data as Buffer));
				tcp.on("data", (data) => {
					if (ws.readyState === WebSocket.OPEN) ws.send(data);
				});
				tcp.on("close", () => {
					sockets.delete(tcp);
					if (ws.readyState === WebSocket.OPEN) ws.close();
				});
				tcp.on("error", () => ws.terminate());
				ws.on("close", () => tcp.destroy());
				ws.on("error", () => tcp.destroy());
			});
			neonConfig.webSocketConstructor = DatabaseWebSocket;
			neonConfig.wsProxy = () =>
				`127.0.0.1:${(server.address() as net.AddressInfo).port}`;
			neonConfig.useSecureWebSocket = false;
			neonConfig.forceDisablePgSSL = true;
			neonConfig.pipelineConnect = false;
			pool = new RecoveringPool({
				connectionString: `postgresql://enrollment_test@127.0.0.1:${postgresPort}/postgres`,
				max: 3,
			});
			pool.on("error", () => {});
			const db = drizzle({ client: pool, schema });
			state.db = db;
			await migrate(db, { migrationsFolder: "packages/db/drizzle" });
		}, 20_000);
		afterAll(async () => {
			if (pool) await pool.end();
			for (const socket of sockets) socket.destroy();
			if (server) {
				for (const ws of server.clients) ws.terminate();
				await new Promise<void>((resolve) => server.close(() => resolve()));
			}
			Object.assign(neonConfig, original);
			if (started)
				execFileSync(
					join(pgBin, "pg_ctl"),
					["-D", dataDir, "-m", "immediate", "-w", "stop"],
					{ stdio: "pipe" },
				);
		});

		let actorId: number;
		let yearId: number;
		let formId: number;
		let studentId: number;
		const auth = (
			department = "registrar",
			role: "staff" | "admin" | "student" = "staff",
		) => {
			state.auth = {
				user: {
					id: actorId,
					email: "fixture@example.invalid",
					role,
					staffDepartment: department,
					firstName: "QA",
					lastName: "Actor",
				},
				session: { userId: actorId, expiresAt: new Date(Date.now() + 60000) },
			};
		};
		const intake = (extra = {}) => ({
			email: "student@example.invalid",
			firstName: "Synthetic",
			lastName: "Student",
			birthdate: "2018-01-01",
			gender: "male" as const,
			lrn: "990000000001",
			guardianName: "QA Guardian",
			guardianContact: "09000000001",
			gradeLevel: "grade_1" as const,
			studentType: "new" as const,
			learnerType: "elementary" as const,
			schoolYearId: yearId,
			...extra,
		});
		const form = async () =>
			(await pool.query("SELECT * FROM enrollment_forms WHERE id=$1", [formId]))
				.rows[0];
		const clear = async () => {
			auth("clinic");
			expect(await approvePhysical(formId, "Synthetic clinic")).toEqual({
				success: true,
			});
			auth("guidance");
			expect(await approveGuidance(formId, "Synthetic guidance")).toEqual({
				success: true,
			});
			auth("accounting");
			expect(
				await updatePaymentStatus(
					formId,
					"full_payment",
					"Synthetic payment",
					"QA-SI",
				),
			).toEqual({ success: true });
			auth();
		};
		beforeEach(async () => {
			await pool.query(
				"DROP TRIGGER IF EXISTS qa_fail_form ON enrollment_forms; DROP TRIGGER IF EXISTS qa_delay_form ON enrollment_forms; TRUNCATE users,school_years,subjects RESTART IDENTITY CASCADE",
			);
			// Non-loginable fixture identity exists only inside this disposable test cluster.
			actorId = (
				await pool.query(
					"INSERT INTO users(email,password_hash,role) VALUES ('fixture@example.invalid','not-a-login-hash','staff') RETURNING id",
				)
			).rows[0].id;
			yearId = (
				await pool.query(
					"INSERT INTO school_years(name,is_active) VALUES ('QA test year',true) RETURNING id",
				)
			).rows[0].id;
			auth();
			expect(await enrollStudentForSY(intake())).toHaveProperty(
				"success",
				true,
			);
			const r = (await pool.query("SELECT id,student_id FROM enrollment_forms"))
				.rows[0];
			formId = r.id;
			studentId = r.student_id;
		});
		it("counts every pending form, including Guidance and final-approval stages", async () => {
			const { getEnrollmentStats } = await import(
				"../../api/src/enrollment/query"
			);
			expect((await getEnrollmentStats()).data.pendingForm).toBe(1);
			await clear();
			expect((await getEnrollmentStats()).data.pendingForm).toBe(1);
			await approveEnrollment(formId);
			expect((await getEnrollmentStats()).data.pendingForm).toBe(0);
		});
		it.each([
			"clinic",
			"guidance",
			"accounting",
		] as const)("removes an archived student from the %s queue and restores the pending work", async (stage) => {
			const { archiveStudent, restoreStudent } = await import(
				"../../api/src/students/action"
			);
			const { getPendingPhysicals } = await import(
				"../../api/src/clinic/query"
			);
			const { getPendingGuidance } = await import(
				"../../api/src/guidance/query"
			);
			const { getPendingPayments } = await import(
				"../../api/src/accounting/query"
			);
			const { getPendingEnrollments, getEnrollmentStats } = await import(
				"../../api/src/enrollment/query"
			);
			if (stage !== "clinic") {
				auth("clinic");
				expect(await approvePhysical(formId)).toHaveProperty("success", true);
			}
			if (stage === "accounting") {
				auth("guidance");
				expect(await approveGuidance(formId)).toHaveProperty("success", true);
			}
			const queue = {
				clinic: getPendingPhysicals,
				guidance: getPendingGuidance,
				accounting: getPendingPayments,
			}[stage];
			expect((await queue()).totalCount).toBe(1);
			auth();
			expect(await archiveStudent(studentId)).toHaveProperty("success", true);
			expect((await queue()).data).toEqual([]);
			expect((await queue()).totalCount).toBe(0);
			expect((await getPendingEnrollments()).data).toEqual([]);
			expect((await getEnrollmentStats()).data.pendingForm).toBe(0);
			expect((await getEnrollmentStats()).data.total).toBe(0);
			const archived = (
				await pool.query(
					"SELECT s.archived_at AS student_archived,u.archived_at AS user_archived,u.session_version FROM students s JOIN users u ON u.id=s.user_id WHERE s.id=$1",
					[studentId],
				)
			).rows[0];
			expect(archived.student_archived).not.toBeNull();
			expect(archived.user_archived).not.toBeNull();
			expect(archived.session_version).toBe(1);
			expect(await restoreStudent(studentId)).toHaveProperty("success", true);
			expect(
				(
					await pool.query(
						"SELECT u.session_version FROM users u JOIN students s ON s.user_id=u.id WHERE s.id=$1",
						[studentId],
					)
				).rows[0].session_version,
			).toBe(1);
			expect((await queue()).totalCount).toBe(1);
			expect((await getPendingEnrollments()).totalCount).toBe(1);
			expect((await getEnrollmentStats()).data.pendingForm).toBe(1);
		});
		it("rejects final approval of an archived form even after clearance", async () => {
			await clear();
			await pool.query(
				"UPDATE enrollment_forms SET archived_at=now() WHERE id=$1",
				[formId],
			);
			expect(await approveEnrollment(formId)).toHaveProperty("error");
			expect(await updateEnrollmentStatus(formId, "enrolled")).toHaveProperty(
				"error",
			);
			expect((await form()).is_enrolled).toBe(false);
		});
		it("keeps new account, profile and pending form consistent", async () => {
			const r = await form();
			expect(r.is_enrolled).toBe(false);
			expect(r.status_clinic_done).toBe(false);
			expect(r.guardian_name).toBe("QA Guardian");
			expect(r.assisted_by_id).toBe(actorId);
			expect(
				Number(
					(await pool.query("SELECT count(*) FROM students")).rows[0].count,
				),
			).toBe(1);
		});
		it("rolls back user/profile creation when the enrollment insert fails", async () => {
			await pool.query(
				"CREATE OR REPLACE FUNCTION qa_fail_form_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'QA forced failure'; END $$; CREATE TRIGGER qa_fail_form BEFORE INSERT ON enrollment_forms FOR EACH ROW EXECUTE FUNCTION qa_fail_form_fn()",
			);
			expect(
				await enrollStudentForSY(
					intake({ email: "rollback@example.invalid", lrn: "990000000002" }),
				),
			).toHaveProperty("error");
			expect(
				Number(
					(
						await pool.query(
							"SELECT count(*) FROM users WHERE email='rollback@example.invalid'",
						)
					).rows[0].count,
				),
			).toBe(0);
			expect(
				Number(
					(await pool.query("SELECT count(*) FROM students")).rows[0].count,
				),
			).toBe(1);
		});
		it("serializes concurrent enrollment of the same existing student/year", async () => {
			const next = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('Concurrent QA year') RETURNING id",
				)
			).rows[0].id;
			const input = intake({
				existingStudentId: studentId,
				schoolYearId: next,
				studentType: "old",
			});
			// Hold the first insert long enough for the second request to reach its duplicate check.
			await pool.query(
				"CREATE OR REPLACE FUNCTION qa_delay_form_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM pg_sleep(0.2); RETURN NEW; END $$; CREATE TRIGGER qa_delay_form BEFORE INSERT ON enrollment_forms FOR EACH ROW EXECUTE FUNCTION qa_delay_form_fn()",
			);
			const results = await Promise.all([
				enrollStudentForSY(input),
				enrollStudentForSY(input),
			]);
			expect(results.filter((r) => "success" in r)).toHaveLength(1);
			expect(
				Number(
					(
						await pool.query(
							"SELECT count(*) FROM enrollment_forms WHERE student_id=$1 AND school_year_id=$2",
							[studentId, next],
						)
					).rows[0].count,
				),
			).toBe(1);
		});
		it.each([
			"dropped",
			"transferred",
		] as const)("returns %s status to the student dashboard", async (status) => {
			expect(
				await updateEnrollmentStatus(
					formId,
					status,
					"Synthetic QA status test",
				),
			).toHaveProperty("success", true);
			const { getStudentDashboardData } = await import(
				"../../api/src/students/query"
			);
			const own = (
				await pool.query("SELECT user_id FROM students WHERE id=$1", [
					studentId,
				])
			).rows[0].user_id;
			auth("", "student");
			if (!state.auth) throw new Error("QA student session missing");
			state.auth.user.id = own;
			const dashboard = await getStudentDashboardData(own);
			expect(dashboard.statusNote).toBe(
				`${status === "dropped" ? "Dropped" : "Transferred"}: Synthetic QA status test`,
			);
			expect(dashboard.isEnrolled).toBe(false);
		});
		it("denies another student's dashboard and enrollment history", async () => {
			const { getStudentDashboardData, getStudentEnrollmentHistory } =
				await import("../../api/src/students/query");
			const own = (
				await pool.query("SELECT user_id FROM students WHERE id=$1", [
					studentId,
				])
			).rows[0].user_id;
			auth("", "student");
			if (!state.auth) throw new Error("QA student session missing");
			state.auth.user.id = own;
			expect(await getStudentDashboardData(own)).toBeTruthy();
			await expect(getStudentDashboardData(actorId)).rejects.toThrow(
				/other student/,
			);
			await expect(getStudentEnrollmentHistory(actorId)).rejects.toThrow(
				/Unauthorized/,
			);
		});
		it("rejects duplicate email, LRN and same-year enrollment without extra records", async () => {
			expect(
				await enrollStudentForSY(intake({ lrn: "990000000003" })),
			).toHaveProperty("error");
			expect(
				await enrollStudentForSY(
					intake({ email: "duplicate-lrn@example.invalid" }),
				),
			).toHaveProperty("error");
			expect(
				await enrollStudentForSY(intake({ existingStudentId: studentId })),
			).toHaveProperty("error");
			expect(
				Number(
					(await pool.query("SELECT count(*) FROM enrollment_forms")).rows[0]
						.count,
				),
			).toBe(1);
		});
		it.each([
			"nursery",
			"grade_7",
			"grade_11",
		] as const)("accepts representative %s classification", async (gradeLevel) => {
			const senior = gradeLevel === "grade_11";
			expect(
				await enrollStudentForSY(
					intake({
						email: `${gradeLevel}@example.invalid`,
						lrn: undefined,
						gradeLevel,
						studentType: gradeLevel === "grade_7" ? "transferee" : "new",
						learnerType: senior
							? "senior_high"
							: gradeLevel === "grade_7"
								? "junior_high"
								: "elementary",
						shsTrack: senior ? "tech_pro" : undefined,
						isEsc: gradeLevel === "grade_7",
						isShsVoucher: senior,
					}),
				),
			).toHaveProperty("success", true);
		});
		it("preserves guardian details on a reused student's later-year form", async () => {
			const next = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('Next QA year') RETURNING id",
				)
			).rows[0].id;
			expect(
				await enrollStudentForSY(
					intake({
						existingStudentId: studentId,
						schoolYearId: next,
						studentType: "old",
						guardianName: "Updated QA Guardian",
						guardianContact: "09000000002",
					}),
				),
			).toHaveProperty("success", true);
			const r = (
				await pool.query(
					"SELECT guardian_name,guardian_contact FROM enrollment_forms WHERE school_year_id=$1",
					[next],
				)
			).rows[0];
			expect(r.guardian_name).toBe("Updated QA Guardian");
			expect(r.guardian_contact).toBe("09000000002");
			expect(
				Number(
					(await pool.query("SELECT count(*) FROM students")).rows[0].count,
				),
			).toBe(1);
		});
		it("persists reviewed existing-student profile updates atomically with the new form", async () => {
			const next = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('Profile QA year') RETURNING id",
				)
			).rows[0].id;
			const input = intake({
				existingStudentId: studentId,
				schoolYearId: next,
				studentType: "returning",
				firstName: "Updated QA",
				address: "Updated QA Address",
				guardianName: "Updated Guardian",
			});
			expect(await enrollStudentForSY(input)).toHaveProperty("success", true);
			const r = (
				await pool.query(
					"SELECT first_name,address FROM students WHERE id=$1",
					[studentId],
				)
			).rows[0];
			expect(r.first_name).toBe("Updated QA");
			expect(r.address).toBe("Updated QA Address");
			expect(
				await enrollStudentForSY({ ...input, firstName: "Must not overwrite" }),
			).toHaveProperty("error");
			expect(
				(
					await pool.query("SELECT first_name FROM students WHERE id=$1", [
						studentId,
					])
				).rows[0].first_name,
			).toBe("Updated QA");
		});
		it("rejects Guidance before Clinic", async () => {
			auth("guidance");
			expect(await approveGuidance(formId)).toHaveProperty("error");
			expect((await form()).status_guidance_done).toBe(false);
		});
		it("rejects Accounting before Guidance", async () => {
			auth("accounting");
			expect(await updatePaymentStatus(formId, "full_payment")).toHaveProperty(
				"error",
			);
			expect((await form()).status_accounting_done).toBe(false);
		});
		it.each([
			"approve",
			"reenroll",
		])("rejects %s before all clearances", async (method) => {
			const result =
				method === "approve"
					? await approveEnrollment(formId)
					: await updateEnrollmentStatus(formId, "enrolled");
			expect(result).toHaveProperty("error");
			expect((await form()).is_enrolled).toBe(false);
		});
		it.each([
			"full_payment",
			"down_payment",
			"promissory_note",
			"insufficient",
		] as const)("handles %s completion flag", async (status) => {
			auth("clinic");
			await approvePhysical(formId);
			auth("guidance");
			await approveGuidance(formId);
			auth("accounting");
			expect(await updatePaymentStatus(formId, status)).toEqual({
				success: true,
			});
			expect((await form()).status_accounting_done).toBe(
				status !== "insufficient",
			);
			auth();
			const result = await approveEnrollment(formId);
			expect(result).toHaveProperty(
				status === "insufficient" ? "error" : "success",
			);
		});
		it("denies unrelated department and student mutations", async () => {
			auth("faculty");
			expect(await approveEnrollment(formId)).toHaveProperty("error");
			expect(await approveGuidance(formId)).toHaveProperty("error");
			auth("", "student");
			expect(await approvePhysical(formId)).toHaveProperty("error");
			expect(await updatePaymentStatus(formId, "full_payment")).toHaveProperty(
				"error",
			);
			expect((await form()).is_enrolled).toBe(false);
		});
		it("requires final enrollment and matching section grade/year", async () => {
			const a = (
				await pool.query(
					"INSERT INTO sections(name,grade_level,school_year_id) VALUES ('Matching','grade_1',$1),('Wrong grade','grade_2',$1) RETURNING id",
					[yearId],
				)
			).rows;
			expect(await assignStudentToSection(formId, a[0].id)).toHaveProperty(
				"error",
			);
			await clear();
			expect(await approveEnrollment(formId)).toEqual({ success: true });
			const otherYear = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('Wrong roster year') RETURNING id",
				)
			).rows[0].id;
			const wrongYearSection = (
				await pool.query(
					"INSERT INTO sections(name,grade_level,school_year_id) VALUES ('Wrong year','grade_1',$1) RETURNING id",
					[otherYear],
				)
			).rows[0].id;
			expect(
				await assignStudentToSection(formId, wrongYearSection),
			).toHaveProperty("error");
			expect(await assignStudentToSection(formId, a[1].id)).toHaveProperty(
				"error",
			);
			expect(await assignStudentToSection(formId, a[0].id)).toEqual({
				success: true,
			});
			expect(await assignStudentToSection(formId, a[0].id)).toHaveProperty(
				"error",
			);
		});
		it("rejects reversed class times on create and partial edit without changing the schedule", async () => {
			const { assignSubjectToSection, updateSectionSubject } = await import(
				"../../api/src/sections/action"
			);
			const section = (
				await pool.query(
					"INSERT INTO sections(name,grade_level,school_year_id) VALUES ('Time QA','grade_1',$1) RETURNING id",
					[yearId],
				)
			).rows[0].id;
			const subject = (
				await pool.query(
					"INSERT INTO subjects(name) VALUES ('Time QA') RETURNING id",
				)
			).rows[0].id;
			const input = {
				sectionId: section,
				subjectId: subject,
				startTime: "08:00",
				endTime: "07:00",
			};
			expect(await assignSubjectToSection(input)).toHaveProperty("error");
			expect(
				await assignSubjectToSection({ ...input, endTime: "09:00" }),
			).toHaveProperty("success", true);
			const id = (await pool.query("SELECT id FROM class_schedules")).rows[0]
				.id;
			expect(
				await updateSectionSubject(id, { endTime: "07:00" }),
			).toHaveProperty("error");
			expect(
				(
					await pool.query("SELECT end_time FROM class_schedules WHERE id=$1", [
						id,
					])
				).rows[0].end_time,
			).toBe("09:00:00");
			expect(
				await updateSectionSubject(id, { startTime: null, endTime: null }),
			).toHaveProperty("success", true);
		});
		it("archives/restores academic records and prevents active-year archival", async () => {
			const years = await import("../../api/src/school-years/action");
			expect(await years.archiveSchoolYear(yearId)).toHaveProperty("error");
			const other = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('Lifecycle QA') RETURNING id",
				)
			).rows[0].id;
			expect(await years.archiveSchoolYear(other)).toHaveProperty(
				"success",
				true,
			);
			expect(await years.toggleActiveSchoolYear(other)).toHaveProperty("error");
			expect(await years.restoreSchoolYear(other)).toHaveProperty(
				"success",
				true,
			);
			expect(await years.toggleActiveSchoolYear(other)).toHaveProperty(
				"success",
				true,
			);
			expect(
				Number(
					(
						await pool.query(
							"SELECT count(*) FROM school_years WHERE is_active",
						)
					).rows[0].count,
				),
			).toBe(1);
			const sections = await import("../../api/src/sections/action");
			expect(
				await sections.createSection({
					name: "Optional QA",
					gradeLevel: "grade_1",
					schoolYearId: other,
				}),
			).toHaveProperty("success", true);
			const id = (await pool.query("SELECT id FROM sections")).rows[0].id;
			expect(await sections.archiveSection(id)).toHaveProperty("success", true);
			expect(
				(await pool.query("SELECT archived_at FROM sections WHERE id=$1", [id]))
					.rows[0].archived_at,
			).not.toBeNull();
			expect(await sections.restoreSection(id)).toHaveProperty("success", true);
			expect(
				(await pool.query("SELECT archived_at FROM sections WHERE id=$1", [id]))
					.rows[0].archived_at,
			).toBeNull();
		});
		it("persists Administrator profile edits and keeps department changes consistent", async () => {
			auth("admin", "admin");
			const { updateUserAccount } = await import("../../api/src/users/action");
			const id = (
				await pool.query(
					"INSERT INTO users(email,password_hash,role) VALUES ('admin-edit@example.invalid','synthetic','admin') RETURNING id",
				)
			).rows[0].id;
			await pool.query(
				"INSERT INTO staff(user_id,first_name,last_name,department) VALUES ($1,'QA','Original','admin')",
				[id],
			);
			const edit = (department: string, lastName: string) => {
				const data = new FormData();
				for (const [key, value] of Object.entries({
					email: "admin-edit@example.invalid",
					firstName: "QA",
					lastName,
					department,
				}))
					data.set(key, value);
				return data;
			};
			expect(
				await updateUserAccount(id, edit("admin", "Updated")),
			).toHaveProperty("success", true);
			expect(
				(await pool.query("SELECT last_name FROM staff WHERE user_id=$1", [id]))
					.rows[0].last_name,
			).toBe("Updated");
			expect(
				await updateUserAccount(id, edit("clinic", "Moved")),
			).toHaveProperty("success", true);
			expect(
				(
					await pool.query(
						"SELECT role,department,last_name FROM users JOIN staff ON users.id=staff.user_id WHERE users.id=$1",
						[id],
					)
				).rows[0],
			).toMatchObject({
				role: "staff",
				department: "clinic",
				last_name: "Moved",
			});
			expect(
				await updateUserAccount(id, edit("admin", "Restored")),
			).toHaveProperty("success", true);
			expect(
				(
					await pool.query(
						"SELECT role,department,last_name FROM users JOIN staff ON users.id=staff.user_id WHERE users.id=$1",
						[id],
					)
				).rows[0],
			).toMatchObject({
				role: "admin",
				department: "admin",
				last_name: "Restored",
			});
		});
		it("rejects duplicate teacher email without leaving a partial profile", async () => {
			const { createTeacher } = await import("../../api/src/faculty/action");
			const existing = (
				await pool.query("SELECT email FROM users WHERE id=$1", [actorId])
			).rows[0].email;
			const before = Number(
				(await pool.query("SELECT count(*) FROM staff")).rows[0].count,
			);
			expect(
				await createTeacher({
					firstName: "QA",
					lastName: "Duplicate",
					email: existing,
					password: "SyntheticQa2026!",
				}),
			).toHaveProperty("error");
			expect(
				Number((await pool.query("SELECT count(*) FROM staff")).rows[0].count),
			).toBe(before);
		});
		it("retains account token revocation after administrator archive and restore", async () => {
			auth("admin", "admin");
			const { archiveUserAccount, restoreUserAccount } = await import(
				"../../api/src/users/action"
			);
			const target = (
				await pool.query(
					"SELECT u.id,u.email FROM users u JOIN students s ON s.user_id=u.id WHERE s.id=$1",
					[studentId],
				)
			).rows[0];
			expect(await archiveUserAccount(target.id, target.email)).toHaveProperty(
				"success",
				true,
			);
			expect(
				(
					await pool.query("SELECT session_version FROM users WHERE id=$1", [
						target.id,
					])
				).rows[0].session_version,
			).toBe(1);
			expect(await restoreUserAccount(target.id)).toHaveProperty(
				"success",
				true,
			);
			expect(
				(
					await pool.query(
						"SELECT session_version,archived_at FROM users WHERE id=$1",
						[target.id],
					)
				).rows[0],
			).toMatchObject({ session_version: 1, archived_at: null });
		});
		it("archives and restores teacher profile and login account together", async () => {
			const { archiveTeacher, restoreTeacher } = await import(
				"../../api/src/faculty/action"
			);
			const id = (
				await pool.query(
					"INSERT INTO staff(user_id,first_name,last_name,department) VALUES ($1,'QA','Lifecycle','faculty') RETURNING id",
					[actorId],
				)
			).rows[0].id;
			expect(await archiveTeacher(id)).toHaveProperty("success", true);
			let r = (
				await pool.query(
					"SELECT staff.archived_at AS profile, users.archived_at AS account, users.session_version FROM staff JOIN users ON users.id=staff.user_id WHERE staff.id=$1",
					[id],
				)
			).rows[0];
			expect(r.profile).not.toBeNull();
			expect(r.account).not.toBeNull();
			expect(r.session_version).toBe(1);
			expect(await restoreTeacher(id)).toHaveProperty("success", true);
			r = (
				await pool.query(
					"SELECT staff.archived_at AS profile, users.archived_at AS account, users.session_version FROM staff JOIN users ON users.id=staff.user_id WHERE staff.id=$1",
					[id],
				)
			).rows[0];
			expect(r.profile).toBeNull();
			expect(r.account).toBeNull();
			expect(r.session_version).toBe(1);
		});
		it("skips archived matching rollover targets and never copies student rosters", async () => {
			const { rolloverSchoolYear } = await import(
				"../../api/src/school-years/action"
			);
			const other = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('Rollover QA') RETURNING id",
				)
			).rows[0].id;
			await pool.query(
				"INSERT INTO sections(name,grade_level,school_year_id,archived_at) VALUES ('Collision QA','grade_1',$1,NULL),('Collision QA','grade_1',$2,CURRENT_TIMESTAMP)",
				[yearId, other],
			);
			const input = {
				sourceSyId: yearId,
				targetSyId: other,
				copySections: true,
				copySubjects: true,
				copyTeachers: true,
				copySchedules: true,
			};
			expect(await rolloverSchoolYear(input)).toEqual({
				success: true,
				sectionsCount: 0,
			});
			expect(
				Number(
					(await pool.query("SELECT count(*) FROM section_rosters")).rows[0]
						.count,
				),
			).toBe(0);
			expect(
				await rolloverSchoolYear({ ...input, targetSyId: yearId }),
			).toHaveProperty("error");
		});
		it("keeps registrar history readable but empties department queues when no year is active", async () => {
			await pool.query("UPDATE school_years SET is_active=false");
			const { getPendingEnrollments } = await import(
				"../../api/src/enrollment/query"
			);
			const { getPendingPhysicals } = await import(
				"../../api/src/clinic/query"
			);
			const { getPendingGuidance } = await import(
				"../../api/src/guidance/query"
			);
			const { getPendingPayments } = await import(
				"../../api/src/accounting/query"
			);
			expect((await getPendingEnrollments()).data).toHaveLength(1);
			auth("clinic");
			expect((await getPendingPhysicals()).data).toEqual([]);
			auth("guidance");
			expect((await getPendingGuidance()).data).toEqual([]);
			auth("accounting");
			expect((await getPendingPayments()).data).toEqual([]);
		});
		it("edits and clears ESC on the selected form without changing another year's form", async () => {
			const { updateStudentEscNumber } = await import(
				"../../api/src/students/action"
			);
			const other = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('ESC QA') RETURNING id",
				)
			).rows[0].id;
			await enrollStudentForSY(
				intake({
					existingStudentId: studentId,
					schoolYearId: other,
					studentType: "old",
				}),
			);
			expect(await updateStudentEscNumber(formId, "QA-ESC-001")).toHaveProperty(
				"success",
				true,
			);
			expect((await form()).esc_number).toBe("QA-ESC-001");
			expect(
				(
					await pool.query(
						"SELECT esc_number FROM enrollment_forms WHERE school_year_id=$1",
						[other],
					)
				).rows[0].esc_number,
			).toBeNull();
			expect(await updateStudentEscNumber(formId, null)).toHaveProperty(
				"success",
				true,
			);
			expect((await form()).esc_number).toBeNull();
			auth("clinic");
			expect(await updateStudentEscNumber(formId, "Forbidden")).toHaveProperty(
				"error",
			);
		});
		it("archives/restores a subject assignment and rejects duplicate active assignments", async () => {
			const actions = await import("../../api/src/sections/action");
			const section = (
				await pool.query(
					"INSERT INTO sections(name,grade_level,school_year_id) VALUES ('Subject QA','grade_1',$1) RETURNING id",
					[yearId],
				)
			).rows[0].id;
			const subject = (
				await pool.query(
					"INSERT INTO subjects(name) VALUES ('Subject QA') RETURNING id",
				)
			).rows[0].id;
			const input = { sectionId: section, subjectId: subject };
			expect(await actions.assignSubjectToSection(input)).toHaveProperty(
				"success",
				true,
			);
			expect(await actions.assignSubjectToSection(input)).toHaveProperty(
				"error",
			);
			const id = (await pool.query("SELECT id FROM class_schedules")).rows[0]
				.id;
			expect(await actions.removeSectionSubject(id)).toHaveProperty(
				"success",
				true,
			);
			expect(
				(
					await pool.query(
						"SELECT archived_at FROM class_schedules WHERE id=$1",
						[id],
					)
				).rows[0].archived_at,
			).not.toBeNull();
			expect(await actions.restoreSectionSubject(id)).toHaveProperty(
				"success",
				true,
			);
			expect(
				(
					await pool.query(
						"SELECT archived_at FROM class_schedules WHERE id=$1",
						[id],
					)
				).rows[0].archived_at,
			).toBeNull();
		});
		it("rejects reapproval after insufficient clearance and reports reversal state for policy review", async () => {
			const { editPaymentStatus } = await import(
				"../../api/src/accounting/action"
			);
			await clear();
			await approveEnrollment(formId);
			const section = (
				await pool.query(
					"INSERT INTO sections(name,grade_level,school_year_id) VALUES ('Reversal QA','grade_1',$1) RETURNING id",
					[yearId],
				)
			).rows[0].id;
			await assignStudentToSection(formId, section);
			const before = await form();
			auth("accounting");
			expect(
				await editPaymentStatus(formId, "insufficient", "Synthetic reversal"),
			).toHaveProperty("success", true);
			const after = await form();
			expect(after.status_accounting_done).toBe(false);
			auth();
			expect(await approveEnrollment(formId)).toHaveProperty("error");
			console.info("QA reversal policy observation", {
				isEnrolled: after.is_enrolled,
				activeRosterEntries: Number(
					(
						await pool.query(
							"SELECT count(*) FROM section_rosters WHERE archived_at IS NULL",
						)
					).rows[0].count,
				),
				originalApproverRetained:
					before.status_accounting_approved_by_id ===
					after.status_accounting_approved_by_id,
				originalTimestampRetained:
					String(before.status_accounting_finished_at) ===
					String(after.status_accounting_finished_at),
			});
		});
		it("revokes the selected historical form without changing the active-year form", async () => {
			const { revokeRegistrarApproval } = await import(
				"../../api/src/enrollment/clearance"
			);
			await clear();
			await approveEnrollment(formId);
			const oldYear = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('Historical revoke QA') RETURNING id",
				)
			).rows[0].id;
			const historicalId = (
				await pool.query(
					"INSERT INTO enrollment_forms(student_id,school_year_id,grade_level,learner_type,student_type,is_enrolled,status_clinic_done,status_guidance_done,status_accounting_done) VALUES ($1,$2,'grade_1','elementary','old',true,true,true,true) RETURNING id",
					[studentId, oldYear],
				)
			).rows[0].id;
			expect(
				await revokeRegistrarApproval(studentId, historicalId),
			).toHaveProperty("success", true);
			expect((await form()).is_enrolled).toBe(true);
			expect(
				(
					await pool.query(
						"SELECT is_enrolled FROM enrollment_forms WHERE id=$1",
						[historicalId],
					)
				).rows[0].is_enrolled,
			).toBe(false);
			expect(
				await revokeRegistrarApproval(studentId + 999, formId),
			).toHaveProperty("error");
			expect(await revokeRegistrarApproval(studentId, 999999)).toHaveProperty(
				"error",
			);
			await pool.query(
				"UPDATE enrollment_forms SET is_enrolled=true,archived_at=CURRENT_TIMESTAMP WHERE id=$1",
				[historicalId],
			);
			expect(
				await revokeRegistrarApproval(studentId, historicalId),
			).toHaveProperty("error");
			expect((await form()).is_enrolled).toBe(true);
		});
		it("revokes final approval and restores it only after clearance", async () => {
			const { revokeRegistrarApproval } = await import(
				"../../api/src/enrollment/clearance"
			);
			await clear();
			await approveEnrollment(formId);
			expect(await revokeRegistrarApproval(studentId)).toHaveProperty(
				"success",
				true,
			);
			expect((await form()).is_enrolled).toBe(false);
			expect(await revokeRegistrarApproval(studentId)).toHaveProperty("error");
			expect(await approveEnrollment(formId)).toHaveProperty("success", true);
			expect(
				await updateEnrollmentStatus(formId, "dropped", "Synthetic lifecycle"),
			).toHaveProperty("success", true);
			expect(await updateEnrollmentStatus(formId, "enrolled")).toHaveProperty(
				"success",
				true,
			);
			expect((await form()).status_note).toBeNull();
		});
		it("unassigns and reassigns a cleared student without duplicate active roster entries", async () => {
			const section = (
				await pool.query(
					"INSERT INTO sections(name,grade_level,school_year_id) VALUES ('Roster QA','grade_1',$1) RETURNING id",
					[yearId],
				)
			).rows[0].id;
			await clear();
			await approveEnrollment(formId);
			await assignStudentToSection(formId, section);
			expect(await unassignStudentFromSection(formId, section)).toHaveProperty(
				"success",
				true,
			);
			expect(
				Number(
					(
						await pool.query(
							"SELECT count(*) FROM section_rosters WHERE archived_at IS NULL",
						)
					).rows[0].count,
				),
			).toBe(0);
			expect(await assignStudentToSection(formId, section)).toHaveProperty(
				"success",
				true,
			);
			expect(
				Number(
					(
						await pool.query(
							"SELECT count(*) FROM section_rosters WHERE archived_at IS NULL",
						)
					).rows[0].count,
				),
			).toBe(1);
		});
		it("saves/clears grades atomically and checks adviser, roster and subject boundaries", async () => {
			const adviser = (
				await pool.query(
					"INSERT INTO staff(user_id,first_name,last_name,department) VALUES ($1,'QA','Adviser','faculty') RETURNING id",
					[actorId],
				)
			).rows[0].id;
			const section = (
				await pool.query(
					"INSERT INTO sections(name,grade_level,school_year_id,adviser_id) VALUES ('Grade QA','grade_1',$1,$2) RETURNING id",
					[yearId, adviser],
				)
			).rows[0].id;
			const subject = (
				await pool.query(
					"INSERT INTO subjects(name) VALUES ('QA Math') RETURNING id",
				)
			).rows[0].id;
			await pool.query(
				"INSERT INTO class_schedules(section_id,subject_id) VALUES ($1,$2)",
				[section, subject],
			);
			await clear();
			await approveEnrollment(formId);
			await assignStudentToSection(formId, section);
			auth("faculty");
			const grade = {
				studentId,
				subjectId: subject,
				grade: "95",
				isGeneralAverage: false,
			};
			await saveAdvisoryGrades(section, yearId, [
				grade,
				{ studentId, subjectId: null, grade: "94.5", isGeneralAverage: true },
			]);
			expect(
				(
					await pool.query(
						"SELECT grade FROM grades ORDER BY is_general_average",
					)
				).rows.map((r) => r.grade),
			).toEqual(["95.00", "94.50"]);
			await expect(
				saveAdvisoryGrades(section, yearId, [
					{ ...grade, grade: "80" },
					{ ...grade, studentId: 999 },
				]),
			).rejects.toThrow(/roster/);
			expect(
				(
					await pool.query(
						"SELECT grade FROM grades WHERE is_general_average=false",
					)
				).rows[0].grade,
			).toBe("95.00");
			await expect(
				saveAdvisoryGrades(section, yearId, [{ ...grade, grade: "101" }]),
			).rejects.toThrow();
			await expect(
				saveAdvisoryGrades(section, yearId, [grade, grade]),
			).rejects.toThrow(/Duplicate/);
			await expect(
				saveAdvisoryGrades(section, yearId, [{ ...grade, subjectId: 999 }]),
			).rejects.toThrow(/Subject/);
			await pool.query("UPDATE sections SET adviser_id=NULL WHERE id=$1", [
				section,
			]);
			await expect(
				saveAdvisoryGrades(section, yearId, [grade]),
			).rejects.toThrow(/adviser/);
			auth("", "admin");
			await saveAdvisoryGrades(section, yearId, [{ ...grade, grade: "" }]);
			expect(
				Number(
					(
						await pool.query(
							"SELECT count(*) FROM grades WHERE is_general_average=false",
						)
					).rows[0].count,
				),
			).toBe(0);
		});
	},
);
