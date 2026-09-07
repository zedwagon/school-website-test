import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { OrganizationsSection } from "@/sections/campus-life/OrganizationsSection";

export const metadata: Metadata = {
  title: "Organizations",
  description:
    "Learn more about Organizations at Mother Perpetua Parochial School Inc.",
};

export default function OrganizationsPage() {
  return (
    <>
      <HeroText className="text-center" title="Our Organizations" />

      <OrganizationsSection />
    </>
  );
}
