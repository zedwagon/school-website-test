import { Pool, type PoolClient } from "@neondatabase/serverless";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecoveringPool } from "./recovering-pool";

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});
describe("database connection recovery", () => {
	it.each([
		undefined,
		0,
		-1,
		Number.NaN,
		20_000,
	])("caps each attempt even when timeout is %s", (timeout) => {
		expect(
			new RecoveringPool({ connectionTimeoutMillis: timeout }).options
				.connectionTimeoutMillis,
		).toBe(4_000);
	});
	it("preserves a caller's shorter acquisition timeout", () => {
		expect(
			new RecoveringPool({ connectionTimeoutMillis: 1_000 }).options
				.connectionTimeoutMillis,
		).toBe(1_000);
	});
	it("bounds three fully timed-out attempts to 13.5 seconds of configured waiting", async () => {
		vi.useFakeTimers();
		const started = Date.now();
		const failure = Object.assign(new Error("Timed out"), {
			code: "ETIMEDOUT",
		});
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockImplementation(
				() =>
					new Promise((_resolve, reject) =>
						setTimeout(() => reject(failure), 4_000),
					),
			);
		const assertion = expect(new RecoveringPool().connect()).rejects.toBe(
			failure,
		);
		await vi.runAllTimersAsync();
		await assertion;
		expect(Date.now() - started).toBe(13_500);
		expect(connect).toHaveBeenCalledTimes(3);
	});
	it.each([
		"ECONNRESET",
		"ETIMEDOUT",
		"EAI_AGAIN",
		"57P03",
		"53300",
	])("retries transient code %s", async (code) => {
		vi.useFakeTimers();
		const client = { release: vi.fn() } as unknown as PoolClient;
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockRejectedValueOnce(Object.assign(new Error("Unavailable"), { code }))
			.mockImplementationOnce(async () => client);
		const pending = new RecoveringPool().connect();
		await vi.runAllTimersAsync();
		expect(await pending).toBe(client);
		expect(connect).toHaveBeenCalledTimes(2);
	});
	it("unwraps WebSocket ErrorEvents and AggregateError causes", async () => {
		vi.useFakeTimers();
		const client = { release: vi.fn() } as unknown as PoolClient;
		const failure = {
			error: {
				cause: new AggregateError([
					Object.assign(new Error("Unavailable"), { code: "ETIMEDOUT" }),
				]),
			},
		};
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockRejectedValueOnce(failure)
			.mockImplementationOnce(async () => client);
		const pending = new RecoveringPool().connect();
		await vi.runAllTimersAsync();
		expect(await pending).toBe(client);
		expect(connect).toHaveBeenCalledTimes(2);
	});
	it.each([
		"28P01",
		"28000",
		"3D000",
		"42P01",
		"ENOTFOUND",
		"CERT_HAS_EXPIRED",
		"EINVAL",
	])("does not retry permanent or unknown code %s", async (code) => {
		const failure = Object.assign(new Error("Connection terminated"), { code });
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockRejectedValue(failure);
		await expect(new RecoveringPool().connect()).rejects.toBe(failure);
		expect(connect).toHaveBeenCalledTimes(1);
	});
	it("does not retry an unknown error or loop through cyclic causes", async () => {
		const failure = { message: "Unknown configuration failure", cause: {} };
		failure.cause = failure;
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockRejectedValue(failure);
		await expect(new RecoveringPool().connect()).rejects.toBe(failure);
		expect(connect).toHaveBeenCalledTimes(1);
	});
	it("never replays a query after execution fails", async () => {
		const failure = new Error("Connection lost after SQL was sent");
		const query = vi.fn((_sql, _values, callback) => callback(failure));
		const client = {
			release: vi.fn(),
			once: vi.fn(),
			removeListener: vi.fn(),
			query,
		} as unknown as PoolClient;
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockImplementation(async () => client);
		await expect(
			new RecoveringPool().query("INSERT INTO example VALUES (1)"),
		).rejects.toBe(failure);
		expect(query).toHaveBeenCalledTimes(1);
		expect(connect).toHaveBeenCalledTimes(1);
	});
	it("reports a failed callback acquisition without a client", async () => {
		const failure = Object.assign(new Error("Invalid password"), {
			code: "28P01",
		});
		vi.spyOn(Pool.prototype, "connect").mockRejectedValue(failure);
		await new Promise<void>((resolve) => {
			new RecoveringPool().connect((error, client) => {
				expect(error).toBe(failure);
				expect(client).toBeUndefined();
				resolve();
			});
		});
	});
	it("recovers when a sleeping database fails the first connection", async () => {
		vi.useFakeTimers();
		const client = { release: vi.fn() } as unknown as PoolClient;
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockRejectedValueOnce(new Error("Connection terminated"))
			.mockImplementationOnce(async () => client);
		const pending = new RecoveringPool().connect();
		await vi.runAllTimersAsync();
		expect(await pending).toBe(client);
		expect(connect).toHaveBeenCalledTimes(2);
	});
	it("stops after three failed acquisitions", async () => {
		vi.useFakeTimers();
		const failure = new Error("Connection terminated");
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockRejectedValue(failure);
		const assertion = expect(new RecoveringPool().connect()).rejects.toBe(
			failure,
		);
		await vi.runAllTimersAsync();
		await assertion;
		expect(connect).toHaveBeenCalledTimes(3);
	});
	it("waits only 0.5 and 1 second between recovery attempts", async () => {
		vi.useFakeTimers();
		const client = { release: vi.fn() } as unknown as PoolClient;
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockRejectedValueOnce(new Error("Connection terminated"))
			.mockRejectedValueOnce(new Error("Connection terminated"))
			.mockImplementationOnce(async () => client);
		const pending = new RecoveringPool().connect();
		await vi.advanceTimersByTimeAsync(499);
		expect(connect).toHaveBeenCalledTimes(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(connect).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(999);
		expect(connect).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(1);
		expect(await pending).toBe(client);
		expect(connect).toHaveBeenCalledTimes(3);
	});
	it("does not retry invalid credentials", async () => {
		const failure = Object.assign(new Error("Invalid password"), {
			code: "28P01",
		});
		const connect = vi
			.spyOn(Pool.prototype, "connect")
			.mockRejectedValue(failure);
		await expect(new RecoveringPool().connect()).rejects.toBe(failure);
		expect(connect).toHaveBeenCalledTimes(1);
	});
	it("supports the callback path used by pool queries", async () => {
		const release = vi.fn();
		const client = { release } as unknown as PoolClient;
		vi.spyOn(Pool.prototype, "connect").mockImplementation(async () => client);
		await new Promise<void>((resolve) => {
			new RecoveringPool().connect((error, acquired, done) => {
				expect(error).toBeUndefined();
				expect(acquired).toBe(client);
				done();
				expect(release).toHaveBeenCalledOnce();
				resolve();
			});
		});
	});
});
