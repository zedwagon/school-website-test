import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { SchoolCalendarSection } from "@/sections/campus-life/SchoolCalendarSection";

export const metadata: Metadata = {
  title: "School Calendar",
  description:
    "Learn more about School Calendar at Mother Perpetua Parochial School Inc.",
};

export default function SchoolCalendarPage() {
  return (
    <>
      <HeroText className="text-center" title="Academic Calendar" />

      <SchoolCalendarSection />
    </>
  );
}
