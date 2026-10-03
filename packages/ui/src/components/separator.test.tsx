/**
 * @vitest-environment jsdom
 */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Separator } from "./separator";

describe("Separator Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders separator correctly", () => {
		const { container } = render(<Separator />);
		const elem = container.firstChild as HTMLElement;
		expect(elem.getAttribute("data-slot")).toBe("separator");
	});
});
