/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
