/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "./dialog";

describe("Dialog Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders open dialog content", () => {
		render(
			<Dialog open={true}>
				<DialogTrigger>Open Modal</DialogTrigger>
				<DialogContent>
					<DialogTitle>Modal Title</DialogTitle>
					<DialogDescription>Modal Description</DialogDescription>
				</DialogContent>
			</Dialog>,
		);

		expect(screen.getByText("Modal Title")).toBeDefined();
		expect(screen.getByText("Modal Description")).toBeDefined();
	});
});
