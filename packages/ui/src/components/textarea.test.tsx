/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Textarea } from "./textarea";

describe("Textarea Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders textarea correctly", () => {
    render(<Textarea placeholder="Type notes here..." />);
    const textarea = screen.getByPlaceholderText("Type notes here...") as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
    expect(textarea.getAttribute("data-slot")).toBe("textarea");
  });

  it("handles text change", () => {
    render(<Textarea placeholder="Type notes here..." />);
    const textarea = screen.getByPlaceholderText("Type notes here...") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Sample note text" } });
    expect(textarea.value).toBe("Sample note text");
  });
});
