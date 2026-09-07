import { cn } from "@/lib/utils";

interface HeroSectionProps {
  children?: React.ReactNode;
  className?: string;
  label?: string;
  title: string;
}

export function HeroText({
  title,
  label,
  children,
  className = "",
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-white py-20 sm:py-32",
        className,
      )}
    >
      {/* Soft Mesh-like Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[70%] w-[70%] animate-pulse rounded-full bg-red-50/50 blur-[120px]" />
        <div className="absolute -right-[10%] -bottom-[20%] h-[60%] w-[60%] animate-pulse rounded-full bg-red-100/30 blur-[120px]" />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-bounce rounded-full bg-red-50/20 blur-3xl opacity-50" />
        <div className="absolute left-1/2 top-1/2 h-[100%] w-[100%] -translate-x-1/2 -translate-y-1/2 animate-[spin_20s_linear_infinite] rounded-full bg-red-50/10 blur-[120px] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {label && (
          <div className="mb-6 sm:mb-8 flex justify-center animate-fade-in-up [animation-delay:200ms]">
            <span className="inline-flex items-center rounded-full bg-red-50/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-red-600 backdrop-blur-sm ring-1 ring-red-100 shadow-sm sm:text-xs">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              {label}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="relative mb-6 font-black tracking-tighter leading-[1.05] sm:mb-8 animate-fade-in-up [animation-delay:400ms]">
          <span className="relative z-10 block bg-gradient-to-br from-gray-950 via-gray-900 to-red-700 bg-clip-text py-1 text-transparent text-4xl text-balance sm:text-7xl lg:text-8xl">
            {title}
          </span>
        </h1>

        {children && (
          <div className="mt-8 sm:mt-10 flex justify-center">{children}</div>
        )}

        {/* Decorative Divider */}
        <div className="mt-8 sm:mt-10 flex justify-center animate-fade-in-up [animation-delay:800ms]">
          <div className="relative h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-red-200 to-transparent sm:w-32">
            <div className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
