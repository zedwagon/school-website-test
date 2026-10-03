import { readFileSync } from "node:fs";
import { getDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { neonConfig, type Pool } from "@neondatabase/serverless";
import { parse } from "dotenv";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DatabaseWebSocket } from "../src/database-websocket";
import { RecoveringPool } from "../src/recovering-pool";

// Opt-in, real Neon, SELECT-only. Never change records or print driver errors/URLs.
describe.skipIf(process.env.RUN_LIVE_NEON_RECOVERY !== "1")(
	"live Neon network fix",
	() => {
		let connectionString: string;
		let socketAttempts = 0;
		const originalConstructor = neonConfig.webSocketConstructor;
		const globalTimeout = getDefaultAutoSelectFamilyAttemptTimeout();
		class CountingWebSocket extends DatabaseWebSocket {
			constructor(address: string | URL) {
				socketAttempts++;
				super(address);
			}
		}
		const makePool = (url = connectionString, idleTimeoutMillis = 500) => {
			const pool = new RecoveringPool({
				connectionString: url,
				max: 3,
				connectionTimeoutMillis: 10_000,
				idleTimeoutMillis,
			});
			pool.on("error", () => {});
			return pool;
		};
		async function healthy(pool: Pool) {
			try {
				return (await pool.query("SELECT 1 AS healthy")).rows[0]?.healthy === 1;
			} catch {
				return false;
			} // Suppress credential-bearing error objects in test output.
		}
		beforeAll(() => {
			connectionString =
				parse(
					readFileSync(
						process.env.RECOVERY_ENV_FILE || "apps/accounting/.env",
						"utf8",
					),
				).DATABASE_URL ||
				process.env.DATABASE_URL ||
				"";
			if (!connectionString) throw new Error("No test connection configured");
			neonConfig.webSocketConstructor = CountingWebSocket;
		});
		afterAll(() => {
			neonConfig.webSocketConstructor = originalConstructor;
		});
		it("connects to the pooled endpoint on its first attempt without global flags", async () => {
			const pool = makePool();
			const before = socketAttempts;
			try {
				expect(await healthy(pool)).toBe(true);
				expect(socketAttempts - before).toBe(1);
			} finally {
				await pool.end();
			}
			expect(getDefaultAutoSelectFamilyAttemptTimeout()).toBe(globalTimeout);
		});
		it("also connects directly without Neon's hosted pooler", async () => {
			const url = new URL(connectionString);
			url.hostname = url.hostname.replace("-pooler.", ".");
			const pool = makePool(url.toString());
			const before = socketAttempts;
			try {
				expect(await healthy(pool)).toBe(true);
				expect(socketAttempts - before).toBe(1);
			} finally {
				await pool.end();
			}
		});
		it("succeeds across five fresh pools", async () => {
			for (let i = 0; i < 5; i++) {
				const pool = makePool();
				const before = socketAttempts;
				try {
					expect(await healthy(pool)).toBe(true);
					expect(socketAttempts - before).toBe(1);
				} finally {
					await pool.end();
				}
			}
		}, 30_000);
		it("serves eight concurrent reads and releases every client", async () => {
			const pool = makePool(connectionString, 5_000);
			try {
				expect(
					await Promise.all(Array.from({ length: 8 }, () => healthy(pool))),
				).toEqual(Array(8).fill(true));
				expect(pool.waitingCount).toBe(0);
				expect(pool.totalCount).toBeLessThanOrEqual(3);
				expect(pool.idleCount).toBe(pool.totalCount);
			} finally {
				await pool.end();
			}
		});
		it("reuses a warm connection, then reconnects after idle cleanup", async () => {
			const pool = makePool();
			const before = socketAttempts;
			try {
				expect(await healthy(pool)).toBe(true);
				expect(await healthy(pool)).toBe(true);
				expect(socketAttempts - before).toBe(1);
				await new Promise((resolve) => setTimeout(resolve, 750));
				expect(pool.totalCount).toBe(0);
				expect(await healthy(pool)).toBe(true);
				expect(socketAttempts - before).toBe(2);
			} finally {
				await pool.end();
			}
		});
	},
);
