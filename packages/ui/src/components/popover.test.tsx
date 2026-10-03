/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders popover trigger and content", () => {
		render(
			<Popover open={true}>
				<PopoverTrigger>Open Popover</PopoverTrigger>
				<PopoverContent>Popover Details</PopoverContent>
			</Popover>,
		);

		expect(screen.getByText("Open Popover")).toBeDefined();
		expect(screen.getByText("Popover Details")).toBeDefined();
	});
});
