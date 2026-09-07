"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@school/ui";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { organizations } from "./organizations";

export function OrganizationsSection() {
  const [selectedOrg, setSelectedOrg] = useState<
    (typeof organizations)[0] | null
  >(null);

  return (
    <SectionWrapper
      bg="background"
      className="text-center"
      padding="pt-4 pb-16"
      width="7xl"
    >
      {/* 8 Organizations Responsive Grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {organizations.map((org, index) => (
          <div
            className="group relative flex flex-col items-center justify-between rounded-3xl border border-gray-150 bg-white p-8 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            key={index}
            onClick={() => setSelectedOrg(org)}
          >
            <div className="flex flex-col items-center w-full">
              {/* Circular Logo Medallion */}
              <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-gray-50/50 border border-gray-100 shadow-inner group-hover:scale-103 transition-transform duration-500">
                <Image
                  alt={org.name}
                  className="object-contain p-5 select-none pointer-events-none"
                  fill
                  sizes="176px"
                  src={org.logo}
                />
              </div>

              {/* Organization Text Details */}
              <h4 className="font-extrabold text-xl text-gray-800 tracking-tight mt-6 group-hover:text-primary transition-colors duration-250">
                {org.name}
              </h4>

              {org.tagline && (
                <p className="text-sm text-primary font-bold italic mt-2 tracking-wide">
                  {org.tagline}
                </p>
              )}

              {/* Sub-text snippet to give the cards visual substance */}
              <p className="text-gray-550 text-sm leading-relaxed mt-4 line-clamp-2">
                {org.description}
              </p>
            </div>

            {/* Learn More Badge Action */}
            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-extrabold text-gray-400 group-hover:text-primary transition-colors duration-250 uppercase tracking-widest">
              <span>Learn More</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-250 group-hover:translate-x-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Styled Profile-style Modal Dialog */}
      <Dialog onOpenChange={() => setSelectedOrg(null)} open={!!selectedOrg}>
        <DialogContent
          className="w-[calc(100vw-2rem)] sm:max-w-lg overflow-hidden rounded-3xl p-0 border border-gray-100 shadow-2xl bg-white gap-0"
          showCloseButton={false}
        >
          {selectedOrg && (
            <div className="relative flex flex-col w-full text-left">
              <DialogTitle className="sr-only">{selectedOrg.name}</DialogTitle>

              {/* Cover Banner Image with Float overlay */}
              {selectedOrg.fullImage && (
                <div className="relative w-full">
                  {/* Cover Banner Image with top rounded corners and overflow hidden */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-3xl bg-gray-50">
                    <Image
                      alt={selectedOrg.name}
                      className="object-cover"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 512px"
                      src={selectedOrg.fullImage}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Sleek, glassmorphic close button overlaying the image banner */}
                  <button
                    className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:scale-105 active:scale-95 shadow-md"
                    onClick={() => setSelectedOrg(null)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>

                  {/* Floating Logo Medallion sibling at correct relative stacking order */}
                  <div className="absolute -bottom-10 left-6 h-18 w-18 rounded-2xl bg-white p-2 shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden z-10">
                    <div className="relative w-full h-full">
                      <Image
                        alt={selectedOrg.name}
                        className="object-contain select-none pointer-events-none"
                        fill
                        sizes="72px"
                        src={selectedOrg.logo}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text Description Segment */}
              <div className="p-6.5 pt-12.5 pb-7 bg-white">
                <h3 className="font-black text-2xl text-gray-800 tracking-tight leading-none">
                  {selectedOrg.name}
                </h3>
                {selectedOrg.tagline && (
                  <p className="text-xs.5 text-primary font-bold italic mt-2 tracking-wide">
                    {selectedOrg.tagline}
                  </p>
                )}

                <div className="h-px bg-gray-100 my-4" />

                <DialogDescription className="text-gray-550 text-[14.5px] leading-relaxed text-justify">
                  {selectedOrg.description.split("\n\n").map((para, i) => (
                    <span className="mb-3 block last:mb-0" key={i}>
                      {para}
                    </span>
                  ))}
                </DialogDescription>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SectionWrapper>
  );
}
