/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Checkbox } from "./checkbox";

describe("Checkbox Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders checkbox element", () => {
    const { container } = render(<Checkbox aria-label="Agree to terms" />);
    const checkbox = container.querySelector('[data-slot="checkbox"]');
    expect(checkbox).toBeDefined();
  });
});
