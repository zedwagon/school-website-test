/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
  usePathname: vi.fn().mockReturnValue("/dashboard"),
  useSearchParams: vi.fn().mockReturnValue({ toString: () => "" }),
}));

import { Pagination } from "./pagination";

describe("Pagination Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders page text and page buttons", () => {
    render(<Pagination currentPage={1} totalPages={5} />);
    expect(screen.getByText("Page 1 of 5")).toBeDefined();
  });
});
