import { CTASection } from "@/components/cta-section";
import { DirectorsMessageSection } from "@/sections/home/DirectorsMessageSection";
import { FaqSection } from "@/sections/home/FaqSection";
import { HeroSection } from "@/sections/home/HeroSection";
import { QualityEducationSection } from "@/sections/home/QualityEducationSection";
import { WhyChooseUsSection } from "@/sections/home/WhyChooseUsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DirectorsMessageSection />
      <WhyChooseUsSection />
      <QualityEducationSection />
      <FaqSection />
      <CTASection
        primaryButtonHref="/registrar"
        primaryButtonText="Apply Now"
        secondaryButtonHref="/contact"
        secondaryButtonText="Contact Us"
        subtitle="Partner with us in shaping your child’s future. Apply online or reach out to learn more about our programs and enrollment process."
        title="Ready to Enroll at MPPSI?"
      />
    </>
  );
}
