import { getTeachers } from "@school/api/faculty/query";
import {
  getSectionByIdQuery,
  getSectionScheduleQuery,
  getStudentsInSectionQuery,
} from "@school/api/sections/query";
import { getSubjects } from "@school/api/subjects/query";
import { notFound } from "next/navigation";

import SectionDetailsClient from "./_components/section-details-client";

export const metadata = {
  title: "Section Details | Class Builder | MPPSI Portal",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SectionDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const sectionId = Number.parseInt(id, 10);

  if (Number.isNaN(sectionId)) {
    notFound();
  }

  try {
    const [section, schedule, subjectsResult, teachersResult, studentsResult] =
      await Promise.all([
        getSectionByIdQuery(sectionId),
        getSectionScheduleQuery(sectionId, true),
        getSubjects(undefined, "active", 1, 500),
        getTeachers(undefined, "active", 1, 500),
        getStudentsInSectionQuery(sectionId),
      ]);

    if (!section) {
      notFound();
    }

    return (
      <div className="mx-auto max-w-7xl">
        <SectionDetailsClient
          availableSubjects={subjectsResult.data}
          availableTeachers={teachersResult.data}
          schedule={schedule}
          section={section}
          students={studentsResult}
        />
      </div>
    );
  } catch {
    notFound();
  }
}
