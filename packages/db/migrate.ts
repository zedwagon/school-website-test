import { runMigrations } from "./migrate-runner";

runMigrations(process.argv.includes("--production-only")).catch(
	(error: unknown) => {
		// Avoid dumping connection options or credentials in build logs.
		console.error(
			"Database migration failed:",
			error instanceof Error ? error.message : "Unknown error",
		);
		process.exitCode = 1;
	},
);
