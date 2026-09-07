import { Button, Card, CardContent, CardFooter, CardHeader } from "@school/ui";
import { Award, BookOpen, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

const levels = [
  {
    title: "Elementary",
    description:
      "The Elementary Department ensures a safe, inclusive, and child-friendly environment that nurtures confidence, compassion, and competence in every learner.",
    image: "/home/elem.webp",
    href: "/elementary",
    icon: BookOpen,
  },
  {
    title: "Junior High School",
    description:
      "The Junior High School Department promotes excellence through a relevant and well-aligned curriculum that builds mastery, critical thinking, and lifelong learning skills.",
    image: "/home/jhs.webp",
    href: "/junior-high",
    icon: GraduationCap,
  },
  {
    title: "Senior High School",
    description:
      "The Senior High School Department upholds excellence through qualified teachers, a coherent curriculum, and strong student support for meaningful learning outcomes.",
    image: "/home/shs.webp",
    href: "/senior-high",
    icon: Award,
  },
];

export function QualityEducationSection() {
  return (
    <SectionWrapper bg="background" padding="py-16 sm:py-20" width="7xl">
      <SectionHeader
        subtitle="For 40 years, at Mother Perpetua Parochial School, Inc. (MPPSI), we redefine excellence through innovation, integrity, and faith. Our commitment goes beyond academics—we cultivate confident, compassionate, and future-ready learners who lead with purpose and make a positive impact in their communities."
        title="Quality Education"
      />

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
        {levels.map((level, index) => {
          const Icon = level.icon;
          return (
            <Card
              className="flex flex-col overflow-hidden rounded-2xl bg-card pt-0 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
              key={index}
            >
              {/* Image */}
              <div className="relative h-52 w-full md:h-60">
                <Image
                  alt={level.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={level.image}
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col space-y-4 px-6">
                <CardHeader className="flex items-center gap-3 p-0">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-2xl text-foreground">
                    {level.title}
                  </h3>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <p className="text-justify text-muted-foreground leading-relaxed">
                    {level.description}
                  </p>
                </CardContent>

                {/* Button */}
                <CardFooter className="mt-auto p-0 pt-4">
                  <Link className="w-full" href={level.href}>
                    <Button
                      className="w-full cursor-pointer bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                      variant="default"
                    >
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </div>
            </Card>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
