import { neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import { DatabaseWebSocket } from "../src/database-websocket";
import { RecoveringPool } from "../src/recovering-pool";

// Read-only smoke probe; never print connection strings or nested driver errors.
async function main() {
	config({
		path: process.env.RECOVERY_ENV_FILE || "apps/accounting/.env",
		quiet: true,
	});
	neonConfig.webSocketConstructor = DatabaseWebSocket;
	const pool = new RecoveringPool({
		connectionString: process.env.DATABASE_URL,
		connectionTimeoutMillis: 3_000,
		max: 1,
	});
	pool.on("error", () => {});
	const started = Date.now();
	try {
		const result = await pool.query("SELECT 1 AS healthy");
		if (result.rows[0]?.healthy !== 1) throw new Error("Unexpected result");
		console.log(
			JSON.stringify({ result: "PASS", elapsedMs: Date.now() - started }),
		);
	} catch {
		console.error(
			JSON.stringify({
				result: "FAIL: database connection unavailable",
				elapsedMs: Date.now() - started,
			}),
		);
		process.exitCode = 1;
	} finally {
		await pool.end();
	}
}
void main();
