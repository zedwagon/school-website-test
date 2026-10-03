/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders card with header, content, and footer", () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Card Header Title</CardTitle>
				</CardHeader>
				<CardContent>Card Content Body</CardContent>
				<CardFooter>Card Footer Content</CardFooter>
			</Card>,
		);

		expect(screen.getByText("Card Header Title")).toBeDefined();
		expect(screen.getByText("Card Content Body")).toBeDefined();
		expect(screen.getByText("Card Footer Content")).toBeDefined();
	});
});
