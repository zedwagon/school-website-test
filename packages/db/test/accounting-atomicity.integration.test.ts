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

// Replace only application infrastructure: actions/queries, SQL, transactions,
// locks and the Neon transport all execute for real against disposable PostgreSQL.
const state = vi.hoisted(() => ({ db: undefined as unknown }));
vi.mock("../src/index", async () => ({
	...(await vi.importActual("../src/schema")),
	get db() {
		return state.db;
	},
}));
vi.mock("../../api/node_modules/server-only/index.js", () => ({}));
vi.mock("../../api/src/auth/guard", () => ({
	validateActionSession: vi.fn().mockResolvedValue({}),
}));
vi.mock("../../api/node_modules/next/cache.js", () => ({
	revalidatePath: vi.fn(),
}));

import {
	createEmployeeLoan,
	recordLoanPayment,
} from "../../api/src/accounting/loans/action";
import { getEmployeeLoanById } from "../../api/src/accounting/loans/query";
import {
	saveBulkDailyCashReceipts,
	saveDailyCashReceipt,
	saveOpeningBalanceOverride,
} from "../../api/src/accounting/operational/actions";
import {
	createPayrollPeriod,
	generatePayrollsForPeriod,
	saveEmployeeContract,
	updatePayroll,
	updatePayrollPeriod,
} from "../../api/src/accounting/payroll/action";
import { getPayrollsByPeriod } from "../../api/src/accounting/payroll/query";

import {
	archiveSchoolYearQuery,
	getActiveSchoolYear,
	rolloverSchoolYearQuery,
	toggleActiveSchoolYearQuery,
} from "../../api/src/school-years/query";

