import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runMigrations } from "./migrate-runner";

const mocks = vi.hoisted(() => ({
	config: vi.fn(),
	migrate: vi.fn(),
	connect: vi.fn(),
	end: vi.fn(),
}));
vi.mock("dotenv", () => ({ config: mocks.config }));
vi.mock("drizzle-orm/neon-serverless/migrator", () => ({
	migrate: mocks.migrate,
}));
vi.mock("./src/db", () => {
	mocks.connect();
	return { db: { $client: { end: mocks.end } } };
});

describe("build migration gate", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mocks.migrate.mockResolvedValue(undefined);
	});
	afterEach(() => vi.unstubAllEnvs());

	it.each([
		"preview",
		"development",
		"",
		undefined,
	])("skips %s without loading environment or database", async (environment) => {
		vi.stubEnv("VERCEL_ENV", environment);
		await runMigrations(true);
		expect(mocks.config).not.toHaveBeenCalled();
		expect(mocks.connect).not.toHaveBeenCalled();
		expect(mocks.migrate).not.toHaveBeenCalled();
	});

	it("runs migrations on production builds", async () => {
		vi.stubEnv("VERCEL_ENV", "production");
		await runMigrations(true);
		expect(mocks.migrate).toHaveBeenCalledOnce();
		expect(mocks.end).toHaveBeenCalledOnce();
	});

	it("allows explicit manual migrations outside production", async () => {
		vi.stubEnv("VERCEL_ENV", "preview");
		await runMigrations();
		expect(mocks.migrate).toHaveBeenCalledOnce();
	});

	it("propagates migration failures and closes the connection", async () => {
		vi.stubEnv("VERCEL_ENV", "production");
		mocks.migrate.mockRejectedValueOnce(new Error("Migration failed"));
		await expect(runMigrations(true)).rejects.toThrow("Migration failed");
		expect(mocks.end).toHaveBeenCalledOnce();
	});
});
