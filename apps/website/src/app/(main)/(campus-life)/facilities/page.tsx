import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { FacilitiesSection } from "@/sections/campus-life/FacilitiesSection";

export const metadata: Metadata = {
  title: "Facilities",
  description:
    "Learn more about Facilities at Mother Perpetua Parochial School Inc.",
};

export default function FacilitiesPage() {
  return (
    <>
      <HeroText className="text-center" title="Campus Facilities" />

      <FacilitiesSection />
    </>
  );
}
