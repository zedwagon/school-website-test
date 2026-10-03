/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button Component", () => {
	afterEach(() => {
		cleanup();
	});
	it("renders correctly", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByText("Click me")).toBeDefined();
	});

	it("handles click events", () => {
		let clicked = false;
		render(<Button onClick={() => (clicked = true)}>Click me</Button>);
		fireEvent.click(screen.getByText("Click me"));
		expect(clicked).toBe(true);
	});

	it("applies variant classes", () => {
		const { container } = render(<Button variant="destructive">Delete</Button>);
		expect((container.firstChild as HTMLElement).className).toContain(
			"bg-destructive",
		);
	});
});
