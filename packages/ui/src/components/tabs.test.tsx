/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs Component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders tabs triggers and active content", () => {
		render(
			<Tabs defaultValue="account">
				<TabsList>
					<TabsTrigger value="account">Account</TabsTrigger>
					<TabsTrigger value="password">Password</TabsTrigger>
				</TabsList>
				<TabsContent value="account">Account Settings Panel</TabsContent>
				<TabsContent value="password">Password Panel</TabsContent>
			</Tabs>,
		);

		expect(screen.getByText("Account")).toBeDefined();
		expect(screen.getByText("Password")).toBeDefined();
		expect(screen.getByText("Account Settings Panel")).toBeDefined();
	});
});
