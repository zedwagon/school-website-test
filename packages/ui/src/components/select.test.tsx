/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue } from "./select";

describe("Select Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders select trigger with placeholder value", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a role..." />
        </SelectTrigger>
      </Select>
    );

    expect(screen.getByText("Select a role...")).toBeDefined();
  });
});
