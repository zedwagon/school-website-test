"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@school/ui";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { facilities } from "@/sections/campus-life/facilities";

interface FacilityWithGallery {
  description: string;
  images: string[];
  name: string;
}

export function FacilitiesSection() {
  const [selectedFacility, setSelectedFacility] =
    useState<FacilityWithGallery | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Reset loading state when image changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [currentIndex, selectedFacility]);

  // Map local data into standardized image sets
  const facilitiesWithGallery: FacilityWithGallery[] = facilities.map((f) => ({
    name: f.name,
    description: f.description,
    images:
      f.images && f.images.length > 0
        ? f.images.includes(f.image)
          ? f.images
          : [f.image, ...f.images]
        : [f.image],
  }));

  const openDialog = (facility: FacilityWithGallery) => {
    setSelectedFacility(facility);
    setCurrentIndex(0);
  };

  const nextImage = () => {
    if (!selectedFacility) return;
    setCurrentIndex((prev) => (prev + 1) % selectedFacility.images.length);
  };

  const prevImage = () => {
    if (!selectedFacility) return;
    setCurrentIndex(
      (prev) =>
        (prev - 1 + selectedFacility.images.length) %
        selectedFacility.images.length,
    );
  };

  return (
    <SectionWrapper
      bg="background"
      className="text-center"
      padding="pt-4 pb-16"
      width="7xl"
    >
      {/* 3-Column Facilities Grid */}
      <div className="mx-auto mt-6 grid max-w-6xl gap-8 text-left grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {facilitiesWithGallery.map((facility, index) => (
          <div
            className="group flex flex-col overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            key={index}
            onClick={() => openDialog(facility)}
          >
            {/* Clickable Image Zoom container */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
              <Image
                alt={facility.name}
                className="object-cover transition-transform duration-500 group-hover:scale-103"
                fill
                sizes="(max-width: 768px) 100vw, 350px"
                src={facility.images[0]}
              />
              {/* Zoom Medallion overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md shadow-lg ring-1 ring-white/30 transition-transform duration-300 scale-90 group-hover:scale-100">
                  <ZoomIn className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div className="flex flex-col flex-grow p-6">
              <h4 className="font-extrabold text-xl text-gray-800 tracking-tight mb-2 group-hover:text-primary transition-colors duration-250">
                {facility.name}
              </h4>
              <p className="text-gray-550 text-sm leading-relaxed mb-6 flex-grow">
                {facility.description}
              </p>

              {/* View Gallery interactive link */}
              <div className="pt-4 border-t border-gray-100/60 inline-flex items-center gap-1.5 text-xs font-extrabold text-gray-400 group-hover:text-primary transition-colors duration-250 uppercase tracking-widest">
                <span>View Gallery</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-250 group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Immersive Theater mode Dialog Lightbox */}
      <Dialog
        onOpenChange={() => setSelectedFacility(null)}
        open={!!selectedFacility}
      >
        <DialogContent
          className="w-[calc(100vw-2rem)] sm:max-w-3xl md:max-w-3xl h-[calc(100vh-2rem)] md:h-auto max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-hidden rounded-3xl p-0 border border-white/10 shadow-2xl bg-black/95 backdrop-blur-xl gap-0 flex flex-col"
          showCloseButton={false}
        >
          {selectedFacility && (
            <div className="relative flex flex-col h-full w-full text-left">
              {/* DialogTitle for accessibility */}
              <DialogTitle className="sr-only">
                {selectedFacility.name}
              </DialogTitle>

              {/* Immersive Dark Viewport */}
              <div className="relative flex-1 md:h-[55vh] md:flex-none w-full flex items-center justify-center overflow-hidden bg-black/30">
                {/* Loading Spinner overlay */}
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30 transition-opacity duration-300">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                )}

                {/* Floating Themed Header details overlay */}
                <div className="absolute top-6 left-8 z-20 select-none">
                  <h3 className="font-extrabold text-2xl text-white tracking-tight leading-none drop-shadow-md">
                    {selectedFacility.name}
                  </h3>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mt-1.5 drop-shadow-md">
                    Image {currentIndex + 1} of {selectedFacility.images.length}
                  </p>
                </div>

                {/* Sleek, glassmorphic close button overlaying the immersive dark viewport */}
                <button
                  className="absolute top-6 right-8 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/60 hover:scale-105 active:scale-95 shadow-md"
                  onClick={() => setSelectedFacility(null)}
                >
                  <X className="h-4.5 w-4.5" />
                  <span className="sr-only">Close</span>
                </button>

                {/* Main Theatre Image feed */}
                <div className="relative w-full h-full p-4 flex items-center justify-center">
                  <Image
                    alt={selectedFacility.name}
                    className="object-contain select-none pointer-events-none drop-shadow-2xl transition-all duration-300"
                    fill
                    onLoad={() => setIsImageLoading(false)}
                    priority
                    sizes="(max-width: 1024px) 100vw, 768px"
                    src={selectedFacility.images[currentIndex]}
                  />
                </div>

                {/* Left/Right Glassmorphic Navigation Buttons */}
                {selectedFacility.images.length > 1 && (
                  <>
                    <button
                      aria-label="Previous image"
                      className="absolute top-1/2 left-6 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 hover:bg-primary hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none shadow-lg"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      aria-label="Next image"
                      className="absolute top-1/2 right-6 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 hover:bg-primary hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none shadow-lg"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* justified description caption */}
              <div className="p-6 bg-black/40 border-t border-white/5 backdrop-blur-md flex-shrink-0">
                <DialogDescription className="text-gray-300 text-sm leading-relaxed text-justify">
                  {selectedFacility.description}
                </DialogDescription>
              </div>

              {/* Scrolling Filmstrip Thumbnails strip */}
              {selectedFacility.images.length > 1 && (
                <div className="overflow-x-auto p-4 pb-6 bg-black/60 border-t border-white/5 backdrop-blur-md select-none flex-shrink-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary">
                  <div className="flex justify-start sm:justify-center gap-3 w-max min-w-full px-4 mx-auto">
                    {selectedFacility.images.map((img, idx) => (
                      <div
                        className={`relative h-14 w-20 cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-300 hover:opacity-100 flex-shrink-0 ${
                          idx === currentIndex
                            ? "border-primary opacity-100 scale-103"
                            : "border-transparent opacity-50"
                        }`}
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                      >
                        <Image
                          alt={`Thumbnail ${idx}`}
                          className="object-cover select-none pointer-events-none"
                          fill
                          sizes="80px"
                          src={img}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SectionWrapper>
  );
}
