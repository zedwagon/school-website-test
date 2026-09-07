import { Button } from "@school/ui";
import type { LucideIcon } from "lucide-react";

interface CTASectionProps {
  className?: string;
  icon?: LucideIcon;
  note?: string;
  primaryButtonHref: string;
  primaryButtonText: string;
  secondaryButtonHref: string;
  secondaryButtonText: string;
  subtitle: string;
  title: string;
}

export function CTASection({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
  note,
  icon: Icon,
  className = "",
}: CTASectionProps) {
  const renderTitle = () => {
    const mppsiIndex = title.indexOf("MPPSI");
    if (mppsiIndex !== -1) {
      const before = title.substring(0, mppsiIndex);
      const after = title.substring(mppsiIndex);
      return (
        <>
          {before}
          <span className="text-red-600">{after}</span>
        </>
      );
    }
    // Fallback: Split by last word
    const words = title.trim().split(/\s+/);
    if (words.length <= 1) {
      return <span className="text-red-600">{title}</span>;
    }
    const lastWord = words[words.length - 1];
    const rest = words.slice(0, words.length - 1).join(" ");
    return (
      <>
        {rest} <span className="text-red-600">{lastWord}</span>
      </>
    );
  };

  return (
    <section
      className={`relative overflow-hidden py-20 bg-gradient-to-br from-red-50/40 via-white to-gray-50/50 border-t border-b border-gray-100/80 ${className}`}
    >
      {/* Subtle decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-1/2 bg-gradient-to-r from-transparent via-red-200 to-transparent" />

      <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
        {/* Optional Icon */}
        {Icon && (
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
            <Icon className="h-6 w-6" />
          </div>
        )}

        {/* Title */}
        <h2 className="mb-4 font-black tracking-tight text-gray-900 text-3xl sm:text-4xl md:text-5xl leading-tight">
          {renderTitle()}
        </h2>

        {/* Subtitle */}
        <p className="mb-8 mx-auto max-w-2xl text-base text-gray-600 leading-relaxed sm:text-lg">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button
            asChild
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-6 rounded-xl shadow-sm transition-colors duration-200 cursor-pointer"
          >
            <a href={primaryButtonHref}>{primaryButtonText}</a>
          </Button>

          <Button
            asChild
            className="w-full sm:w-auto bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-6 rounded-xl shadow-sm transition-colors duration-200 cursor-pointer"
            variant="outline"
          >
            <a href={secondaryButtonHref}>{secondaryButtonText}</a>
          </Button>
        </div>

        {/* Optional Note */}
        {note && (
          <p className="mt-6 text-xs text-gray-500 leading-relaxed opacity-90">
            {note}
          </p>
        )}
      </div>
    </section>
  );
}
