import { resolve } from "node:path";
import { config } from "dotenv";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

config({ path: resolve(__dirname, "../../apps/website/.env"), quiet: true });

async function main() {
	// Load after dotenv and use the same recovering pool/transport as the apps.
	const { db } = await import("./src/db");
	try {
		await migrate(db, { migrationsFolder: resolve(__dirname, "drizzle") });
		console.log("Database migrations are up to date.");
	} finally {
		await db.$client.end();
	}
}

main().catch((error: unknown) => {
	// Avoid dumping connection options or credentials in build logs.
	console.error(
		"Database migration failed:",
		error instanceof Error ? error.message : "Unknown error",
	);
	process.exitCode = 1;
});
