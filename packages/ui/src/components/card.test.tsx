/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";

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
      </Card>
    );

    expect(screen.getByText("Card Header Title")).toBeDefined();
    expect(screen.getByText("Card Content Body")).toBeDefined();
    expect(screen.getByText("Card Footer Content")).toBeDefined();
  });
});
