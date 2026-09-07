import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { AlumniTestimonialsSection } from "@/sections/campus-life/AlumniTestimonialsSection";

export const metadata: Metadata = {
  title: "Alumni Testimonials",
  description:
    "Learn more about Alumni Testimonials at Mother Perpetua Parochial School Inc.",
};

export default function AlumniTestimonialsPage() {
  return (
    <>
      <HeroText className="text-center" title="Alumni Testimonials" />

      <AlumniTestimonialsSection />
    </>
  );
}
