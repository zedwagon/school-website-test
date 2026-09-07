/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Button } from "./button";

describe("Button Component", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("handles click events", () => {
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(clicked).toBe(true);
  });

  it("applies variant classes", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-destructive");
  });
});
