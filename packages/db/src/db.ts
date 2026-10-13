import { neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { DatabaseWebSocket } from "./database-websocket";
import {
	DB_CONNECTION_ATTEMPT_TIMEOUT_MS,
	RecoveringPool,
} from "./recovering-pool";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in environment variables");
}

// Enable WebSockets for Node.js environments
neonConfig.webSocketConstructor = DatabaseWebSocket;

const pool = new RecoveringPool({
	connectionString: process.env.DATABASE_URL,
	max: 3,
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: DB_CONNECTION_ATTEMPT_TIMEOUT_MS,
});

// Prevent unhandled WebSocket errors from crashing the process
pool.on("error", (err: Error) => {
	console.error("[DB Pool] Connection error (will reconnect):", err.message);
});

export const db = drizzle({ client: pool, schema });
