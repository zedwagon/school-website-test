import { Eye, Hand, Heart } from "lucide-react";
import Image from "next/image";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

const reasons = [
  {
    title: "Heart of the Institution",
    description:
      "MPPSI provides quality Catholic education that nurtures both academic excellence and spiritual growth. Guided by faith, the school fosters moral integrity, compassion, and lifelong learning, preparing students to become responsible and Christ-centered individuals.",
    image: "/home/choose-heart.webp",
    icon: Heart,
  },
  {
    title: "Hands to Offer of the Institution",
    description:
      "MPPSI promotes inclusivity and sustainability by fostering a welcoming environment for all learners and implementing eco-friendly practices that nurture social responsibility and care for the environment.",
    image: "/home/choose-hands.webp",
    icon: Hand,
  },
  {
    title: "Eyes of the Institution",
    description:
      "MPPSI nurtures learners who develop practical skills, creativity, and leadership. The school equips students to become skilled and talented future leaders ready to make a positive impact in their chosen fields.",
    image: "/home/choose-eyes.webp",
    icon: Eye,
  },
];

export function WhyChooseUsSection() {
  return (
    <SectionWrapper padding="py-16 sm:py-20" width="4xl">
      <SectionHeader
        subtitle="At MPPSI, we empower learners to excel academically, grow in faith, and lead with integrity. With passionate teachers, a caring community, and quality education, we help students become their best selves—ready for the future."
        title="Why Choose Us?"
      />

      <div className="mt-12 flex flex-col gap-16">
        {reasons.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              className={`flex flex-col items-center gap-8 md:flex-row md:gap-12 ${
                index % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
              key={index}
            >
              {/* Image Section */}
              <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-lg md:h-80 md:w-1/2">
                <Image
                  alt={item.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={item.image}
                />
              </div>

              {/* Content Section */}
              <div className="w-full space-y-4 md:w-1/2">
                <div className="flex items-center gap-4">
                  <Icon className="h-10 w-10 text-primary" />
                  <h3 className="font-bold text-2xl text-foreground leading-snug sm:text-3xl">
                    {item.title}
                  </h3>
                </div>
                <p className="text-justify text-base text-muted-foreground leading-relaxed sm:text-lg">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
