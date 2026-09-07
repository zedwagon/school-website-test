"use client";

import { ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";
import { newsEvents } from "./newsEvents";

export function NewsEventsSection() {
  const topNews = newsEvents.slice(0, 3);
  const moreNews = newsEvents.slice(3);

  return (
    <SectionWrapper
      bg="background"
      className="pt-4 pb-24 text-center"
      width="7xl"
    >
      {/* 1. Featured News Header */}
      <div className="mb-10">
        <SectionHeader title="Featured Articles" />
      </div>

      {/* Top 3 Featured News Grid */}
      <div className="mx-auto grid max-w-6xl gap-8 text-left grid-cols-1 md:grid-cols-3">
        {topNews.map((item, index) => (
          <div
            className="group flex flex-col overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            key={index}
          >
            {/* Aspect image container */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
              <Image
                alt={item.title}
                className="object-cover transition-transform duration-500 group-hover:scale-103"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                src={item.image}
              />
            </div>

            {/* Card details */}
            <div className="flex flex-col flex-grow p-6 sm:p-7">
              {/* Date Metadata */}
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary uppercase tracking-wider mb-2.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{item.date}</span>
              </div>

              {/* Title */}
              <h4 className="font-extrabold text-xl text-gray-800 leading-snug mb-3 group-hover:text-primary transition-colors duration-250 line-clamp-2">
                {item.title}
              </h4>

              {/* Description */}
              <p className="text-gray-550 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                {item.article[0]}
              </p>

              {/* Read More Link */}
              <Link
                className="inline-flex items-center gap-1.5 font-extrabold text-sm text-primary hover:text-primary/85 transition-colors duration-200 w-max"
                href={`/news-events/${item.slug.split("/").pop()}`}
              >
                <span>Read Article</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Secondary Header with styled separator spacing */}
      {moreNews.length > 0 && (
        <div className="mt-24 mb-10 pt-10 border-t border-gray-100">
          <SectionHeader title="More Announcements" />
        </div>
      )}

      {/* More News Grid (2 Columns, Horizontal Cards on Desktop) */}
      {moreNews.length > 0 && (
        <div className="mx-auto grid max-w-6xl gap-8 text-left grid-cols-1 lg:grid-cols-2">
          {moreNews.map((item, index) => (
            <div
              className="group flex flex-col sm:flex-row gap-6 p-5 rounded-3xl border border-gray-150 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              key={index}
            >
              {/* Image thumbnail */}
              <div className="relative aspect-[16/10] sm:aspect-square w-full sm:w-40 sm:h-40 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50">
                <Image
                  alt={item.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                  fill
                  sizes="(max-width: 640px) 100vw, 160px"
                  src={item.image}
                />
              </div>

              {/* Info column */}
              <div className="flex flex-col justify-between flex-grow py-1">
                <div>
                  {/* Date Metadata */}
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary uppercase tracking-wider mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.date}</span>
                  </div>

                  {/* Title */}
                  <h4 className="font-extrabold text-lg text-gray-800 leading-snug mb-2 group-hover:text-primary transition-colors duration-250 line-clamp-2">
                    {item.title}
                  </h4>

                  {/* Description */}
                  <p className="text-gray-550 text-sm leading-relaxed mb-4 line-clamp-2">
                    {item.article[0]}
                  </p>
                </div>

                {/* Read More Link */}
                <Link
                  className="inline-flex items-center gap-1.5 font-extrabold text-sm text-primary hover:text-primary/85 transition-colors duration-200 w-max"
                  href={`/news-events/${item.slug.split("/").pop()}`}
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
