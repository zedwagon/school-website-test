/**
 * @vitest-environment jsdom
 */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Calendar } from "./calendar";

describe("Calendar Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders calendar container", () => {
		const { container } = render(
			<Calendar mode="single" selected={new Date()} />,
		);
		const calendarElem = container.querySelector('[data-slot="calendar"]');
		expect(calendarElem).toBeDefined();
	});
});
