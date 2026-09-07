import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@school/ui";
import Link from "next/link";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

const faqs = [
  {
    question: "What programs does MPPSI offer?",
    answer:
      "Mother Perpetua Parochial School Inc. provides a complete Basic Education Program from Kindergarten to Grade 12, along with a wide range of scholarship opportunities.",
  },
  {
    question: "How can I apply for admission?",
    answer:
      "Interested applicants may visit the school’s Admission Office to obtain and submit an application form. They may also reach out through the school’s official website or social media pages for enrollment schedules and detailed application procedures.",
  },
  {
    question: "What documents are required for admission?",
    answer:
      "Applicants are generally required to submit a completed application form, recent report card, birth certificate, and other necessary documents as specified by the Admission Office. Depending on the grade level, an entrance exam or interview may also be part of the process.",
  },
  {
    question: "Are scholarship opportunities available?",
    answer:
      "Yes. MPPSI offers various scholarship programs designed to support and recognize deserving students, including Entrance, Sports, and Academic Scholarships, the St. Bonaventure Grant-in-Aid Program, and special discounts for alumni and Lyre Band members.",
  },
];

export function FaqSection() {
  return (
    <SectionWrapper bg="background" padding="py-16 sm:py-20" width="4xl">
      <SectionHeader
        subtitle="Find quick answers to the most common inquiries about MPPSI."
        title="Frequently Asked Questions"
      />

      <Accordion
        className="mt-12 w-full overflow-hidden rounded-xl border border-border"
        collapsible
        defaultValue="item-1"
        type="single"
      >
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger className="cursor-pointer px-4 py-3 text-left font-semibold text-foreground text-lg transition-colors hover:text-primary sm:px-6 sm:py-4 sm:text-xl">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-justify text-muted-foreground leading-relaxed sm:px-6 sm:pb-6">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Contact link at the bottom */}
      <div className="mt-10 text-center">
        <Link href="/contact">
          <Button
            className="cursor-pointer px-6 py-3 text-base sm:text-lg"
            variant="outline"
          >
            Have more questions? Contact us
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
