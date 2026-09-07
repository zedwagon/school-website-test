/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

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
      </Tabs>
    );

    expect(screen.getByText("Account")).toBeDefined();
    expect(screen.getByText("Password")).toBeDefined();
    expect(screen.getByText("Account Settings Panel")).toBeDefined();
  });
});
