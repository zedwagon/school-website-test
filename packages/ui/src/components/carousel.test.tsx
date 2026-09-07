/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), { on: vi.fn(), off: vi.fn(), canScrollPrev: () => false, canScrollNext: () => true }],
}));

import { Carousel, CarouselContent, CarouselItem } from "./carousel";

describe("Carousel Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders carousel items", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(screen.getByText("Slide 1")).toBeDefined();
    expect(screen.getByText("Slide 2")).toBeDefined();
  });
});
