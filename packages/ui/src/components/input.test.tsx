/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders correctly", () => {
		render(<Input placeholder="Enter text..." />);
		const element = screen.getByPlaceholderText("Enter text...");
		expect(element).toBeDefined();
		expect(element.getAttribute("data-slot")).toBe("input");
	});

	it("handles user input", () => {
		render(<Input placeholder="Enter text..." />);
		const input = screen.getByPlaceholderText(
			"Enter text...",
		) as HTMLInputElement;
		fireEvent.change(input, { target: { value: "Hello World" } });
		expect(input.value).toBe("Hello World");
	});
});
