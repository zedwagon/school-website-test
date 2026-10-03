/**
 * @vitest-environment jsdom
 */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders checkbox element", () => {
		const { container } = render(<Checkbox aria-label="Agree to terms" />);
		const checkbox = container.querySelector('[data-slot="checkbox"]');
		expect(checkbox).toBeDefined();
	});
});
