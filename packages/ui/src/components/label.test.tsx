/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders label text correctly", () => {
		render(<Label htmlFor="input-id">Username</Label>);
		const label = screen.getByText("Username");
		expect(label).toBeDefined();
		expect(label.getAttribute("data-slot")).toBe("label");
	});
});
