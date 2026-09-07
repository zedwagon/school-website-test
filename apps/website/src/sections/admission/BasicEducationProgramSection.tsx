"use client";

import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

export function BasicEducationProgramSection() {
  const shsClusters = [
    {
      name: "Arts, Social Sciences & Humanities (ASSH)",
      color: "bg-red-50/60 text-red-700 border-red-100/70",
    },
    {
      name: "Business & Entrepreneurship (BE)",
      color: "bg-red-50/60 text-red-700 border-red-100/70",
    },
    {
      name: "Science, Technology, Engineering & Mathematics (STEM)",
      color: "bg-red-50/60 text-red-700 border-red-100/70",
    },
    {
      name: "Sports, Health & Wellness (SHW)",
      color: "bg-red-50/60 text-red-700 border-red-100/70",
    },
  ];

  return (
    <SectionWrapper
      bg="background"
      className="pt-4 pb-24 text-center"
      width="7xl"
    >
      {/* Section Header */}
      <div className="mb-14">
        <SectionHeader title="Nursery – Grade 12" />
      </div>

      {/* Outer wrapper is just a layout div; only the level cards remain */}
      <div className="mx-auto max-w-4xl space-y-6 text-left">
        {/* Level 1: Early Childhood */}
        <div className="group rounded-3xl border border-gray-150 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-primary/10">
          <div className="space-y-3 w-full">
            <h5 className="font-extrabold text-lg sm:text-xl text-gray-800 transition-colors duration-200 group-hover:text-primary">
              Early Childhood Education
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                "Nursery (Age 3)",
                "Kindergarten 1 (Age 4)",
                "Kindergarten 2 (Age 5)",
              ].map((k, i) => (
                <li
                  className="inline-flex flex-col gap-0.5 text-xs text-gray-650 font-bold bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-3xs"
                  key={i}
                >
                  <span className="flex items-center gap-1.5 text-gray-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {k}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold pl-3">
                    as of October 31
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Level 2: Elementary */}
        <div className="group rounded-3xl border border-gray-150 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-indigo-200">
          <div>
            <h5 className="font-extrabold text-lg sm:text-xl text-gray-800 transition-colors duration-200 group-hover:text-indigo-650">
              Elementary{" "}
              <span className="text-gray-450 font-bold ml-1 text-sm sm:text-base">
                (Grades 1–6)
              </span>
            </h5>
          </div>
        </div>

        {/* Level 3: Junior High */}
        <div className="group rounded-3xl border border-gray-150 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-emerald-200">
          <div>
            <h5 className="font-extrabold text-lg sm:text-xl text-gray-800 transition-colors duration-200 group-hover:text-emerald-650">
              Junior High School{" "}
              <span className="text-gray-450 font-bold ml-1 text-sm sm:text-base">
                (Grades 7–10)
              </span>
            </h5>
          </div>
        </div>

        {/* Level 4: Senior High */}
        <div className="group rounded-3xl border border-gray-150 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-purple-200">
          <div className="space-y-4 w-full">
            <h5 className="font-extrabold text-lg sm:text-xl text-gray-800 transition-colors duration-200 group-hover:text-purple-650">
              Senior High School{" "}
              <span className="text-gray-450 font-bold ml-1 text-sm sm:text-base">
                (Grades 11–12)
              </span>
            </h5>
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Specialized Academic Clusters
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shsClusters.map((cluster, i) => (
                  <div
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${cluster.color} hover:shadow-2xs transition-all duration-200`}
                    key={i}
                  >
                    <span className="mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-black border">
                      ✓
                    </span>
                    <span className="text-xs sm:text-sm font-bold leading-normal">
                      {cluster.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
