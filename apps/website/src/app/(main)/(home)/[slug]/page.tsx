"use client";

import { notFound } from "next/navigation";
import React from "react";
import { HeroText } from "@/components/HeroText";
import { AcademicSection } from "@/sections/home/AcademicSection";
import { type AcademicSlug, academicPages } from "@/sections/home/academicData";

export default function AcademicPage({
  params,
}: {
  params: Promise<{ slug: AcademicSlug }>;
}) {
  const resolvedParams = React.use(params);
  const content = academicPages[resolvedParams.slug];

  if (!content) {
    notFound();
  }

  return (
    <>
      {/* Page-level hero using slug content */}
      <HeroText className="text-center" title={content.title} />

      {/* Slug-specific academic section */}
      <AcademicSection slug={resolvedParams.slug} />
    </>
  );
}
