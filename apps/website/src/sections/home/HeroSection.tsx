"use client";

import { Button } from "@school/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative h-[100vh] w-full overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
      >
        <source src="/hero/new-building-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Gradient Overlay for optimal readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/80 z-10" />

      {/* Hero Content */}
      <div className="relative z-20 flex h-full items-center justify-center">
        <div className="mx-auto max-w-4xl px-6 text-center text-white sm:px-12 lg:px-16">
          <div className="p-4 sm:p-8 md:p-10">
            {/* Title with beautiful typography and drop shadow */}
            <h1 className="mb-8 font-black tracking-tight leading-none drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)] text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              MOTHER PERPETUA <br className="hidden sm:inline" />
              <span className="inline-block bg-gradient-to-r from-white via-white to-red-500 bg-clip-text text-transparent whitespace-nowrap">
                PAROCHIAL SCHOOL, INC.
              </span>
            </h1>

            {/* Premium CTA Button */}
            <div className="flex justify-center">
              <Button
                asChild
                className="w-full sm:w-auto relative overflow-hidden group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold px-10 py-4 rounded-xl shadow-[0_4px_20_rgba(220,38,38,0.35)] hover:shadow-[0_6px_24px_rgba(220,38,38,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-0 text-base sm:px-12 sm:py-4 sm:text-lg"
              >
                <Link
                  className="flex items-center justify-center gap-2"
                  href="/registrar"
                >
                  Enroll Now
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
