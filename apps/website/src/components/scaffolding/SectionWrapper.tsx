import { cn } from "@/lib/utils";

export interface SectionWrapperProps {
  bg?: "background" | "muted" | "transparent" | "primary";
  children: React.ReactNode;
  className?: string;
  padding?: string;
  width?: "4xl" | "7xl";
}

export function SectionWrapper({
  children,
  bg = "background",
  width = "4xl",
  padding = "pt-0 pb-20",
  className,
}: SectionWrapperProps) {
  const bgClasses: Record<string, string> = {
    background: "bg-background",
    muted: "bg-muted",
    transparent: "bg-transparent",
    primary: "bg-primary text-primary-foreground",
  };

  return (
    <section className={cn(padding, bgClasses[bg])}>
      <div
        className={cn(
          width === "4xl" ? "max-w-4xl" : "max-w-7xl",
          "mx-auto px-4 sm:px-6 lg:px-8",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
