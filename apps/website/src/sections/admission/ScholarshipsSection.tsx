"use client";

import { Award, BookOpen, GraduationCap, Star, Users } from "lucide-react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";

export function ScholarshipProgramSection() {
  const scholarships = [
    {
      title: "St. Joseph Scholarship",
      reward: "10% Tuition Discount",
      criterion: "GWA of 98% or Higher",
      description:
        "The St. Joseph Scholarship is an academic-based scholarship granted to students who demonstrate outstanding academic achievement, leadership potential, and active involvement in school and community activities. Qualified applicants may receive a 10% tuition fee discount, provided they have a general average of 98% or higher, exemplary conduct, no failing grades, and pass the entrance examination. Applicants must also submit the required supporting documents for evaluation.",
      icon: GraduationCap,
      colorClass: "bg-primary/5 text-primary border-primary/10",
      tagColorClass: "bg-primary/5 text-primary border-primary/10",
    },
    {
      title: "St. Bonaventure Scholarship Program",
      reward: "Free Textbook Use",
      criterion: "Financial Assistance Needs",
      description:
        "Supports academically capable students who face financial challenges by providing them with free use of textbooks for one school year. All borrowed books must be returned in good condition at the end of the school year.",
      icon: BookOpen,
      colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100",
      tagColorClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      title: "St. Sebastian Sports Scholarship",
      reward: "5% to 10% Tuition Discount",
      criterion: "Active School Athletes",
      description:
        "The St. Sebastian Sports Scholarship is a sports-based scholarship designed to support student-athletes who represent MPPSI in recognized competitions and exemplify discipline, teamwork, and sportsmanship. Qualified applicants must be active school athletes with a minimum general average of 85%, good conduct, and no major disciplinary offenses. Eligible students may receive tuition fee discounts ranging from 5% to 10%, depending on the level of competition, subject to the submission of the required supporting documents.",
      icon: Award,
      colorClass: "bg-amber-50 text-amber-600 border-amber-100",
      tagColorClass: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "Siblings Discount Program",
      reward: "5% Tuition Discount",
      criterion: "2 or More Enrolled Siblings",
      description:
        "The Siblings Discount Program is a special benefit offered to families with two (2) or more children enrolled at MPPSI during the same academic year. This program reflects the school's appreciation for the trust and commitment of families who choose MPPSI for their children's education. Qualified students may enjoy a 5% tuition fee discount to help make quality, values-based education more accessible.",
      icon: Users,
      colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
      tagColorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "St. Thomas Discount Program",
      reward: "5% Tuition Discount",
      criterion: "Children of MPPSI Alumni",
      description:
        "The St. Thomas Discount Program is a special benefit for the children of MPPSI alumni, recognizing the continued trust and support of our graduates in the school's mission of providing quality, values-centered education. Qualified students may enjoy a 5% tuition fee discount upon submission of a valid Alumni ID of the parent and compliance with the program requirements.",
      icon: Star,
      colorClass: "bg-purple-50 text-purple-600 border-purple-100",
      tagColorClass: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  return (
    <SectionWrapper
      bg="background"
      className="pt-0 pb-24 text-center"
      width="7xl"
    >
      {/* Grid of Scholarship Cards */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
        {scholarships.map((item, index) => {
          const Icon = item.icon;
          const isFullWidth = index === scholarships.length - 1;

          return (
            <div
              className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-gray-150 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 w-full ${
                isFullWidth ? "md:col-span-2 md:max-w-2xl" : ""
              }`}
              key={index}
            >
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Custom Lucide Icon Medallion */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${item.colorClass}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1 text-left w-full">
                  {/* Reward & Criteria Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${item.tagColorClass}`}
                    >
                      {item.reward}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-50 text-gray-650 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                      {item.criterion}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-extrabold text-gray-800 text-lg sm:text-xl leading-snug tracking-wide group-hover:text-primary transition-colors duration-250 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed text-justify">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
