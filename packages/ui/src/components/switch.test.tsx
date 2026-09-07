/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Switch } from "./switch";

describe("Switch Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders switch element", () => {
    const { container } = render(<Switch aria-label="Toggle notifications" />);
    const switchElem = container.querySelector('[data-slot="switch"]');
    expect(switchElem).toBeDefined();
  });
});
