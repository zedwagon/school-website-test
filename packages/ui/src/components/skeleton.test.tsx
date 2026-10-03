/**
 * @vitest-environment jsdom
 */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders skeleton placeholder", () => {
		const { container } = render(<Skeleton className="h-4 w-20" />);
		const elem = container.firstChild as HTMLElement;
		expect(elem.getAttribute("data-slot")).toBe("skeleton");
		expect(elem.className).toContain("animate-pulse");
	});
});
