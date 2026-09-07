/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

import { Toaster } from "./sonner";

describe("Sonner Toaster Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders toaster container", () => {
    const { container } = render(<Toaster />);
    expect(container).toBeDefined();
  });
});
