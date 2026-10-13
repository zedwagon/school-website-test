import {
	Pool,
	type PoolClient,
	type PoolConfig,
} from "@neondatabase/serverless";

// At most 3 * 4s acquisition + 0.5s/1s backoff = 13.5s (plus scheduling overhead).
export const DB_CONNECTION_ATTEMPT_TIMEOUT_MS = 4_000;
const RETRY_DELAYS_MS = [500, 1_000] as const;
const TRANSIENT_CODES = new Set([
	"ETIMEDOUT",
	"ECONNRESET",
	"ECONNREFUSED",
	"EPIPE",
	"EAI_AGAIN",
	"ENETUNREACH",
	"EHOSTUNREACH",
	"57P01",
	"57P02",
	"57P03",
	"53300",
]);

function isTransientConnectionError(error: unknown): boolean {
	const codes: string[] = [];
	const messages: string[] = [];
	const seen = new Set<object>();
	const visit = (value: unknown) => {
		if (!value || typeof value !== "object" || seen.has(value)) return;
		seen.add(value);
		const detail = value as {
			code?: unknown;
			message?: unknown;
			error?: unknown;
			cause?: unknown;
			errors?: unknown;
		};
		if (typeof detail.code === "string") codes.push(detail.code);
		if (typeof detail.message === "string") messages.push(detail.message);
		visit(detail.error);
		visit(detail.cause);
		if (Array.isArray(detail.errors)) detail.errors.forEach(visit);
	};
	visit(error);
	// Explicit codes take precedence: never retry credentials, TLS, SQL, or unknown codes.
	if (codes.length) return codes.every((code) => TRANSIENT_CODES.has(code));
	return messages.some((message) =>
		/^(Connection terminated(?: unexpectedly| due to connection timeout)?|Connection closed unexpectedly|Connection ended unexpectedly|timeout exceeded when trying to connect)$/i.test(
			message,
		),
	);
}

type ConnectCallback = (
	error: Error | undefined,
	client: PoolClient | undefined,
	release: (error?: Error | boolean) => void,
) => void;

// Retry only acquisition: no SQL has been sent, so writes cannot be replayed.
export class RecoveringPool extends Pool {
	constructor(options: PoolConfig = {}) {
		const timeout = options.connectionTimeoutMillis;
		super({
			...options,
			// Always finite, including callers that request zero (unlimited).
			connectionTimeoutMillis:
				typeof timeout === "number" && Number.isFinite(timeout) && timeout > 0
					? Math.min(timeout, DB_CONNECTION_ATTEMPT_TIMEOUT_MS)
					: DB_CONNECTION_ATTEMPT_TIMEOUT_MS,
		});
	}
	connect(): Promise<PoolClient>;
	connect(callback: ConnectCallback): void;
	connect(callback?: ConnectCallback): Promise<PoolClient> | undefined {
		const acquire = async (): Promise<PoolClient> => {
			for (let attempt = 0; ; attempt++) {
				try {
					return await super.connect();
				} catch (error) {
					if (
						attempt >= RETRY_DELAYS_MS.length ||
						!isTransientConnectionError(error)
					)
						throw error;
					await new Promise((resolve) =>
						setTimeout(resolve, RETRY_DELAYS_MS[attempt]),
					);
				}
			}
		};
		const pending = acquire();
		if (!callback) return pending;
		void pending.then(
			(client) => callback(undefined, client, client.release.bind(client)),
			(error) => callback(error, undefined, () => {}),
		);
	}
}
