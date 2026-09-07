import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { ScholarshipProgramSection } from "@/sections/admission/ScholarshipsSection";

export const metadata: Metadata = {
  title: "Scholarships",
  description:
    "Learn more about Scholarships at Mother Perpetua Parochial School Inc.",
};

export default function ScholarshipProgramPage() {
  return (
    <>
      <HeroText className="text-center" title="Scholarships" />

      <ScholarshipProgramSection />
    </>
  );
}
