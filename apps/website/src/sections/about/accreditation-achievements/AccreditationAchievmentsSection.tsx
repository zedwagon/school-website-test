"use client";

import { BadgeCheck, Trophy } from "lucide-react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

export function AccreditationAchievementsSection() {
  const recognitions = [
    {
      title: "Elementary Program",
      description: "Fully recognized by the Philippine Government.",
      yearTag: "1992",
    },
    {
      title: "Junior High School (JHS)",
      description: "Fully recognized by the Philippine Government.",
      yearTag: "1995",
    },
    {
      title: "PEAC Certification",
      description:
        "Awarded Level 3 Certification status, signifying top-tier secondary education compliance.",
      yearTag: "2024–2027",
    },
    {
      title: "Senior High School Program",
      description:
        "Granted official government approval for additional academic strands: ABM, STEM, and HUMSS.",
      yearTag: "2025 Strands",
    },
  ];

  const awards = [
    {
      title: "TOP 1 Most Improved BEIS Implementer",
      description:
        "Private School Level – 1st Congressional District (SY 2023–2024, awarded March 7, 2025).",
      yearTag: "Awarded 2025",
    },
    {
      title: "Most Improved LIS Implementer",
      description:
        "Recognized for exceptional data accuracy and administrative efficiency in the Learner Information System (given March 7, 2025).",
      yearTag: "Awarded 2025",
    },
    {
      title: "TOP 1 Private Junior High School",
      description: (
        <>
          Ranked first among all private junior high institutions in the{" "}
          <strong>FIRST CONGRESSIONAL DISTRICT</strong>.
        </>
      ),
      yearTag: "1st District",
    },
    {
      title: "TOP 3 Private Elementary School",
      description: (
        <>
          Ranked third overall among private elementary programs in the{" "}
          <strong>FIRST CONGREGATIONAL DISTRICT</strong>.
        </>
      ),
      yearTag: "1st District",
    },
    {
      title: "TOP 9 Private Elementary Level",
      description: (
        <>
          Ranked ninth among all private elementary schools across the entire{" "}
          <strong>DIVISION CATEGORY</strong>.
        </>
      ),
      yearTag: "Division Level",
    },
  ];

  return (
    <SectionWrapper
      bg="background"
      className="pt-4 pb-24 text-center"
      width="7xl"
    >
      {/* Recognitions & Certifications */}
      <div className="mb-14">
        <SectionHeader title="Recognition & Certifications" />

        <div className="mx-auto grid max-w-5xl gap-6 text-left sm:grid-cols-2">
          {recognitions.map((item, index) => (
            <div
              className="group relative flex flex-col justify-between p-6 rounded-3xl border border-gray-150 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              key={index}
            >
              <div className="flex items-start gap-4">
                {/* governmental badge check icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/10 transition-transform duration-300 group-hover:scale-105">
                  <BadgeCheck className="h-6 w-6" />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h4 className="font-extrabold text-gray-800 text-lg leading-snug tracking-wide group-hover:text-primary transition-colors duration-200">
                      {item.title}
                    </h4>
                    <span className="inline-flex items-center rounded-md bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/10">
                      {item.yearTag}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed text-justify">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Awards & Achievements */}
      <div className="mt-20">
        <SectionHeader title="Awards & Achievements" />

        <div className="mx-auto grid max-w-5xl gap-6 text-left sm:grid-cols-2">
          {awards.map((item, index) => (
            <div
              className="group relative flex flex-col justify-between p-6 rounded-3xl border border-gray-150 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              key={index}
            >
              <div className="flex items-start gap-4">
                {/* gold trophy icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 transition-transform duration-300 group-hover:scale-105">
                  <Trophy className="h-6 w-6" />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h4 className="font-extrabold text-gray-800 text-lg leading-snug tracking-wide group-hover:text-primary transition-colors duration-200">
                      {item.title}
                    </h4>
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
                      {item.yearTag}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed text-justify">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
