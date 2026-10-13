import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("packages/ui utils", () => {
	describe("cn", () => {
		it("should merge tailwind class names properly", () => {
			expect(cn("px-2 py-1", "p-4")).toBe("p-4");
			expect(cn("text-red-500", undefined, "font-bold")).toBe(
				"text-red-500 font-bold",
			);
		});
	});
});
