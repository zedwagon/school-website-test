/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DatePicker } from "./date-picker";

describe("DatePicker Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders trigger button with placeholder", () => {
		render(<DatePicker placeholder="Select Birthdate" />);
		expect(screen.getByText("Select Birthdate")).toBeDefined();
	});
});
