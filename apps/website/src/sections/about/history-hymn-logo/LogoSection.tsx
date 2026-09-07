"use client";

import {
  Bird,
  BookOpen,
  Flame,
  Heart,
  HelpingHand,
  Shield,
  Sun,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "../../../components/section-header";

interface LogoMeaning {
  badgeBg: string;
  borderColor: string;
  color: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const logoMeanings: LogoMeaning[] = [
  {
    title: "AMOR SAPIENTIAE",
    description:
      'Latin for "Love of Wisdom" — representing the primary intellectual and spiritual motivation that guides students in their pursuit of truth and learning.',
    color: "from-red-500/[0.06] to-red-500/[0.02]",
    borderColor: "border-red-500/30",
    badgeBg: "bg-red-50 text-red-655 border-red-155",
    icon: Heart,
  },
  {
    title: "DOVE",
    description:
      "Connotes deep peace and the guidance of the Holy Spirit, steering every learner toward the correct and moral path of active learning.",
    color: "from-blue-500/[0.06] to-blue-500/[0.02]",
    borderColor: "border-blue-500/30",
    badgeBg: "bg-blue-50 text-blue-655 border-blue-155",
    icon: Bird,
  },
  {
    title: "TORCH",
    description:
      "Signifies hope, passion, and spiritual inspiration, lighting the path for students to successfully navigate their dreams and future careers.",
    color: "from-amber-500/[0.06] to-amber-500/[0.02]",
    borderColor: "border-amber-500/30",
    badgeBg: "bg-amber-50 text-amber-655 border-amber-155",
    icon: Flame,
  },
  {
    title: "THE HANDS",
    description:
      "Symbolize the loving, expert hands of the administrators, teachers, and personnel who mold students to become active, compassionate citizens.",
    color: "from-emerald-500/[0.06] to-emerald-500/[0.02]",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-50 text-emerald-655 border-emerald-155",
    icon: HelpingHand,
  },
  {
    title: "RAYS AROUND THE TORCH",
    description:
      "Radiate critical knowledge, creativity, and intellectual wisdom gained through constant effort, self-study, and classroom discovery.",
    color: "from-orange-500/[0.06] to-orange-500/[0.02]",
    borderColor: "border-orange-500/30",
    badgeBg: "bg-orange-50 text-orange-655 border-orange-155",
    icon: Sun,
  },
  {
    title: "RED-COLORED SCALLOPS",
    description:
      "Symbolize absolute unity, strong collaboration, and camaraderie among school administrators, teachers, students, and supportive parents.",
    color: "from-rose-600/[0.06] to-rose-600/[0.02]",
    borderColor: "border-rose-600/30",
    badgeBg: "bg-rose-50 text-rose-655 border-rose-155",
    icon: Shield,
  },
  {
    title: "BOOK",
    description:
      "Symbolizes comprehensive academic knowledge and wisdom needed for lifelong learning, guided by faith and spiritual discernment.",
    color: "from-purple-500/[0.06] to-purple-500/[0.02]",
    borderColor: "border-purple-500/30",
    badgeBg: "bg-purple-50 text-purple-650 border-purple-150",
    icon: BookOpen,
  },
];

export function LogoSection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <SectionWrapper bg="background" className="text-center pb-20" width="7xl">
      <SectionHeader title="The Meaning of the School Seal" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-12 text-left">
        {/* Left Column: Sticky Medallion Logo (Floating Showcase) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col items-center justify-center text-center py-4">
          <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-primary/[0.02] to-primary/[0.08] p-6 shadow-inner border border-primary/5 sm:h-80 sm:w-80 md:h-96 md:w-96 transition-all duration-500 hover:scale-[1.03]">
            <div className="relative h-full w-full">
              <Image
                alt="MPPSI Logo"
                fill
                priority
                sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
                src="/logo.webp"
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          <div className="mt-8 max-w-sm hidden lg:block">
            <h5 className="font-extrabold text-gray-800 text-lg">
              Mother Perpetua Parochial School
            </h5>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Our official seal is a rich visual tapestry of faith, hope,
              wisdom, and community, designed to reflect our core Catholic
              educational values.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Accordion Stack */}
        <div className="lg:col-span-7 space-y-3">
          {logoMeanings.map((item, idx) => {
            const Icon = item.icon;
            const isOpen = activeIndex === idx;
            return (
              <div
                className={`group rounded-2xl border transition-all duration-300 cursor-pointer p-4 ${
                  isOpen
                    ? `border-gray-250 bg-gradient-to-br shadow-sm ${item.color} ${item.borderColor}`
                    : "border-transparent bg-transparent hover:border-gray-250 hover:bg-gray-50/50"
                }`}
                key={idx}
                onClick={() => setActiveIndex(idx)}
              >
                {/* Header */}
                <div className="flex items-center gap-4">
                  {/* Icon badge */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${item.badgeBg} transition-transform duration-300 ${isOpen ? "scale-105" : "group-hover:scale-105"}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Title */}
                  <div className="flex flex-1 items-center justify-between">
                    <h4
                      className={`font-extrabold text-base sm:text-lg tracking-wide uppercase transition-colors duration-200 ${isOpen ? "text-primary" : "text-gray-800 group-hover:text-primary"}`}
                    >
                      {item.title}
                    </h4>

                    {/* Accordion indicator arrow */}
                    <span
                      className={`text-gray-400 font-bold transition-transform duration-300 text-sm ${isOpen ? "rotate-90 text-primary" : ""}`}
                    >
                      ❯
                    </span>
                  </div>
                </div>

                {/* Animated Description Body */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-justify text-base text-gray-600 leading-relaxed sm:text-lg pl-16">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
