/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

describe("Popover Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders popover trigger and content", () => {
    render(
      <Popover open={true}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Details</PopoverContent>
      </Popover>
    );

    expect(screen.getByText("Open Popover")).toBeDefined();
    expect(screen.getByText("Popover Details")).toBeDefined();
  });
});
