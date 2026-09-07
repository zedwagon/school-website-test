"use client";

import { X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";
import { type AcademicSlug, academicPages } from "@/sections/home/academicData";

interface AcademicSectionProps {
  slug: AcademicSlug;
}

interface UniformItem {
  description: string;
  image: string;
  title: string;
}

const uniformData: Record<AcademicSlug, UniformItem[]> = {
  elementary: [
    {
      title: "Official School Uniform",
      description: "Prescribed daily uniform for Elementary School students.",
      image: "/home/uniform/uniform-elem.webp",
    },
    {
      title: "PE Uniform",
      description:
        "Official athletic attire worn during Physical Education classes.",
      image: "/home/uniform/uniform-pe.webp",
    },
  ],
  "junior-high": [
    {
      title: "Official School Uniform",
      description: "Prescribed daily uniform for Junior Highschool students.",
      image: "/home/uniform/uniform-jhs.webp",
    },
    {
      title: "PE Uniform",
      description:
        "Official athletic attire worn during Physical Education classes.",
      image: "/home/uniform/uniform-pe.webp",
    },
  ],
  "senior-high": [
    {
      title: "Regular Uniform (Mon & Wed)",
      description: "Prescribed daily uniform for Senior Highschool students.",
      image: "/home/uniform/uniform-shs-m-w.webp",
    },
    {
      title: "Regular Uniform (Tue & Thu)",
      description: "Prescribed daily uniform for Senior Highschool students.",
      image: "/home/uniform/uniform-shs-t-th.webp",
    },
    {
      title: "PE Uniform",
      description:
        "Official athletic attire worn during Physical Education classes.",
      image: "/home/uniform/uniform-pe.webp",
    },
  ],
};

export function AcademicSection({ slug }: AcademicSectionProps) {
  const content = academicPages[slug];
  if (!content) {
    notFound();
  }

  const uniforms = uniformData[slug] || [];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  // Handle ESC key to close modal & lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
        setSelectedTitle("");
      }
    };
    if (selectedImage) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <>
      <SectionWrapper className="text-center" padding="pt-4 pb-12" width="7xl">
        {/* 1. Programs / Features */}
        <section className="mb-20">
          <SectionHeader title="Programs & Features" />

          <p className="mb-10 text-center text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Our {content.title} program offers a variety of courses and
            activities designed to develop academic excellence, creativity, and
            character.
          </p>

          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {content.programs.map((program, i) => (
              <div
                className="group flex flex-col items-start justify-between rounded-3xl border border-gray-150 border-l-4 border-l-red-600 bg-gradient-to-br from-white via-white to-red-50/[0.02] p-6 sm:p-8 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 hover:border-red-200 hover:shadow-red-500/[0.03]"
                key={i}
              >
                <div className="w-full space-y-4">
                  <div className="pb-3 border-b border-gray-100 w-full">
                    <h4 className="font-black text-gray-900 text-lg sm:text-xl tracking-tight group-hover:text-primary transition-colors duration-200">
                      {program.title}
                    </h4>
                  </div>

                  {program.items && (
                    <ul className="w-full space-y-3.5 text-sm sm:text-base text-gray-650 font-semibold pl-1">
                      {program.items.map((item, idx) => {
                        if (typeof item === "string") {
                          return (
                            <li
                              className="flex items-center gap-3 group/item transition-colors duration-150 hover:text-gray-900"
                              key={idx}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-red-600 ring-4 ring-red-100 flex-shrink-0 transition-transform duration-200 group-hover/item:scale-110" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          );
                        } else {
                          return (
                            <li className="space-y-2" key={idx}>
                              <span className="flex items-center gap-3 font-extrabold text-gray-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 ring-4 ring-red-100 flex-shrink-0" />
                                <span className="leading-snug">
                                  {item.label}
                                </span>
                              </span>
                              <ul className="pl-6 space-y-2 border-l border-gray-100 ml-2.5">
                                {item.subItems.map((sub, sIdx) => (
                                  <li
                                    className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-500 font-medium group/sub transition-colors duration-150 hover:text-gray-800"
                                    key={sIdx}
                                  >
                                    <span className="h-1 w-1 rounded-full bg-gray-300 transition-colors duration-150 group-hover/sub:bg-red-500 flex-shrink-0" />
                                    <span className="leading-snug">{sub}</span>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Official School Uniform */}
        {uniforms.length > 0 && (
          <section className="mb-20">
            <SectionHeader title="Official School Uniform" />

            <div
              className={`mx-auto grid gap-8 justify-center mt-10 ${
                uniforms.length === 3
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
                  : "grid-cols-1 sm:grid-cols-2 max-w-3xl"
              }`}
            >
              {uniforms.map((item, i) => (
                <div
                  className="group flex flex-col overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                  key={i}
                >
                  {/* Clickable Image Area with Hover Zoom Icon Overlay */}
                  <div
                    className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedImage(item.image);
                      setSelectedTitle(item.title);
                    }}
                  >
                    <Image
                      alt={item.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-103"
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={item.image}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md shadow-lg ring-1 ring-white/30 transition-transform duration-300 scale-90 group-hover:scale-100">
                        <ZoomIn className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-grow p-6 text-center">
                    <h3 className="font-extrabold text-lg sm:text-xl text-gray-800 group-hover:text-primary transition-colors duration-250">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-gray-500 text-sm leading-relaxed flex-grow">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </SectionWrapper>

      {/* Lightbox / Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-4 transition-opacity duration-300 animate-fade-in"
          onClick={() => {
            setSelectedImage(null);
            setSelectedTitle("");
          }}
        >
          {/* Custom style for high-fidelity animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes zoomIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
            }
            .animate-zoom-in {
              animation: zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .animate-slide-up {
              animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>

          {/* Close button outside modal content */}
          <button
            aria-label="Close image preview"
            className="absolute top-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 z-50 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
              setSelectedTitle("");
            }}
          >
            <X className="h-8 w-8" />
          </button>

          {/* Large Image Showcase Container */}
          <div
            className="relative w-full max-w-4xl h-[78vh] flex items-center justify-center animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                alt={selectedTitle}
                className="object-contain select-none pointer-events-none drop-shadow-2xl"
                fill
                priority
                src={selectedImage}
              />
            </div>
          </div>

          {/* Floating Glassmorphic Caption */}
          {selectedTitle && (
            <div className="absolute bottom-8 left-0 right-0 mx-auto w-max rounded-full bg-black/40 px-8 py-3.5 text-white backdrop-blur-md ring-1 ring-white/10 shadow-2xl text-center select-none animate-slide-up">
              <p className="font-bold text-lg tracking-wide sm:text-xl">
                {selectedTitle}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
