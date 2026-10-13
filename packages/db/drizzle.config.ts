import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../../.env.local"), quiet: true });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
