/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Spinner } from "./spinner";

describe("Spinner Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders spinner SVG with loading status", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeDefined();
  });
});
