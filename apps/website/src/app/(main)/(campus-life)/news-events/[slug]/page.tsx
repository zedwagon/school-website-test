// src/app/(main)/(campus-life)/news-events/[slug]/page.tsx

import { ArrowLeft, Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { newsEvents } from "@/sections/campus-life/newsEvents";

interface Params {
  slug: string;
}

export default async function NewsArticlePage({ params }: { params: Params }) {
  const { slug } = await Promise.resolve(params);

  const newsItem = newsEvents.find((item) => item.slug.endsWith(slug));

  if (!newsItem) {
    return (
      <SectionWrapper className="py-24 text-center" width="4xl">
        <h2 className="mb-4 font-extrabold text-3xl text-gray-800">
          News Not Found
        </h2>
        <Link
          className="inline-flex items-center gap-2 font-bold text-primary hover:underline"
          href="/news-events"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to News</span>
        </Link>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper className="text-left" padding="pt-16 pb-12" width="4xl">
      {/* 1. Back Navigation Button */}
      <div className="mb-8">
        <Link
          className="group inline-flex items-center gap-2 text-xs font-bold text-gray-450 hover:text-primary transition-colors duration-250 uppercase tracking-widest"
          href="/news-events"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-250 group-hover:-translate-x-1" />
          <span>Back to Articles</span>
        </Link>
      </div>

      {/* 2. Article Header */}
      <header className="space-y-4 mb-8 text-center sm:text-left">
        <div className="inline-block bg-primary/5 text-primary border border-primary/10 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
          Official Update
        </div>

        <h1 className="font-black text-3xl sm:text-5xl text-gray-800 leading-tight tracking-tight">
          {newsItem.title}
        </h1>

        {/* Metadata info row */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest pt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary/80" />
            <span>{newsItem.date}</span>
          </div>
          <span className="text-gray-200 hidden sm:inline">&bull;</span>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary/80" />
            <span>By {newsItem.author || "Staff Writer"}</span>
          </div>
        </div>
      </header>

      {/* 3. Hero Cover Image */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-gray-150 shadow-sm mb-10">
        <Image
          alt={newsItem.title}
          className="object-cover"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 896px"
          src={newsItem.image}
        />
      </div>

      {/* 4. Full Paragraphs Article Content */}
      {newsItem.article && (
        <article className="max-w-3xl space-y-6 mb-16">
          {newsItem.article.map(
            (paragraph, i) =>
              paragraph.trim() && (
                <p
                  className={`text-gray-650 text-base sm:text-lg leading-relaxed text-justify ${
                    paragraph.startsWith('"') || paragraph.startsWith("“")
                      ? "italic font-semibold text-gray-750 pl-4 border-l-2 border-primary/40 my-8"
                      : ""
                  }`}
                  key={i}
                >
                  {paragraph}
                </p>
              ),
          )}
        </article>
      )}

      {/* 6. Multi-Column Photo Gallery Grid */}
      {newsItem.images && newsItem.images.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-gray-100 mb-10">
          <h3 className="font-extrabold text-xl sm:text-2xl text-gray-800 tracking-tight">
            Event Gallery
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {newsItem.images.map((img, i) => (
              <div
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                key={i}
              >
                {/* Photo container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                  <Image
                    alt={img.caption || `Gallery Image ${i + 1}`}
                    className="object-cover transition-transform duration-500 group-hover:scale-103"
                    fill
                    sizes="(max-width: 640px) 100vw, 280px"
                    src={img.src}
                  />
                </div>
                {/* Caption footer */}
                {img.caption && (
                  <div className="p-3 border-t border-gray-100 text-center flex items-center justify-center min-h-[3.5rem] bg-gray-50/50">
                    <span className="text-xs font-bold text-gray-500 leading-snug">
                      {img.caption}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Bottom Navigation Link */}
      <div className="pt-10 border-t border-gray-100 text-center">
        <Link
          className="group inline-flex items-center gap-2 font-extrabold text-base text-primary hover:text-primary/95 transition-all duration-200"
          href="/news-events"
        >
          <ArrowLeft className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to News & Announcements</span>
        </Link>
      </div>
    </SectionWrapper>
  );
}
