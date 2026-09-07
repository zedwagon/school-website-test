import type { Metadata } from "next";

import { HeroText } from "@/components/HeroText";
import { AdministrationFacultySections } from "@/sections/about/administration-faculty/AdministrationFacultySections";

export const metadata: Metadata = {
  title: "Administration & Faculty",
  description:
    "Learn more about Administration & Faculty at Mother Perpetua Parochial School Inc.",
};

export default function AdministrationFacultyPage() {
  return (
    <div>
      <HeroText className="text-center" title="Our Administration & Faculty" />

      <AdministrationFacultySections />
    </div>
  );
}
