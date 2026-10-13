/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar, AvatarFallback } from "./avatar";

describe("Avatar Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders avatar fallback content", () => {
		render(
			<Avatar>
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>,
		);
		expect(screen.getByText("JD")).toBeDefined();
	});
});
