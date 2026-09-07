import type { Metadata } from "next";

import { HeroText } from "@/components/HeroText";
import { BoardOfTrusteesSection } from "@/sections/about/board-of-trustees/BoardOfTrusteesSection";

export const metadata: Metadata = {
  title: "Board of Trustees",
  description:
    "Learn more about Board of Trustees at Mother Perpetua Parochial School Inc.",
};

export default function BoardOfTrusteesPage() {
  return (
    <div>
      <HeroText className="text-center" title="Our Board of Trustees" />

      <BoardOfTrusteesSection />
    </div>
  );
}
