import { Separator } from "@school/ui";
import Image from "next/image";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";

export function DirectorsMessageSection() {
  return (
    <SectionWrapper bg="background" padding="py-16 sm:py-20" width="4xl">
      <SectionHeader
        subtitle="A message from the Director of MPPSI"
        title="Director's Message"
      />

      <div className="mt-10 space-y-6 text-justify text-base text-muted-foreground leading-relaxed sm:text-lg">
        {/* Image and Text */}
        <div className="relative">
          <div className="mx-auto mb-6 w-56 sm:w-64 md:float-left md:mr-6 md:mb-4 lg:mr-8 lg:mb-6 lg:w-72">
            <Image
              alt="Rev. Fr. Roderick G. Mercurio, Director of MPPSI"
              className="h-full w-full rounded-2xl object-cover shadow-lg"
              height={288}
              sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 288px"
              src="/school-director-full.webp"
              width={288}
            />
          </div>

          {/* Director Message */}
          <div className="space-y-5">
            <p>Greetings to our students, parents, and valued stakeholders,</p>

            <p>
              As we embark on a new chapter in the journey of MPPSI, it gives me
              great pleasure to welcome you to our newly developed digital
              interface, a platform designed to connect, inform, and inspire our
              entire community.
            </p>

            <p>
              Transitioning into the digital space is both an exciting and
              challenging step for us. It requires adaptation, learning, and
              collaboration from everyone involved. Yet, we firmly believe that
              embracing this change is essential to keep pace with the evolving
              educational landscape. Through this website, we aim to enhance
              transparency, communication, and engagement among our students,
              parents, faculty, and partners.
            </p>

            <p>
              This platform will serve as more than just a source of
              information, it is a gateway to a more connected MPPSI community.
              Here, you can access updates, resources, announcements, and
              opportunities that reflect our continued commitment to excellence
              and innovation.
            </p>

            <p>
              We thank everyone who contributed their time, effort, and
              expertise to make this vision a reality. Let us move forward
              together with enthusiasm, resilience, and a shared goal of
              providing the best possible learning environment for our students.
            </p>

            <p>
              Together, we face the challenges of the digital era, and together,
              we will grow stronger.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Signature */}
        <div className="text-center">
          <p className="font-semibold text-lg text-primary">
            – Rev. Fr. Roderick G. Mercurio, LPT, MMEM, FRIEdr
          </p>
          <p className="text-base text-muted-foreground">Director, MPPSI</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
