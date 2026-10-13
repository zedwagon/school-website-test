import { describe, expect, it } from "vitest";
import { getStaffImagePath } from "./utils";

describe("utils", () => {
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

});
