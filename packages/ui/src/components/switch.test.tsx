/**
 * @vitest-environment jsdom
 */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Switch } from "./switch";

describe("Switch Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders switch element", () => {
		const { container } = render(<Switch aria-label="Toggle notifications" />);
		const switchElem = container.querySelector('[data-slot="switch"]');
		expect(switchElem).toBeDefined();
	});
});
