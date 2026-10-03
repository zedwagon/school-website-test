/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders textarea correctly", () => {
		render(<Textarea placeholder="Type notes here..." />);
		const textarea = screen.getByPlaceholderText(
			"Type notes here...",
		) as HTMLTextAreaElement;
		expect(textarea).toBeDefined();
		expect(textarea.getAttribute("data-slot")).toBe("textarea");
	});

	it("handles text change", () => {
		render(<Textarea placeholder="Type notes here..." />);
		const textarea = screen.getByPlaceholderText(
			"Type notes here...",
		) as HTMLTextAreaElement;
		fireEvent.change(textarea, { target: { value: "Sample note text" } });
		expect(textarea.value).toBe("Sample note text");
	});
});
