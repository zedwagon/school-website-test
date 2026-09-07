import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

export function VisionSection() {
  return (
    <SectionWrapper bg="background" className="py-0" width="7xl">
      <SectionHeader title="Our Vision" />

      {/* Minimalist Vision Statement Block */}
      <div className="group relative">
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-1 w-16 rounded-full bg-red-600/20" />
          </div>

          <p className="text-lg font-medium text-gray-800 leading-relaxed tracking-tight sm:text-xl lg:text-2xl">
            <span className="font-black text-gray-950">
              Mother Perpetua Parochial School, Inc.
            </span>{" "}
            envisions successful and{" "}
            <span className="font-black text-gray-950">
              globally competent graduates
            </span>{" "}
            equipped with quality education and grounded in{" "}
            <span className="font-black text-red-600">Christian values</span>.
          </p>

          <div className="mt-6 flex justify-center">
            <div className="h-1 w-16 rounded-full bg-red-600/20" />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
