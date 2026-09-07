import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { AccreditationAchievementsSection } from "@/sections/about/accreditation-achievements/AccreditationAchievmentsSection";

export const metadata: Metadata = {
  title: "Accreditation & Achievements",
  description:
    "Learn more about Accreditation & Achievements at Mother Perpetua Parochial School Inc.",
};

export default function VisionMissionPage() {
  return (
    <>
      <HeroText
        className="text-center"
        title="Accreditation and Achievements"
      />

      <AccreditationAchievementsSection />
    </>
  );
}
