/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";

describe("Accordion Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accordion item and trigger", () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes. It adheres to WAI-ARIA standards.</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText("Is it accessible?")).toBeDefined();
  });
});
