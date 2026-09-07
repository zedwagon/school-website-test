import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { BasicEducationProgramSection } from "@/sections/admission/BasicEducationProgramSection";

export const metadata: Metadata = {
  title: "Basic Education Program",
  description:
    "Learn more about Basic Education Program at Mother Perpetua Parochial School Inc.",
};

export default function BasicEducationPage() {
  return (
    <>
      <HeroText className="text-center" title="Basic Education Program" />

      <BasicEducationProgramSection />
    </>
  );
}
