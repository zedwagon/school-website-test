/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AccountingError from "./error";
import WebsiteError from "../../../website/src/app/error";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe.each([["accounting", AccountingError], ["website", WebsiteError]])("%s recovery screen", (_name, ErrorPage) => {
  it("shows a safe message and retries the page, not the last mutation", () => {
    const reset = vi.fn();
    render(<ErrorPage reset={reset} />);
    expect(screen.getByRole("alert").textContent).toContain("temporarily unavailable");
    expect(screen.getByRole("alert").textContent).toContain("check whether it was saved");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
    expect(reset).toHaveBeenCalledOnce();
  });
});
