import { describe, expect, it } from "vitest";
import { cn, formatPH, getStaffImagePath } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge tailwind classes properly", () => {
      expect(cn("p-4", "p-2")).toBe("p-2");
      expect(cn("bg-red-500", undefined, "text-white")).toBe(
        "bg-red-500 text-white",
      );
    });
  });

  describe("getStaffImagePath", () => {
    it("should build the correct image path with default parameters", () => {
      expect(getStaffImagePath("john-doe")).toBe(
        "/about/administration-faculty/john-doe.webp",
      );
    });

    it("should build the correct image path with custom parameters", () => {
      expect(getStaffImagePath("jane-smith", "/images/", ".png")).toBe(
        "/images/jane-smith.png",
      );
    });
  });

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
