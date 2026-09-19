import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "../src/db";

describe("Database Connection", () => {
	it("should initialize the database client", () => {
		expect(db).toBeDefined();
	});

	it("should be able to run a simple sql query", async () => {
		// This assumes the DB is reachable during tests (which it is, since other tests use it)
		const result = await db.execute(sql`SELECT 1 as result`);
		expect(result).toBeDefined();
	});
});
