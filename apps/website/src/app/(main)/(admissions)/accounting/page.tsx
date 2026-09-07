import type { Metadata } from "next";
import { HeroText } from "@/components/HeroText";
import { AccountingSection } from "@/sections/admission/AccountingSection";

export const metadata: Metadata = {
  title: "Accounting & Fees",
  description:
    "Learn more about Accounting & Fees at Mother Perpetua Parochial School Inc.",
};

export default function AccountingPage() {
  return (
    <>
      <HeroText className="text-center" title="Accounting" />

      <AccountingSection />
    </>
  );
}
