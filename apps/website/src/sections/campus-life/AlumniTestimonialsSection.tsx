import { GraduationCap, Quote, School } from "lucide-react";
import Image from "next/image";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { testimonials } from "./testimonials";

// Helper to highlight key quotes inside paragraphs without altering static data
function highlightQuote(text: string, index: number) {
  if (index === 0) {
    const quote =
      "MPPSI became the guiding light that led me to the right path.";
    if (text.includes(quote)) {
      const parts = text.split(quote);
      return (
        <>
          {parts[0]}
          <strong className="text-primary font-bold bg-primary/5 px-1 py-0.5 rounded select-none">
            {quote}
          </strong>
          {parts[1]}
        </>
      );
    }
  } else if (index === 1) {
    const quoteText =
      "It was truly a blessing and a life-changing opportunity when I became one of the scholars of Mother Perpetua Parochial School, Inc. (MPPSI).";
    if (text.includes(quoteText)) {
      const parts = text.split(quoteText);
      return (
        <>
          {parts[0]}
          <strong className="text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded select-none">
            {quoteText}
          </strong>
          {parts[1]}
        </>
      );
    }
  }
  return text;
}

export function AlumniTestimonialsSection() {
  return (
    <SectionWrapper bg="background" padding="pt-6 pb-20" width="7xl">
      <div className="mx-auto flex max-w-6xl flex-col">
        {testimonials.map((item, index) => {
          const isEven = index % 2 === 0;

          // Dedicated metadata for our alumni
          const graduationInfo =
            index === 0
              ? {
                  class: "Pioneer SHS Class of 2015",
                  role: "Current MPPSI Faculty",
                }
              : { class: "Scholar Alumnus", role: "Current MPPSI Faculty" };

          return (
            <div className="w-full" key={index}>
              {/* Story Block Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                {/* Portrait & Credentials Column */}
                <div
                  className={`w-full lg:col-span-4 flex flex-col items-center text-center lg:text-left lg:items-start lg:sticky lg:top-12 flex-shrink-0 ${
                    isEven ? "order-1" : "order-1 lg:order-2"
                  }`}
                >
                  <div className="relative group w-44 aspect-[3/4] sm:w-48 md:w-52 lg:w-full lg:max-w-[280px] rounded-2xl overflow-hidden shadow-md border-2 border-gray-100 bg-gray-50 mx-auto lg:mx-0">
                    {/* Glowing Accent Halos */}
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                    <Image
                      alt={item.name}
                      className="object-cover object-top transition-transform duration-75 group-hover:scale-103"
                      fill
                      sizes="(max-width: 1024px) 208px, 320px"
                      src={item.photo}
                    />
                  </div>

                  {/* Name & Credentials */}
                  <h3 className="mt-6 text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    {item.name}
                  </h3>

                  <div className="mt-3.5 flex flex-col gap-2 w-full items-center lg:items-start">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                      <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                      {graduationInfo.class}
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-700">
                      <School className="h-3.5 w-3.5 flex-shrink-0" />
                      {graduationInfo.role}
                    </div>
                  </div>

                  {/* Beautiful Pull Quote in the Sidebar */}
                  <div className="relative mt-8 hidden lg:block rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                    <Quote className="absolute -top-3 -left-2 h-8 w-8 text-primary/10" />
                    <p className="font-serif text-sm font-bold leading-relaxed text-gray-900 italic">
                      “{item.highlight}”
                    </p>
                  </div>
                </div>

                {/* Narrative Text Column */}
                <div
                  className={`w-full lg:col-span-8 flex flex-col ${
                    isEven ? "order-2" : "order-2 lg:order-1"
                  }`}
                >
                  {/* Mobile-only highlight block */}
                  <div className="relative mb-6 block lg:hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                    <Quote className="absolute -top-3 -left-2 h-8 w-8 text-primary/10" />
                    <p className="font-serif text-base font-bold leading-relaxed text-gray-900 italic">
                      “{item.highlight}”
                    </p>
                  </div>

                  {/* Body Paragraphs */}
                  <div className="space-y-6 text-gray-600 text-justify">
                    {item.full.split("\n\n").map((para, i) => {
                      const renderedContent = highlightQuote(para, index);

                      return (
                        <p
                          className="text-justify text-base leading-relaxed md:text-lg"
                          key={i}
                        >
                          {i === 0 ? (
                            // Premium Drop Cap on the leading character
                            <>
                              <span className="float-left mr-2.5 text-5xl font-black leading-[0.8] text-primary mt-1 font-serif select-none">
                                {para.charAt(0)}
                              </span>
                              {index === 0
                                ? highlightQuote(para.slice(1), index)
                                : para.slice(1)}
                            </>
                          ) : (
                            renderedContent
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Decorative Divider between alumni stories */}
              {isEven && (
                <div className="w-full my-16 md:my-20 flex justify-center">
                  <div className="h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
