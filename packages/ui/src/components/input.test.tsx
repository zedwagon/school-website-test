/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Input } from "./input";

describe("Input Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correctly", () => {
    render(<Input placeholder="Enter text..." />);
    const element = screen.getByPlaceholderText("Enter text...");
    expect(element).toBeDefined();
    expect(element.getAttribute("data-slot")).toBe("input");
  });

  it("handles user input", () => {
    render(<Input placeholder="Enter text..." />);
    const input = screen.getByPlaceholderText("Enter text...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Hello World" } });
    expect(input.value).toBe("Hello World");
  });
});
