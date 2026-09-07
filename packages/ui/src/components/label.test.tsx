/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Label } from "./label";

describe("Label Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders label text correctly", () => {
    render(<Label htmlFor="input-id">Username</Label>);
    const label = screen.getByText("Username");
    expect(label).toBeDefined();
    expect(label.getAttribute("data-slot")).toBe("label");
  });
});
