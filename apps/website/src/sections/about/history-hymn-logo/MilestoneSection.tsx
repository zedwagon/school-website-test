"use client";

import { Card } from "@school/ui";
import { Award, BookOpen, Building, Users } from "lucide-react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "../../../components/section-header";

interface Milestone {
  description: string;
  icon: React.ReactNode;
  title: string;
  year: string;
}

const milestones: Milestone[] = [
  {
    year: "Before 1978",
    icon: <BookOpen />,
    title: "Informal Beginnings & Sunday School",
    description:
      "Mother Perpetua Parochial School, Inc. (MPPSI) informally started even before 1978 with Sunday school catechetical instruction led by dedicated catechists under the direction of the Priests of St. Bonaventure Parish. Classes were held in a vacant backstage room known as 'Silong ng Langit'. To respond to the demand of parents, the St. Bonaventure Kindergarten School was opened, later transitioning to the St. Bonaventure Catechetical Center and eventually managed by the Missionary Catechists of St. Therese.",
  },
  {
    year: "1986",
    icon: <Building />,
    title: "Foundation & SEC Registration",
    description:
      "Inspired by the original kindergarten mission, Rev. Fr. Domingo B. Edora founded Casa Del Niño Jesus de Mauban in 1986 on the grounds of St. Bonaventure Parish, supported by Mrs. Amparo A. Palacio and generous townspeople. Most Rev. Ruben T. Profugo, D.D., approved the first batch of pre-school students in June 1986. On September 1, 1986, the Securities and Exchange Commission (SEC) officially registered the school under its present name, Mother Perpetua Parochial School, Inc.",
  },
  {
    year: "1992",
    icon: <Users />,
    title: "First Elementary Graduates & Secondary Expansion",
    description:
      "March 28, 1992 marked a major milestone in the school's progress. The first elementary education graduates received their Certificate of Graduation (18 boys and 18 girls). As the only Catholic School in town, making Christian Living the core of its curriculum, the school expanded to offer Secondary Education, launching its First-Year level for the 1993–1994 school year.",
  },
  {
    year: "1995–1996",
    icon: <Award />,
    title: "Government Subsidy & First High School Graduates",
    description:
      "In 1995, the national government granted Educational Service Contracting (ESC) recognition, providing financial grants to students with financial difficulties. Shortly after, on March 21, 1996, the school celebrated another landmark as 20 students (8 boys and 12 girls) became the very first batch of Secondary Education graduates.",
  },
  {
    year: "2006",
    icon: <Building />,
    title: "Daughters of St. Teresa Administration",
    description:
      "Over the years, the school received vital support from generous benefactors, including three buildings donated by Mr. Albert B. Lim and family. School directors like Rev. Fr. Pedro V. Obon and Rev. Msgr. Beato S. Racelis, HP, maintained exceptionally high standards. In 2006, the Daughters of St. Teresa took over the administration of the school, bringing their expertise and dedication to the educational apostolate.",
  },
  {
    year: "2015",
    icon: <BookOpen />,
    title: "Senior High School GAS Recognition",
    description:
      "MPPSI has continually improved its facilities, academic programs, and overall services. A notable milestone came on August 3, 2015, when the government officially recognized and approved the school's Senior High School General Academic Strand (GAS) program.",
  },
  {
    year: "2024",
    icon: <Award />,
    title: "PEAC Recertification & JHS Certified Status",
    description:
      "On February 19, 2024, the school underwent successful PEAC Recertification. Later that year, on July 25, 2024, the institution earned Certified Status for fully meeting the high standards and requirements of the DepEd Junior High School Program.",
  },
  {
    year: "2025",
    icon: <BookOpen />,
    title: "ABM, HUMSS, & STEM Strands Approved",
    description:
      "Further academic advancement was achieved on March 13, 2025, when the school received official approval to expand its Senior High School offerings to include the ABM (Accountancy, Business, and Management), HUMSS (Humanities and Social Sciences), and STEM (Science, Technology, Engineering, and Mathematics) strands.",
  },
  {
    year: "2026–2027",
    icon: <Award />,
    title: "Trimestral System & Curricular Expansion",
    description:
      "Today, MPPSI continues to stand strong, keeping Catholic values at the core of its curriculum. For the School Year 2026–2027, aligned with DepEd directives, the school has strengthened its Senior High School curriculum and officially adopted a trimestral academic system, ensuring a holistic, well-paced, and enriched learning experience for every student.",
  },
];

export function MilestonesSection() {
  return (
    <SectionWrapper bg="background" width="4xl">
      <SectionHeader title="Milestones in Our History" />

      <div className="relative flex w-full flex-col items-center space-y-20">
        {/* Vertical dashed line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px border-primary/40 border-l-2 border-dashed" />

        {milestones.map((m, i) => (
          <div className="relative flex w-full flex-col items-center" key={i}>
            {/* Year badge */}
            <div className="z-10 mb-6 rounded-full bg-primary px-6 py-3 text-center font-bold text-lg text-white tracking-wide shadow-md">
              {m.year}
            </div>

            {/* Card */}
            <Card className="flex w-full flex-row gap-6 border border-gray-200 bg-white p-6 shadow-lg">
              {/* Icon */}
              <div className="flex-shrink-0 text-3xl text-primary sm:mt-2">
                {m.icon}
              </div>

              {/* Text content */}
              <div className="flex flex-1 flex-col gap-3">
                <h3 className="font-bold text-gray-800 text-xl tracking-wide sm:text-2xl">
                  {m.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed sm:text-base">
                  {m.description}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
