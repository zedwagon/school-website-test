import WebSocket from "ws";

type ConnectionOptions = WebSocket.ClientOptions & {
	autoSelectFamily?: boolean;
	autoSelectFamilyAttemptTimeout?: number;
};

// Allow slower IPv4/IPv6 address attempts without changing global Node networking.
// This is TCP address selection, not the total database connection timeout.
export class DatabaseWebSocket extends WebSocket {
	constructor(address: string | URL, options?: ConnectionOptions);
	constructor(
		address: string | URL,
		protocols?: string | string[],
		options?: ConnectionOptions,
	);
	constructor(
		address: string | URL,
		protocolsOrOptions?: string | string[] | ConnectionOptions,
		options?: ConnectionOptions,
	) {
		const suppliedOptions =
			typeof protocolsOrOptions === "object" &&
			!Array.isArray(protocolsOrOptions)
				? protocolsOrOptions
				: options;
		const connectionOptions: ConnectionOptions = {
			autoSelectFamily: true,
			autoSelectFamilyAttemptTimeout: 2_000,
			...suppliedOptions,
		};
		if (
			typeof protocolsOrOptions === "object" &&
			!Array.isArray(protocolsOrOptions)
		) {
			super(address, connectionOptions);
		} else {
			super(address, protocolsOrOptions, connectionOptions);
		}
	}
}
