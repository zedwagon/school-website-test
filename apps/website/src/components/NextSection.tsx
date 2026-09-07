import { Button } from "@school/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface NextSectionProps {
  className?: string;
  href: string;
  message: string;
  subtitle?: string;
  title?: string;
}

export function NextSection({
  href,
  message,
  title,
  subtitle,
  className = "",
}: NextSectionProps) {
  return (
    <section
      className={`relative w-full overflow-hidden bg-primary mt-8 py-16 sm:mt-12 sm:py-20 ${className}`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Aurora-like Blobs */}
        <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] animate-pulse rounded-full bg-red-400/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] h-[400px] w-[400px] animate-pulse rounded-full bg-red-300/10 blur-[100px] [animation-delay:2s]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[600px] w-[600px] animate-pulse rounded-full bg-orange-500/10 blur-[150px] [animation-delay:4s]" />

        {/* Subtle Mesh/Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {title && (
            <h3 className="mb-2 font-extrabold text-4xl tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mx-auto mb-6 text-lg text-red-50/90 leading-relaxed drop-shadow-sm sm:text-xl lg:text-2xl">
              {subtitle}
            </p>
          )}

          <Link
            className="mx-auto block w-full max-w-sm sm:max-w-none sm:inline-block group"
            href={href}
          >
            <Button
              className="relative w-full max-w-full whitespace-normal h-auto overflow-hidden inline-flex items-center justify-center gap-3 bg-white px-6 py-4 text-base font-bold text-primary transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] sm:w-auto sm:whitespace-nowrap sm:px-8 sm:py-6 sm:text-xl"
              variant="secondary"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-center">
                {message}
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 sm:h-6 sm:w-6" />
              </span>

              {/* Subtle button shine effect on hover */}
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
