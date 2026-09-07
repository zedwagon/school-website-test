"use client";

import { HandHelping, Heart, Sprout, Users, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";
import { cn } from "@/lib/utils";

const values = [
  {
    letter: "M",
    title: "Mindful",
    icon: Sprout,
    description:
      "Perpetuans embrace mindfulness as one of their core values, recognizing its profound impact on personal growth, academic excellence, and overall well-being. Mindfulness refers to the practice of being fully present and aware of one's thoughts, emotions, and experiences without judgment. It involves living in the present moment and accepting things as they are.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    letter: "P",
    title: "Prayerful",
    icon: Heart,
    description:
      "Perpetuans hold the core value of prayerfulness in high regard as an integral aspect of their educational journey and personal development. Prayerfulness encompasses a deep and sincere commitment to maintaining a strong spiritual connection with God, nurturing a sense of mindfulness, and fostering an attitude of gratitude and humility.",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    letter: "P",
    title: "Passionate",
    icon: Zap,
    description:
      "Perpetuans embody the core value of passion in all aspects of their educational journey. Passion is the driving force that fuels their pursuit of knowledge, personal growth, and societal contributions. It serves as a guiding principle that shapes their attitudes, actions, and aspirations, making them resilient and dedicated learners.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    letter: "S",
    title: "Solidarity",
    icon: HandHelping,
    description:
      "Perpetuans hold the core value of solidarity as a guiding principle in their academic and personal lives. Solidarity is the deep sense of unity, support, and cooperation among members of the Perpetuan community. It goes beyond mere tolerance and inclusivity; instead, it emphasizes actively standing together and assisting one another in times of need, celebrating each other’s successes, and recognizing the value of diversity.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    letter: "I",
    title: "Inclusivity",
    icon: Users,
    description:
      "Perpetuans value inclusivity as a key principle that helps create a welcoming and respectful community for everyone. Inclusivity means recognizing, valuing, and celebrating diversity in all its forms, whether in culture, beliefs, abilities, or perspectives. It promotes the creation of safe spaces where everyone feels accepted, heard, and empowered to make meaningful contributions. By practicing empathy, openness, and mutual respect, Perpetuans foster an environment where differences are acknowledged and appreciated as strengths that enhance the community.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

export function CoreValuesSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Lock body scroll when immersive view is active
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeIndex]);

  return (
    <SectionWrapper bg="background" className="py-0" width="7xl">
      <SectionHeader title="Our Core Values" />

      <div className="relative">
        <div className="mx-auto grid max-w-xs grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-5 lg:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <button
                className="group relative flex cursor-pointer flex-col items-center rounded-[2rem] p-6 transition-all hover:bg-gray-50"
                key={value.title}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                {/* Colored Icon Container */}
                <div
                  className={cn(
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-[1.2rem] shadow-sm transition-transform",
                    value.bgColor,
                    value.color,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Giant Letter */}
                <span
                  className={cn("font-black text-6xl lg:text-7xl", value.color)}
                >
                  {value.letter}
                </span>

                {/* Title */}
                <span className="mt-4 block text-xs font-black uppercase tracking-[0.4em] text-gray-900">
                  {value.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Focus View: Immersive Editorial Takeover */}
        {activeIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 lg:p-12">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-white/80 backdrop-blur-2xl animate-in fade-in duration-500"
              onClick={() => setActiveIndex(null)}
            />

            {/* Content Spread */}
            <div className="relative flex h-[80vh] max-h-[600px] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-500 lg:h-[500px] lg:max-h-[500px] lg:flex-row sm:rounded-[3rem]">
              {/* Close Button - Floating at the top-right of the entire modal */}
              <button
                className="absolute right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-gray-400 backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-600 hover:rotate-90 shadow-md shadow-black/5"
                onClick={() => setActiveIndex(null)}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Branding Panel (Left/Top) */}
              <div
                className={cn(
                  "relative flex shrink-0 flex-col items-start justify-center p-8 text-left lg:h-full lg:w-[38%] lg:p-10",
                  values[activeIndex].bgColor,
                )}
              >
                {/* Ghost Letter */}
                <span
                  className={cn(
                    "absolute -bottom-6 -left-6 select-none font-black text-[8rem] leading-none opacity-5 lg:text-[14rem]",
                    values[activeIndex].color,
                  )}
                >
                  {values[activeIndex].letter}
                </span>

                <div className="relative z-10 w-full">
                  <div
                    className={cn(
                      "mb-4 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white shadow-xl shadow-current/10 transition-transform hover:rotate-6 sm:h-16 sm:w-16 sm:rounded-[1.2rem]",
                      values[activeIndex].color,
                    )}
                  >
                    {(() => {
                      const Icon = values[activeIndex].icon;
                      return <Icon className="h-6 w-6 sm:h-8 sm:w-8" />;
                    })()}
                  </div>

                  <h3 className="mb-3 text-3xl font-black tracking-tighter text-gray-950 sm:text-4xl lg:text-5xl">
                    {values[activeIndex].title}
                  </h3>

                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-red-600">
                    <div className="h-1 w-8 rounded-full bg-red-600" />
                    Core Value {values[activeIndex].letter}
                  </div>
                </div>
              </div>

              {/* Description Content (Right/Bottom) */}
              <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
                {/* Scrollable Text Area */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-8 scrollbar-hide sm:p-10 lg:p-12">
                  <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center">
                    <p className="text-base font-normal leading-relaxed text-gray-600 lg:text-lg lg:leading-[1.75]">
                      {values[activeIndex].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
