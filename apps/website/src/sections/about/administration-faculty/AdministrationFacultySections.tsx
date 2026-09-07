"use client";

import { Card } from "@school/ui";
import Image from "next/image";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

import { adminData, faculty, nonTeaching, type Person } from "./staffData";

const gridClasses =
  "grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-10 justify-center";

const baseCardClasses =
  "flex flex-col sm:flex-row items-center gap-8 p-8 w-full max-w-4xl transition-shadow rounded-2xl text-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2";

const cardColorMap: Record<string, string> = {
  admin: "bg-gradient-to-r from-red-600 via-red-700 to-red-800",
  earlyAdviser: "bg-gradient-to-r from-red-600 via-red-700 to-red-800",
  elementary: "bg-gradient-to-r from-red-600 via-red-700 to-red-800",
  juniorAdviser: "bg-gradient-to-r from-red-600 via-red-700 to-red-800",
  seniorAdviser: "bg-gradient-to-r from-red-600 via-red-700 to-red-800",
  subjectTeachers: "bg-gradient-to-r from-red-600 via-red-700 to-red-800",
  nonTeaching: "bg-gradient-to-r from-red-600 via-red-700 to-red-800",
};

const subtitleMap: Record<string, string> = {
  admin: "Administration",
  earlyAdviser: "Early Education Advisers",
  elementary: "Elementary Advisers",
  juniorAdviser: "Junior High Advisers",
  seniorAdviser: "Senior High Advisers",
  subjectTeachers: "Academic Staff",
  nonTeaching: "Non-Teaching Staff",
};

export function AdministrationFacultySections() {
  const renderCard = (person: Person, category: string) => (
    <Card
      className={`${baseCardClasses} ${cardColorMap[category]}`}
      key={person.id}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative h-28 w-28 flex-shrink-0">
          <Image
            alt={person.name}
            className="rounded-full object-cover shadow-md"
            fill
            loading="lazy"
            sizes="112px"
            src={person.image}
          />
        </div>

        <div className="mt-4 flex flex-col justify-center text-center sm:mt-0 sm:text-left">
          <h3 className="font-bold text-2xl md:text-3xl">{person.name}</h3>
          <p className="text-lg md:text-xl">{person.role}</p>

          {person.extraRoles?.length ? (
            <div className="mt-1 flex flex-wrap justify-center gap-2 sm:justify-start">
              {person.extraRoles.map((role, i) => (
                <span
                  className="rounded-full bg-white/20 px-2 py-0.5 text-white text-xs"
                  key={i}
                >
                  {role}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );

  const FacultySection = ({
    title,
    members,
    category,
  }: {
    title: string;
    members: Person[];
    category: string;
  }) => (
    <SectionWrapper className="text-left" width="7xl">
      <SectionHeader title={title} />
      <div className={gridClasses}>
        {members.map((person) => renderCard(person, category))}
      </div>
    </SectionWrapper>
  );

  return (
    <>
      {/* Administration */}
      <SectionWrapper bg="background" className="text-left" width="7xl">
        <SectionHeader title="Administration" />
        {/* Principal/Director */}
        <div className="mb-8 flex flex-col items-center gap-6">
          {renderCard(adminData.head, "admin")}
        </div>
        {/* Assistant Principal */}
        <div className="mb-12 flex flex-col items-center gap-6">
          {renderCard(adminData.assistant, "admin")}
        </div>
        {/* Other Administrative Members */}
        <div className={gridClasses}>
          {adminData.members.map((member) => renderCard(member, "admin"))}
        </div>
      </SectionWrapper>

      {/* Faculty Sections */}
      {Object.entries(faculty).map(([level, teachers]) => (
        <FacultySection
          category={level}
          key={level}
          members={teachers}
          title={subtitleMap[level]}
        />
      ))}

      {/* Non-Teaching Staff */}
      <FacultySection
        category="nonTeaching"
        members={nonTeaching}
        title="Non-Teaching Staff"
      />
    </>
  );
}
