"use client";

import Image from "next/image";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

interface Trustee {
  image: string;
  name: string;
  role: string;
  title?: string;
}

export function BoardOfTrusteesSection() {
  const chair: Trustee = {
    name: "Most Rev. Mel Rey M. Uy, D. D.",
    title: "Bishop of Lucena",
    role: "BOT Chairman",
    image: "/about/board-of-trustees/bot-chairman.webp",
  };

  const viceChair: Trustee = {
    name: "Rev. Fr. Edwin V. Baruelo",
    title: "LUDICSA Superintendent",
    role: "BOT Secretary",
    image: "/about/board-of-trustees/rev-fr-baruelo.webp",
  };

  const members: Trustee[] = [
    {
      name: "Rev. Fr. Jose Fernando V. Defante",
      title: "Financial Secretary",
      role: "BOT Member",
      image: "/about/board-of-trustees/rev-fr-defante.webp",
    },
    {
      name: "Rev. Fr. Allan Neil L. Laqueo",
      title: "Maryhill President",
      role: "BOT Member",
      image: "/about/board-of-trustees/rev-fr-laqueo.webp",
    },
    {
      name: "Rev. Msgr. Antonio L. Obeña",
      title: "Casa del Niño Jesus de Lucban Director",
      role: "BOT Member",
      image: "/about/board-of-trustees/rev-msgr-obeña.webp",
    },
    {
      name: "Rev. Fr. Roderick G. Mercurio, LPT, MMEM, FRIEdr",
      title: "MPPSI Director",
      role: "BOT Member",
      image: "/school-director.webp",
    },
    {
      name: "Rev. Fr. Librado M. Burgos",
      title: "MPPSI Chaplain",
      role: "BOT Member",
      image: "/about/board-of-trustees/rev-fr-burgos.webp",
    },
    {
      name: "Mrs. Quezaroany B. Rivera",
      title: "MPPSI Finance Officer",
      role: "BOT Member",
      image: "/about/administration-faculty/mrs-rivera.webp",
    },
    {
      name: "Mrs. Carmela D. Elloso, J. D.",
      title: "MPPSI SPTA President",
      role: "Board Member",
      image: "/about/board-of-trustees/mrs-elloso.webp",
    },
    {
      name: "Mrs. Earludgin S. Villamayor",
      title: "St. Bonaventure Parish PPC President",
      role: "BOT Member",
      image: "/about/board-of-trustees/mrs-villamayor.webp",
    },
  ];

  const renderTrusteeCard = (trustee: Trustee, sizeClass = "max-w-[300px]") => (
    <div
      className={`group flex w-full ${sizeClass} flex-col rounded-3xl border border-gray-150 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
    >
      {/* Editorial Rectangular Portrait with scale effect */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
        <Image
          alt={`${trustee.name}, ${trustee.role}`}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fill
          loading="lazy"
          sizes="(max-width: 640px) 280px, 320px"
          src={trustee.image}
        />
      </div>

      {/* Member Metadata */}
      <div className="mt-4 flex flex-col text-left gap-1 px-1">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
          {trustee.role}
        </span>
        <h3 className="font-extrabold text-base sm:text-lg text-gray-800 leading-snug group-hover:text-primary transition-colors duration-200">
          {trustee.name}
        </h3>
        {trustee.title && (
          <p className="text-xs sm:text-sm text-gray-550 font-medium italic leading-relaxed">
            {trustee.title}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <SectionWrapper
      bg="background"
      className="pt-4 pb-24 text-center"
      width="7xl"
    >
      {/* BOT Chairman (First Tier Hierarchy) */}
      <div className="mb-10 flex justify-center">
        {renderTrusteeCard(chair, "max-w-[270px]")}
      </div>

      {/* BOT Secretary (Second Tier Hierarchy) */}
      <div className="mb-20 flex justify-center">
        {renderTrusteeCard(viceChair, "max-w-[270px]")}
      </div>

      {/* BOT Members Grid */}
      <div className="pt-12">
        <SectionHeader title="Board Members" />

        <div className="mx-auto grid max-w-6xl grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {members.map((member) => (
            <div className="flex justify-center w-full" key={member.name}>
              {renderTrusteeCard(member, "max-w-[270px]")}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
