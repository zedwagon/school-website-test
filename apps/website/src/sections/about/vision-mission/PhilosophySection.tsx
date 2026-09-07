import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

export function PhilosophySection() {
  return (
    <SectionWrapper bg="background" className="py-0" width="4xl">
      <SectionHeader title="Our Philosophy" />

      {/* Philosophy Content - Clean Typography Layout */}
      <div className="space-y-16 sm:space-y-20">
        {/* Statement 1 */}
        <div className="group relative">
          <div className="relative pl-8 sm:pl-12">
            <div className="absolute left-0 top-0 h-full w-1.5 rounded-full bg-red-600/10 transition-colors group-hover:bg-red-600" />
            <p className="text-lg text-gray-700 leading-relaxed sm:text-xl lg:text-2xl">
              Fostering{" "}
              <span className="font-black text-red-600">
                Catholic education
              </span>{" "}
              leads to human formation and helps share the Church&apos;s
              mission.
            </p>
          </div>
        </div>

        {/* Statement 2 */}
        <div className="group relative">
          <div className="relative pl-8 sm:pl-12">
            <div className="absolute left-0 top-0 h-full w-1.5 rounded-full bg-red-600/10 transition-colors group-hover:bg-red-600" />
            <p className="text-lg text-gray-700 leading-relaxed sm:text-xl lg:text-2xl">
              We believe that{" "}
              <span className="font-black text-red-600">
                faith-based learning
              </span>{" "}
              transforms lives and communities.
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
