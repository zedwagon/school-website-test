import { describe, expect, it } from "vitest";
import { formatPH } from "./date";

describe("Philippine date formatting", () => {
	describe("formatPH", () => {
		it("should return '—' for null or undefined dates", () => {
			expect(formatPH(null)).toBe("—");
			expect(formatPH(undefined)).toBe("—");
		});

		it("should format ISO strings to Philippine Time (GMT+8)", () => {
			const utcDateStr = "2024-01-01T00:00:00Z";
			const formatted = formatPH(utcDateStr, {
				hour12: false,
				hour: "numeric",
				timeZoneName: "short",
			});

			// UTC 00:00 is PH 08:00
			expect(formatted).toContain("08");
		});

		it("should handle postgres-style string timestamps without Z suffix", () => {
			// Treating this as UTC, so GMT+8 should be 20:00
			const pgDateStr = "2024-01-01 12:00:00";
			const formatted = formatPH(pgDateStr, { hour12: false, hour: "numeric" });

			expect(formatted).toContain("20");
		});
	});
});
