/**
 * @vitest-environment jsdom
 */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({
	useTheme: () => ({ theme: "light" }),
}));

import { Toaster } from "./sonner";

describe("Sonner Toaster Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders toaster container", () => {
		const { container } = render(<Toaster />);
		expect(container).toBeDefined();
	});
});
