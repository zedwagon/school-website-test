import type { Metadata } from "next";
import { CTASection } from "@/components/cta-section";
import { HeroText } from "@/components/HeroText";
import { ContactSection } from "@/sections/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Learn more about Contact Us at Mother Perpetua Parochial School Inc.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroText title="Contact Us" />

      <ContactSection />
      <CTASection
        primaryButtonHref="tel:+63427319482"
        primaryButtonText="Call to Schedule"
        secondaryButtonHref="mailto:motherperpetua_mauban@yahoo.com"
        secondaryButtonText="Email Admissions"
        subtitle="Experience MPPSI Inc firsthand with a personalized campus tour"
        title="Schedule a Campus Visit"
      />
    </div>
  );
}