describe.skipIf(process.env.RUN_ACCOUNTING_ATOMICITY !== "1")(
	"accounting and school-year integrity with real PostgreSQL",
	() => {
		const pgBin = process.env.PG_BIN || "/usr/lib/postgresql/18/bin";
		const postgresPort = 55440;
		let dataDir: string;
		let started = false;
		let server: WebSocketServer;
		let pool: RecoveringPool;
		let employeeId: number;
		let periodId: number;
		const sockets = new Set<net.Socket>();
		const original = {
			wsProxy: neonConfig.wsProxy,
			webSocketConstructor: neonConfig.webSocketConstructor,
			useSecureWebSocket: neonConfig.useSecureWebSocket,
			forceDisablePgSSL: neonConfig.forceDisablePgSSL,
			pipelineConnect: neonConfig.pipelineConnect,
		};
		beforeAll(async () => {
			dataDir = mkdtempSync(join(tmpdir(), "mpps-atomicity-pg-"));
			execFileSync(
				join(pgBin, "initdb"),
				["-D", dataDir, "-A", "trust", "-U", "atomicity_test", "--no-locale"],
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
				connectionString: `postgresql://atomicity_test@127.0.0.1:${postgresPort}/postgres`,
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
		beforeEach(async () => {
			await pool.query(
				"DROP TRIGGER IF EXISTS fail_rollover ON public.class_schedules; DROP TRIGGER IF EXISTS fail_loan_status ON accounting.employee_loans; DROP TRIGGER IF EXISTS fail_payroll_insert ON accounting.payrolls; DROP TRIGGER IF EXISTS fail_receipt_ledger ON accounting.operational_cash_flow; TRUNCATE accounting.operational_opening_balances, public.school_years, public.subjects, public.users, accounting.operational_cash_flow, accounting.daily_cash_receipts, accounting.employee_loan_payments, accounting.employee_loans, accounting.payrolls, accounting.employee_contracts, accounting.employees, accounting.payroll_periods RESTART IDENTITY CASCADE",
			);
			employeeId = (
				await pool.query(
					"INSERT INTO accounting.employees (first_name,last_name,type) VALUES ('Test','Only','teaching') RETURNING id",
				)
			).rows[0].id;
			periodId = (
				await pool.query(
					"INSERT INTO accounting.payroll_periods (name,start_date,end_date) VALUES ('Test period','2026-10-01','2026-10-15') RETURNING id",
				)
			).rows[0].id;
			await pool.query(
				"INSERT INTO accounting.employee_contracts (employee_id,base_salary) VALUES ($1,15000)",
				[employeeId],
			);
		});
		async function schoolFixture() {
			const source = (
				await pool.query(
					"INSERT INTO school_years(name,is_active) VALUES ('Source',true) RETURNING id",
				)
			).rows[0].id;
			const target = (
				await pool.query(
					"INSERT INTO school_years(name) VALUES ('Target') RETURNING id",
				)
			).rows[0].id;
			const user = (
				await pool.query(
					"INSERT INTO users(email,password_hash,role) VALUES ('teacher@test.local','test-hash','staff') RETURNING id",
				)
			).rows[0].id;
			const teacher = (
				await pool.query(
					"INSERT INTO staff(user_id,first_name,last_name,department) VALUES ($1,'Test','Teacher','faculty') RETURNING id",
					[user],
				)
			).rows[0].id;
			const subject = (
				await pool.query(
					"INSERT INTO subjects(name) VALUES ('Math') RETURNING id",
				)
			).rows[0].id;
			const section = (
				await pool.query(
					"INSERT INTO sections(name,grade_level,school_year_id,adviser_id) VALUES ('Apple','grade_1',$1,$2) RETURNING id",
					[source, teacher],
				)
			).rows[0].id;
			await pool.query(
				"INSERT INTO class_schedules(section_id,subject_id,teacher_id,day_of_week,start_time,end_time) VALUES ($1,$2,$3,'monday','08:00','09:00')",
				[section, subject, teacher],
			);
			return { source, target, teacher };
		}
		const rolloverOptions = (source: number, target: number) => ({
			sourceSyId: source,
			targetSyId: target,
			copySections: true,
			copySubjects: true,
			copyTeachers: true,
			copySchedules: true,
		});
		it("rolls back section copies when a later schedule insert fails", async () => {
			const { source, target } = await schoolFixture();
			await pool.query(
				`CREATE OR REPLACE FUNCTION fail_rollover_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected schedule failure'; END $$; CREATE TRIGGER fail_rollover BEFORE INSERT ON class_schedules FOR EACH ROW EXECUTE FUNCTION fail_rollover_insert()`,
			);
			await expect(
				rolloverSchoolYearQuery(rolloverOptions(source, target)),
			).rejects.toBeDefined();
			expect(
				(
					await pool.query("SELECT * FROM sections WHERE school_year_id=$1", [
						target,
					])
				).rows,
			).toHaveLength(0);
		});
		it("makes concurrent and repeated rollovers create only one section copy", async () => {
			const { source, target } = await schoolFixture();
			const results = await Promise.all([
				rolloverSchoolYearQuery(rolloverOptions(source, target)),
				rolloverSchoolYearQuery(rolloverOptions(source, target)),
			]);
			expect(results.map((result) => result.sectionsCount).sort()).toEqual([
				0, 1,
			]);
			expect(
				await rolloverSchoolYearQuery(rolloverOptions(source, target)),
			).toEqual({ sectionsCount: 0 });
			const copied = (
				await pool.query(
					"SELECT s.adviser_id, c.teacher_id, c.day_of_week FROM sections s JOIN class_schedules c ON c.section_id=s.id WHERE s.school_year_id=$1",
					[target],
				)
			).rows;
			expect(copied).toHaveLength(1);
			expect(copied[0]).toMatchObject({ day_of_week: "monday" });
		});
		it("honors disabled teacher/schedule copying and preserves matching target settings", async () => {
			const { source, target } = await schoolFixture();
			await rolloverSchoolYearQuery({
				...rolloverOptions(source, target),
				copyTeachers: false,
				copySchedules: false,
			});
			const copied = (
				await pool.query(
					"SELECT s.adviser_id, c.teacher_id, c.day_of_week FROM sections s JOIN class_schedules c ON c.section_id=s.id WHERE s.school_year_id=$1",
					[target],
				)
			).rows;
			expect(copied).toEqual([
				{ adviser_id: null, teacher_id: null, day_of_week: null },
			]);
			await pool.query(
				"UPDATE sections SET room='Keep me' WHERE school_year_id=$1",
				[target],
			);
			await rolloverSchoolYearQuery(rolloverOptions(source, target));
			expect(
				(
					await pool.query(
						"SELECT room FROM sections WHERE school_year_id=$1",
						[target],
					)
				).rows,
			).toEqual([{ room: "Keep me" }]);
		});
		it("rejects same-year and archived-target rollovers", async () => {
			const { source, target } = await schoolFixture();
			await expect(
				rolloverSchoolYearQuery(rolloverOptions(source, source)),
			).rejects.toThrow("different");
			await archiveSchoolYearQuery(target);
			await expect(
				rolloverSchoolYearQuery(rolloverOptions(source, target)),
			).rejects.toThrow("not be archived");
		});
		it("preserves the current active year when archival or activation is invalid", async () => {
			const { source, target } = await schoolFixture();
			await expect(archiveSchoolYearQuery(source)).rejects.toThrow(
				"another active",
			);
			await archiveSchoolYearQuery(target);
			await expect(toggleActiveSchoolYearQuery(target)).rejects.toThrow(
				"archived",
			);
			await expect(toggleActiveSchoolYearQuery(999999)).rejects.toThrow(
				"not found",
			);
			expect((await getActiveSchoolYear()).id).toBe(source);
		});
		it("serializes concurrent activation and safely archives the previous year", async () => {
			const { source, target } = await schoolFixture();
			await Promise.all([
				toggleActiveSchoolYearQuery(target),
				toggleActiveSchoolYearQuery(source),
			]);
			expect(
				(await pool.query("SELECT * FROM school_years WHERE is_active=true"))
					.rows,
			).toHaveLength(1);
			await toggleActiveSchoolYearQuery(target);
			await archiveSchoolYearQuery(source);
			expect((await getActiveSchoolYear()).id).toBe(target);
		});
		it("allows activation and rollover to compete without lock-order deadlocks", async () => {
			const { source, target } = await schoolFixture();
			await Promise.all([
				rolloverSchoolYearQuery(rolloverOptions(source, target)),
				toggleActiveSchoolYearQuery(target),
			]);
			expect((await getActiveSchoolYear()).id).toBe(target);
			expect(
				(
					await pool.query("SELECT * FROM sections WHERE school_year_id=$1", [
						target,
					])
				).rows,
			).toHaveLength(1);
		});
		it("database rejects multiple active years and archived active rows", async () => {
			const { source } = await schoolFixture();
			await expect(
				pool.query(
					"INSERT INTO school_years(name,is_active) VALUES ('Other',true)",
				),
			).rejects.toBeDefined();
			await expect(
				pool.query("UPDATE school_years SET archived_at=now() WHERE id=$1", [
					source,
				]),
			).rejects.toBeDefined();
		});
		it("rejects competing creations of the same payroll dates with different names", async () => {
			const results = await Promise.allSettled(
				Array.from({ length: 6 }, (_, i) =>
					createPayrollPeriod({
						name: `Period ${i}`,
						startDate: "2026-10-16",
						endDate: "2026-10-31",
					}),
				),
			);
			expect(
				results.filter((result) => result.status === "fulfilled"),
			).toHaveLength(1);
			const rows = (
				await pool.query(
					"SELECT * FROM accounting.payroll_periods WHERE start_date='2026-10-16'",
				)
			).rows;
			expect(rows).toHaveLength(1);
		});
		it("rejects duplicate names and reversed payroll dates without inserting records", async () => {
			await expect(
				createPayrollPeriod({
					name: "Test period",
					startDate: "2026-10-16",
					endDate: "2026-10-31",
				}),
			).rejects.toThrow("already exists");
			await expect(
				createPayrollPeriod({
					name: "Reversed",
					startDate: "2026-10-31",
					endDate: "2026-10-16",
				}),
			).rejects.toThrow("End date");
			expect(
				(await pool.query("SELECT * FROM accounting.payroll_periods")).rows,
			).toHaveLength(1);
		});
		it("database rejects reversed period dates even through direct SQL", async () => {
			await expect(
				pool.query(
					"INSERT INTO accounting.payroll_periods(name,start_date,end_date) VALUES ('Invalid','2026-11-15','2026-11-01')",
				),
			).rejects.toBeDefined();
		});
		it("saves concurrent first opening balances as one override", async () => {
			await Promise.all([
				saveOpeningBalanceOverride(2026, 10, "100.00"),
				saveOpeningBalanceOverride(2026, 10, "200.00"),
			]);
			const { rows } = await pool.query(
				"SELECT balance FROM accounting.operational_opening_balances WHERE month_year='2026-10'",
			);
			expect(rows).toHaveLength(1);
			expect(["100.00", "200.00"]).toContain(rows[0].balance);
		});

		it("saves concurrent first contracts and preserves omitted fields on updates", async () => {
			await pool.query(
				"DELETE FROM accounting.employee_contracts WHERE employee_id=$1",
				[employeeId],
			);
			await Promise.all([
				saveEmployeeContract(employeeId, { baseSalary: "10000.00" }),
				saveEmployeeContract(employeeId, { baseSalary: "20000.00" }),
			]);
			let result = await pool.query(
				"SELECT base_salary FROM accounting.employee_contracts WHERE employee_id=$1",
				[employeeId],
			);
			expect(result.rows).toHaveLength(1);
			const base = result.rows[0].base_salary;
			expect(["10000.00", "20000.00"]).toContain(base);
			await saveEmployeeContract(employeeId, { positionPay: "500.00" });
			result = await pool.query(
				"SELECT base_salary,position_pay FROM accounting.employee_contracts WHERE employee_id=$1",
				[employeeId],
			);
			expect(result.rows[0]).toEqual({
				base_salary: base,
				position_pay: "500.00",
			});
		});

		it("keeps one receipt and one matching ledger deposit during concurrent first saves", async () => {
			await Promise.all(
				Array.from({ length: 6 }, (_, i) =>
					saveDailyCashReceipt("2026-10-02", String(100 + i), String(90 + i)),
				),
			);
			const receipts = (
				await pool.query("SELECT * FROM accounting.daily_cash_receipts")
			).rows;
			const ledger = (
				await pool.query("SELECT * FROM accounting.operational_cash_flow")
			).rows;
			expect(receipts).toHaveLength(1);
			expect(ledger).toHaveLength(1);
			expect(ledger[0].debit).toBe(receipts[0].deposit);
			expect(ledger[0].receipt_id).toBe(receipts[0].id);
			await saveDailyCashReceipt("2026-10-02", "200", "180");
			expect(
				(await pool.query("SELECT debit FROM accounting.operational_cash_flow"))
					.rows,
			).toEqual([{ debit: "180.00" }]);
		});
		it("serializes overlapping bulk receipt saves regardless of input order", async () => {
			const entry = (dateString: string, deposit: string) => ({
				dateString,
				receipts: "100",
				deposit,
			});
			await Promise.all([
				saveBulkDailyCashReceipts([
					entry("2026-10-03", "20"),
					entry("2026-10-02", "10"),
				]),
				saveBulkDailyCashReceipts([
					entry("2026-10-02", "30"),
					entry("2026-10-03", "40"),
				]),
			]);
			const rows = (
				await pool.query(
					"SELECT r.deposit, l.debit FROM accounting.daily_cash_receipts r JOIN accounting.operational_cash_flow l ON l.receipt_id=r.id",
				)
			).rows;
			expect(rows).toHaveLength(2);
			for (const row of rows) expect(row.debit).toBe(row.deposit);
		});
		it("rolls back an entire receipt batch if a ledger insert fails", async () => {
			await pool.query(
				`CREATE OR REPLACE FUNCTION accounting.fail_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.date = '2026-10-03' THEN RAISE EXCEPTION 'injected ledger failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_receipt_ledger BEFORE INSERT ON accounting.operational_cash_flow FOR EACH ROW EXECUTE FUNCTION accounting.fail_receipt()`,
			);
			await expect(
				saveBulkDailyCashReceipts([
					{ dateString: "2026-10-02", receipts: "100", deposit: "90" },
					{ dateString: "2026-10-03", receipts: "100", deposit: "90" },
				]),
			).rejects.toBeDefined();
			expect(
				(await pool.query("SELECT * FROM accounting.daily_cash_receipts")).rows,
			).toHaveLength(0);
			expect(
				(await pool.query("SELECT * FROM accounting.operational_cash_flow"))
					.rows,
			).toHaveLength(0);
		});
		it("accepts the exact last ten cents and marks the loan paid", async () => {
			const loan = await createEmployeeLoan({
				employeeId,
				principalAmount: "1.00",
				monthlyDeduction: "0.10",
				dateIssued: "2026-10-01",
			});
			await recordLoanPayment({
				loanId: loan.id,
				amount: "0.90",
				datePaid: "2026-10-02",
			});
			await recordLoanPayment({
				loanId: loan.id,
				amount: "0.10",
				datePaid: "2026-10-02",
			});
			const saved = await getEmployeeLoanById(loan.id);
			expect(saved?.status).toBe("PAID");
			expect(saved?.payments).toHaveLength(2);
		});
		it("keeps odd-cent generated payroll totals consistent after an unchanged edit", async () => {
			await pool.query(
				"UPDATE accounting.employee_contracts SET base_salary=1.01, sss_ee=0.01 WHERE employee_id=$1",
				[employeeId],
			);
			await generatePayrollsForPeriod(periodId);
			const [saved] = await getPayrollsByPeriod(periodId);
			expect(saved).toMatchObject({
				halfSalary: "0.51",
				totalEarnings: "0.51",
				totalDeductions: "0.01",
				netPay: "0.50",
			});
			await updatePayroll(saved.id, {});
			const [edited] = await getPayrollsByPeriod(periodId);
			expect(edited.netPay).toBe(saved.netPay);
		});
		it("rolls back payment when the fully-paid status update fails", async () => {
			const loan = await createEmployeeLoan({
				employeeId,
				principalAmount: "100",
				monthlyDeduction: "10",
				dateIssued: "2026-10-01",
			});
			await pool.query(
				`CREATE OR REPLACE FUNCTION accounting.fail_status() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected status failure'; END $$; CREATE TRIGGER fail_loan_status BEFORE UPDATE ON accounting.employee_loans FOR EACH ROW EXECUTE FUNCTION accounting.fail_status()`,
			);
			await expect(
				recordLoanPayment({
					loanId: loan.id,
					amount: "100",
					datePaid: "2026-10-02",
				}),
			).rejects.toBeDefined();
			const saved = await getEmployeeLoanById(loan.id);
			expect(saved?.status).toBe("ACTIVE");
			expect(saved?.payments).toHaveLength(0);
		});
		it("preserves the previous draft payroll when replacement insertion fails", async () => {
			await generatePayrollsForPeriod(periodId);
			const previous = await getPayrollsByPeriod(periodId);
			expect(previous).toHaveLength(1);
			await pool.query(
				`CREATE OR REPLACE FUNCTION accounting.fail_payroll() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected payroll failure'; END $$; CREATE TRIGGER fail_payroll_insert BEFORE INSERT ON accounting.payrolls FOR EACH ROW EXECUTE FUNCTION accounting.fail_payroll()`,
			);
			await expect(generatePayrollsForPeriod(periodId)).rejects.toBeDefined();
			expect(await getPayrollsByPeriod(periodId)).toEqual(previous);
		});
		it("rejects competing payments that would exceed the same remaining balance", async () => {
			const loan = await createEmployeeLoan({
				employeeId,
				principalAmount: "100",
				monthlyDeduction: "10",
				dateIssued: "2026-10-01",
			});
			const results = await Promise.allSettled(
				Array.from({ length: 6 }, () =>
					recordLoanPayment({
						loanId: loan.id,
						amount: "60",
						datePaid: "2026-10-02",
					}),
				),
			);
			expect(
				results.filter((result) => result.status === "fulfilled"),
			).toHaveLength(1);
			const saved = await getEmployeeLoanById(loan.id);
			expect(saved?.payments).toHaveLength(1);
			expect(Number(saved?.payments[0].amount)).toBe(60);
			expect(saved?.status).toBe("ACTIVE");
		});
		it("accepts concurrent payments totaling the principal and marks the loan paid", async () => {
			const loan = await createEmployeeLoan({
				employeeId,
				principalAmount: "100",
				monthlyDeduction: "10",
				dateIssued: "2026-10-01",
			});
			await Promise.all(
				["40", "60"].map((amount) =>
					recordLoanPayment({
						loanId: loan.id,
						amount,
						datePaid: "2026-10-02",
					}),
				),
			);
			const saved = await getEmployeeLoanById(loan.id);
			expect(saved?.payments).toHaveLength(2);
			expect(saved?.status).toBe("PAID");
			await expect(
				recordLoanPayment({
					loanId: loan.id,
					amount: "1",
					datePaid: "2026-10-02",
				}),
			).rejects.toThrow("active loans");
		});
		it("serializes concurrent regeneration without duplicate employee payrolls", async () => {
			await pool.query(
				`CREATE OR REPLACE FUNCTION accounting.slow_payroll() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM pg_sleep(0.1); RETURN NEW; END $$; CREATE TRIGGER fail_payroll_insert BEFORE INSERT ON accounting.payrolls FOR EACH ROW EXECUTE FUNCTION accounting.slow_payroll()`,
			);
			await Promise.all(
				Array.from({ length: 3 }, () => generatePayrollsForPeriod(periodId)),
			);
			const saved = await getPayrollsByPeriod(periodId);
			expect(saved).toHaveLength(1);
			expect(saved[0].netPay).toBe("7500.00");
		});
		it("still clears a draft when the workforce becomes inactive", async () => {
			await generatePayrollsForPeriod(periodId);
			await pool.query("UPDATE accounting.employees SET archived_at = now()");
			expect(await generatePayrollsForPeriod(periodId)).toEqual([]);
			expect(await getPayrollsByPeriod(periodId)).toEqual([]);
		});
		it("does not replace a finalized period", async () => {
			await generatePayrollsForPeriod(periodId);
			const previous = await getPayrollsByPeriod(periodId);
			await updatePayrollPeriod(periodId, { status: "FINALIZED" });
			await expect(generatePayrollsForPeriod(periodId)).rejects.toThrow(
				"finalized",
			);
			expect(await getPayrollsByPeriod(periodId)).toEqual(previous);
		});
		it("rechecks draft status after a concurrent finalization commits", async () => {
			await generatePayrollsForPeriod(periodId);
			const previous = await getPayrollsByPeriod(periodId);
			const blocker = await pool.connect();
			let edit: Promise<unknown> | undefined;
			try {
				await blocker.query("BEGIN");
				await blocker.query(
					"UPDATE accounting.payroll_periods SET status = 'FINALIZED' WHERE id = $1",
					[periodId],
				);
				edit = updatePayroll(previous[0].id, { halfSalary: "9000" });
				// Attach rejection handling immediately, and verify the operation actually
				// waits for the held row lock rather than relying on a sleep race.
				const outcome = edit.then(
					(value) => ({ value }),
					(error) => ({ error }),
				);
				let waiting = false;
				for (let attempt = 0; attempt < 100; attempt++) {
					const result = await pool.query(
						"SELECT count(*)::int AS count FROM pg_stat_activity WHERE wait_event_type = 'Lock' AND query LIKE '%payroll_periods%'",
					);
					if (result.rows[0].count > 0) {
						waiting = true;
						break;
					}
					await new Promise((resolve) => setTimeout(resolve, 10));
				}
				await blocker.query("COMMIT");
				const result = await outcome;
				expect(waiting).toBe(true);
				expect(result).toHaveProperty("error");
				expect(await getPayrollsByPeriod(periodId)).toEqual(previous);
			} finally {
				await blocker.query("ROLLBACK");
				blocker.release();
				await edit?.catch(() => {});
			}
		});
	},
);
