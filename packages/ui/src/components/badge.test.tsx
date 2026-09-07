/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correctly with default styles", () => {
    render(<Badge>Active</Badge>);
    const element = screen.getByText("Active");
    expect(element).toBeDefined();
    expect(element.getAttribute("data-slot")).toBe("badge");
  });

  it("applies secondary variant classes", () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-secondary");
  });
});
