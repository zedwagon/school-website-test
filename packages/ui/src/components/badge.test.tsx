/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders correctly with default styles", () => {
		render(<Badge>Active</Badge>);
		const element = screen.getByText("Active");
		expect(element).toBeDefined();
		expect(element.getAttribute("data-slot")).toBe("badge");
	});

	it("applies secondary variant classes", () => {
		const { container } = render(<Badge variant="secondary">Secondary</Badge>);
		expect((container.firstChild as HTMLElement).className).toContain(
			"bg-secondary",
		);
	});
});
