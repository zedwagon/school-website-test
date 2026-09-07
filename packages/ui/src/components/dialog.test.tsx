/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "./dialog";

describe("Dialog Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders open dialog content", () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>Open Modal</DialogTrigger>
        <DialogContent>
          <DialogTitle>Modal Title</DialogTitle>
          <DialogDescription>Modal Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Modal Title")).toBeDefined();
    expect(screen.getByText("Modal Description")).toBeDefined();
  });
});
