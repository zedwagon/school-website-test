/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders separator correctly", () => {
    const { container } = render(<Separator />);
    const elem = container.firstChild as HTMLElement;
    expect(elem.getAttribute("data-slot")).toBe("separator");
  });
});
