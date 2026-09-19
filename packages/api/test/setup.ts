console.log("SETUP.TS IS RUNNING!");

import path from "node:path";
import { config } from "dotenv";

// Load the staging environment variables for integration testing
const result = config({
	path: path.resolve(__dirname, "../../../scripts/.env.sandbox"),
});
if (result.error) {
	throw new Error(`Failed to load .env.sandbox: ${result.error.message}`);
}
if (result.parsed?.DATABASE_URL) {
	process.env.DATABASE_URL = result.parsed.DATABASE_URL;
}

import { vi } from "vitest";

// Mock server-only package globally for test runner
vi.mock("server-only", () => ({}));

// Mock environment variables needed for API initialization if missing
process.env.JWT_SECRET =
	process.env.JWT_SECRET || "test_secret_for_vitest_mocking_only";

import { afterAll } from "vitest";

// Force exit after tests to avoid hanging due to DB connection pools
afterAll(() => {
	setTimeout(() => process.exit(0), 500);
});
