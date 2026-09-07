import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { CoreValuesSection } from "@/sections/about/vision-mission/CoreValuesSection";
import { MissionSection } from "@/sections/about/vision-mission/MissionSection";
import { PhilosophySection } from "@/sections/about/vision-mission/PhilosophySection";
import { VisionSection } from "@/sections/about/vision-mission/VisionSection";

export const metadata: Metadata = {
  title: "Vision & Mission",
  description:
    "Learn more about Vision & Mission at Mother Perpetua Parochial School Inc.",
};

export default function VisionMissionPage() {
  return (
    <>
      <HeroText
        className="text-center"
        title="Shaping Minds, Building Values"
      />

      <PhilosophySection />
      <VisionSection />
      <MissionSection />
      <CoreValuesSection />
    </>
  );
}
