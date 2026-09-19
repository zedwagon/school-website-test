/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Spinner } from "./spinner";

describe("Spinner Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders spinner SVG with loading status", () => {
		render(<Spinner />);
		const spinner = screen.getByRole("status");
		expect(spinner).toBeDefined();
	});
});
