import { resolve } from "node:path";
import { config } from "dotenv";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

export async function runMigrations(productionOnly = false) {
	// Check deployment metadata before loading local environment or connecting.
	if (productionOnly && process.env.VERCEL_ENV !== "production") {
		console.log("Skipping automatic migrations outside Vercel production.");
		return;
	}

	config({ path: resolve(__dirname, "../../.env.local"), quiet: true });
	const { db } = await import("./src/db");
	try {
		await migrate(db, { migrationsFolder: resolve(__dirname, "drizzle") });
		console.log("Database migrations are up to date.");
	} finally {
		await db.$client.end();
	}
}
