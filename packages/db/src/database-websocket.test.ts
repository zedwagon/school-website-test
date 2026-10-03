import {
	getDefaultAutoSelectFamily,
	getDefaultAutoSelectFamilyAttemptTimeout,
} from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatabaseWebSocket } from "./database-websocket";

const { calls } = vi.hoisted(() => ({ calls: vi.fn() }));
vi.mock("ws", () => ({
	default: class {
		constructor(...args: unknown[]) {
			calls(...args);
		}
	},
}));
afterEach(() => calls.mockClear());
describe("database-only address selection", () => {
	it("allows two seconds per address without forcing IPv4 or disabling TLS", () => {
		new DatabaseWebSocket("wss://example.invalid/v2");
		const options = calls.mock.calls[0][2];
		expect(options.autoSelectFamily).toBe(true);
		expect(options.autoSelectFamilyAttemptTimeout).toBe(2_000);
		expect(options.family).toBeUndefined();
		expect(options.rejectUnauthorized).toBeUndefined();
	});
	it("leaves Node's global networking defaults unchanged", () => {
		const family = getDefaultAutoSelectFamily();
		const timeout = getDefaultAutoSelectFamilyAttemptTimeout();
		new DatabaseWebSocket("wss://example.invalid/v2");
		expect(getDefaultAutoSelectFamily()).toBe(family);
		expect(getDefaultAutoSelectFamilyAttemptTimeout()).toBe(timeout);
	});
	it("preserves the options-only constructor and explicit overrides", () => {
		new DatabaseWebSocket("wss://example.invalid/v2", {
			headers: { "x-test": "yes" },
			autoSelectFamilyAttemptTimeout: 3_000,
		});
		expect(calls.mock.calls[0][1]).toMatchObject({
			headers: { "x-test": "yes" },
			autoSelectFamilyAttemptTimeout: 3_000,
		});
	});
	it("preserves protocols and handshake settings", () => {
		new DatabaseWebSocket("wss://example.invalid/v2", ["postgres"], {
			handshakeTimeout: 5_000,
		});
		expect(calls.mock.calls[0][1]).toEqual(["postgres"]);
		expect(calls.mock.calls[0][2]).toMatchObject({
			handshakeTimeout: 5_000,
			autoSelectFamilyAttemptTimeout: 2_000,
		});
	});
});
