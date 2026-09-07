/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Calendar } from "./calendar";

describe("Calendar Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders calendar container", () => {
    const { container } = render(<Calendar mode="single" selected={new Date()} />);
    const calendarElem = container.querySelector('[data-slot="calendar"]');
    expect(calendarElem).toBeDefined();
  });
});
