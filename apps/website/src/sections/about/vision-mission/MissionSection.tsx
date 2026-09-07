import { Cross, Globe2, Lightbulb, Rocket } from "lucide-react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

export function MissionSection() {
  const missions = [
    {
      icon: Lightbulb,
      title: "Holistic Formation",
      text: (
        <>
          Enhance instruction through{" "}
          <span className="font-bold text-gray-900">innovative trends</span> in
          technology to create a learning environment suitable for{" "}
          <span className="font-bold text-amber-600">holistic formation</span>.
        </>
      ),
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      icon: Cross,
      title: "Christian Values",
      text: (
        <>
          Strengthen the <span className="font-bold text-gray-900">faith</span>{" "}
          of learners through{" "}
          <span className="font-bold text-red-600">Christian Doctrine</span> and
          values.
        </>
      ),
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Globe2,
      title: "Social Responsibility",
      text: (
        <>
          Prepare learners for a culture of{" "}
          <span className="font-bold text-gray-900">service</span> and{" "}
          <span className="font-bold text-blue-600">social responsibility</span>{" "}
          within the academe.
        </>
      ),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Rocket,
      title: "Self-Sufficiency",
      text: (
        <>
          Hone their <span className="font-bold text-gray-900">skills</span> to
          achieve{" "}
          <span className="font-bold text-emerald-600">independence</span> and
          self-sufficiency.
        </>
      ),
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <SectionWrapper bg="background" className="py-0" width="7xl">
      <SectionHeader title="Our Mission" />

      {/* Missions Grid - Numbered Feature Layout */}
      <div className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-2">
        {missions.map((mission, idx) => {
          const Icon = mission.icon;
          return (
            <div
              className="group relative flex flex-col gap-6 sm:flex-row sm:items-start"
              key={idx}
            >
              {/* Icon Container */}
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gray-50 text-gray-900 transition-colors group-hover:bg-red-600 group-hover:text-white">
                  <Icon className="h-8 w-8" />
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="mb-2 text-xl font-black text-gray-900">
                  {mission.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {mission.text}
                </p>
                <div className="mt-4 h-1 w-12 rounded-full bg-red-600/10 transition-all group-hover:w-24 group-hover:bg-red-600" />
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
