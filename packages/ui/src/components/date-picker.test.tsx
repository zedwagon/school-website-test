/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DatePicker } from "./date-picker";

describe("DatePicker Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders trigger button with placeholder", () => {
    render(<DatePicker placeholder="Select Birthdate" />);
    expect(screen.getByText("Select Birthdate")).toBeDefined();
  });
});
