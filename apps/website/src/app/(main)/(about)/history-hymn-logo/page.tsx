import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { HymnSection } from "@/sections/about/history-hymn-logo/HymnSection";
import { LogoSection } from "@/sections/about/history-hymn-logo/LogoSection";
import { MilestonesSection } from "@/sections/about/history-hymn-logo/MilestoneSection";

export const metadata: Metadata = {
  title: "History, Hymn, & Logo",
  description:
    "Learn more about History, Hymn, & Logo at Mother Perpetua Parochial School Inc.",
};

export default function HistoryHymnLogoPage() {
  return (
    <div>
      {/* Intro Section */}
      <HeroText className="text-center" title="Our History, Hymn & Logo" />

      <MilestonesSection />
      <HymnSection />
      <LogoSection />
    </div>
  );
}
