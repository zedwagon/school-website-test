import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { NewsEventsSection } from "@/sections/campus-life/NewsEventsSection";

export const metadata: Metadata = {
  title: "News & Events",
  description:
    "Learn more about News & Events at Mother Perpetua Parochial School Inc.",
};

export default function NewsAndEventsPage() {
  return (
    <>
      <HeroText className="text-center" title="News & Events" />

      <NewsEventsSection />
    </>
  );
}
