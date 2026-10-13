/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Select, SelectTrigger, SelectValue } from "./select";

describe("Select Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders select trigger with placeholder value", () => {
		render(
			<Select>
				<SelectTrigger>
					<SelectValue placeholder="Select a role..." />
				</SelectTrigger>
			</Select>,
		);

		expect(screen.getByText("Select a role...")).toBeDefined();
	});
});
