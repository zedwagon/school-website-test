import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { RegistrarSection } from "@/sections/admission/RegistrarSection";

export const metadata: Metadata = {
  title: "Registrar & Admissions",
  description:
    "Learn more about Registrar & Admissions at Mother Perpetua Parochial School Inc.",
};

export default function RegistrarPage() {
  return (
    <>
      <HeroText className="text-center" title="Registrar" />

      <RegistrarSection />
    </>
  );
}
