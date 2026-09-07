/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Avatar, AvatarFallback } from "./avatar";

describe("Avatar Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders avatar fallback content", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("JD")).toBeDefined();
  });
});
