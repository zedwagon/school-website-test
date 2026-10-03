import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import WebSocket, { WebSocketServer } from "ws";
import { DatabaseWebSocket } from "../src/database-websocket";
import { RecoveringPool } from "../src/recovering-pool";

// Real PostgreSQL and real Neon WebSocket driver: no Pool/connect/query mocks.
// Opt-in only, to avoid requiring PostgreSQL on every developer/CI machine.
const enabled = process.env.RUN_DB_RECOVERY_INTEGRATION === "1";
describe.skipIf(!enabled)("connection recovery against real PostgreSQL", () => {
	const pgBin = process.env.PG_BIN || "/usr/lib/postgresql/18/bin";
	let dataDir: string;
	let server: WebSocketServer;
	let rejectConnections = 0;
	let attempts = 0;
	let online = true;
	let dropNextResponse = false;
	let postgresStarted = false;
	let stallConnections = false;
	const postgresPort = 55439;
	const sockets = new Set<net.Socket>();
	const original = {
		wsProxy: neonConfig.wsProxy,
		webSocketConstructor: neonConfig.webSocketConstructor,
		useSecureWebSocket: neonConfig.useSecureWebSocket,
		forceDisablePgSSL: neonConfig.forceDisablePgSSL,
		pipelineConnect: neonConfig.pipelineConnect,
	};
	let connectionString: string;
	const makePool = (recover = true) => {
		const Constructor = recover ? RecoveringPool : Pool;
		const pool = new Constructor({
			connectionString,
			max: 1,
			connectionTimeoutMillis: 1_000,
			idleTimeoutMillis: 100,
		});
		pool.on("error", () => {});
		return pool;
	};
	beforeAll(async () => {
		dataDir = mkdtempSync(join(tmpdir(), "mpps-recovery-pg-"));
		execFileSync(
			join(pgBin, "initdb"),
			["-D", dataDir, "-A", "trust", "-U", "recovery_test", "--no-locale"],
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
		postgresStarted = true;
		server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
		await new Promise<void>((resolve) => server.once("listening", resolve));
		server.on("connection", (ws) => {
			attempts++;
			if (!online || rejectConnections-- > 0) {
				ws.close();
				return;
			}
			const tcp = net.connect(postgresPort, "127.0.0.1");
			// Accept WebSocket but never complete PostgreSQL handshake for timeout testing.
			if (stallConnections) {
				tcp.destroy();
				return;
			}
			sockets.add(tcp);
			tcp.on("close", () => {
				sockets.delete(tcp);
				if (ws.readyState === WebSocket.OPEN) ws.close();
			});
			ws.on("message", (data) => tcp.write(data as Buffer));
			tcp.on("data", (data) => {
				// Lose the response only after PostgreSQL executed a write.
				if (dropNextResponse && data.includes(Buffer.from("INSERT 0 1"))) {
					dropNextResponse = false;
					tcp.destroy();
					ws.terminate();
					return;
				}
				if (ws.readyState === WebSocket.OPEN) ws.send(data);
			});
			tcp.on("error", () => ws.terminate());
			ws.on("close", () => tcp.destroy());
			ws.on("error", () => tcp.destroy());
			tcp.on("end", () => ws.close());
		});
		const address = server.address() as net.AddressInfo;
		neonConfig.webSocketConstructor = DatabaseWebSocket;
		neonConfig.wsProxy = () => `127.0.0.1:${address.port}`;
		neonConfig.useSecureWebSocket = false;
		neonConfig.forceDisablePgSSL = true;
		neonConfig.pipelineConnect = false;
		connectionString = `postgresql://recovery_test@127.0.0.1:${postgresPort}/postgres`;
	}, 20_000);
	afterAll(async () => {
		for (const socket of sockets) socket.destroy();
		if (server) {
			for (const ws of server.clients) ws.terminate();
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
		Object.assign(neonConfig, original);
		if (postgresStarted)
			execFileSync(
				join(pgBin, "pg_ctl"),
				["-D", dataDir, "-m", "immediate", "-w", "stop"],
				{ stdio: "pipe" },
			);
	});
	it("reproduces failure without recovery, then succeeds with recovery", async () => {
		rejectConnections = 1;
		const baseline = makePool(false);
		try {
			await expect(baseline.query("SELECT 1 AS value")).rejects.toBeDefined();
		} finally {
			await baseline.end();
		}
		rejectConnections = 1;
		const pool = makePool();
		try {
			const db = drizzle({ client: pool });
			const result = await db.execute(sql`SELECT 1 AS value`);
			expect(result.rows[0].value).toBe(1);
		} finally {
			await pool.end();
		}
	});
	it("recovers on the third real connection within the shorter budget", async () => {
		rejectConnections = 2;
		attempts = 0;
		const pool = makePool();
		const started = Date.now();
		try {
			expect((await pool.query("SELECT 1 AS value")).rows[0].value).toBe(1);
			expect(attempts).toBe(3);
			expect(Date.now() - started).toBeGreaterThanOrEqual(1_500);
		} finally {
			await pool.end();
		}
	}, 40_000);
	it("fails cleanly during a sustained outage and succeeds on the next request", async () => {
		online = false;
		attempts = 0;
		const pool = makePool();
		try {
			await expect(pool.query("SELECT 1")).rejects.toBeDefined();
			expect(attempts).toBe(3);
			online = true;
			expect((await pool.query("SELECT 1 AS value")).rows[0].value).toBe(1);
		} finally {
			online = true;
			await pool.end();
		}
	}, 40_000);
	it("terminates stalled real handshakes within the acquisition budget", async () => {
		stallConnections = true;
		attempts = 0;
		const pool = new RecoveringPool({
			connectionString,
			max: 1,
			connectionTimeoutMillis: 20_000,
		});
		pool.on("error", () => {});
		const started = Date.now();
		try {
			await expect(pool.query("SELECT 1")).rejects.toBeDefined();
			const elapsed = Date.now() - started;
			expect(attempts).toBe(3);
			expect(elapsed).toBeGreaterThanOrEqual(13_000);
			expect(elapsed).toBeLessThan(17_000);
			stallConnections = false;
			expect((await pool.query("SELECT 1 AS value")).rows[0].value).toBe(1);
		} finally {
			stallConnections = false;
			await pool.end();
		}
	}, 20_000);
	it("reconnects after an idle database connection is terminated", async () => {
		const pool = makePool();
		try {
			await pool.query("SELECT 1");
			const disconnected = new Promise<void>((resolve) =>
				pool.once("error", () => resolve()),
			);
			for (const socket of sockets) socket.destroy();
			await disconnected;
			expect((await pool.query("SELECT 1 AS value")).rows[0].value).toBe(1);
		} finally {
			await pool.end();
		}
	});
	it("recovers concurrent reads without leaking checked-out clients", async () => {
		rejectConnections = 1;
		const pool = makePool();
		try {
			const results = await Promise.all([
				pool.query("SELECT 1 AS value"),
				pool.query("SELECT 2 AS value"),
				pool.query("SELECT 3 AS value"),
			]);
			expect(results.map((result) => result.rows[0].value)).toEqual([1, 2, 3]);
			expect(pool.waitingCount).toBe(0);
			expect(pool.totalCount).toBeLessThanOrEqual(1);
			expect(pool.idleCount).toBe(pool.totalCount);
		} finally {
			await pool.end();
		}
	});
	it("does not duplicate a committed write when its response is lost", async () => {
		const pool = makePool();
		try {
			await pool.query(
				"CREATE TABLE write_probe (id integer GENERATED ALWAYS AS IDENTITY)",
			);
			attempts = 0;
			dropNextResponse = true;
			await expect(
				pool.query("INSERT INTO write_probe DEFAULT VALUES"),
			).rejects.toBeDefined();
			expect(
				(await pool.query("SELECT count(*)::int AS count FROM write_probe"))
					.rows[0].count,
			).toBe(1);
			expect(attempts).toBe(1); // Only the subsequent SELECT opened a new connection.
		} finally {
			dropNextResponse = false;
			await pool.end();
		}
	});
});
