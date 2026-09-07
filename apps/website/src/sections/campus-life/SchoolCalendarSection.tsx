import { BookOpen, Calendar, CalendarDays, UserPlus } from "lucide-react";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";
import { SectionHeader } from "@/components/section-header";
import { calendarCategories } from "@/sections/campus-life/schoolCalendar";

// Month matching helper for chronological timeline sorting
const months: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function parseDateToCompare(dateStr: string): number {
  const str = dateStr.trim();
  if (!str || str === "-") return Infinity;

  const yearMatch = str.match(/\b(202\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 2025;

  const monthMatch = str.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i,
  );
  const month = monthMatch
    ? months[monthMatch[1].toLowerCase().substring(0, 3)]
    : 1;

  const dayMatch = str.match(/\b(\d{1,2})\b/);
  const day = dayMatch ? parseInt(dayMatch[1]) : 1;

  return year * 10000 + month * 100 + day;
}

export function SchoolCalendarSection() {
  // Helper to resolve icon and colors based on category title
  const getCategoryTheme = (categoryTitle: string) => {
    switch (categoryTitle) {
      case "Admission & Enrollment":
        return {
          icon: <UserPlus className="h-4.5 w-4.5" />,
          bgColor: "bg-red-50 text-red-600 border-red-100",
          iconColor: "text-red-600 bg-red-100/70",
          borderColor: "border-l-red-500",
          gradientBg: "bg-gradient-to-r from-white via-white to-red-50/[0.04]",
        };
      case "Holidays & Breaks":
        return {
          icon: <CalendarDays className="h-4.5 w-4.5" />,
          bgColor: "bg-amber-50 text-amber-700 border-amber-100",
          iconColor: "text-amber-700 bg-amber-100/70",
          borderColor: "border-l-amber-500",
          gradientBg:
            "bg-gradient-to-r from-white via-white to-amber-50/[0.04]",
        };
      default: // "School Calendar"
        return {
          icon: <BookOpen className="h-4.5 w-4.5" />,
          bgColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
          iconColor: "text-emerald-700 bg-emerald-100/70",
          borderColor: "border-l-emerald-500",
          gradientBg:
            "bg-gradient-to-r from-white via-white to-emerald-50/[0.04]",
        };
    }
  };

  return (
    <SectionWrapper bg="background" padding="pt-6 pb-24" width="7xl">
      <div className="mx-auto max-w-4xl space-y-16">
        {calendarCategories.map((category, catIdx) => {
          const theme = getCategoryTheme(category.title);

          // Local flattener and chronological sorter for this specific category
          const timelineItems: Array<{ event: string; date: string }> = [];
          category.items.forEach((item) => {
            if (item.firstSem && item.firstSem !== "-") {
              timelineItems.push({ event: item.event, date: item.firstSem });
            }
            if (item.secondSem && item.secondSem !== "-") {
              timelineItems.push({ event: item.event, date: item.secondSem });
            }
          });

          // Sort items chronologically
          const sortedItems = [...timelineItems].sort((a, b) => {
            return parseDateToCompare(a.date) - parseDateToCompare(b.date);
          });

          return (
            <div className="w-full" key={catIdx}>
              {/* Native Category SectionHeader */}
              <SectionHeader
                className="mb-10"
                hasMargin={true}
                title={category.title}
              />

              {/* Local Category Linear Timeline Track */}
              <div className="relative border-l-2 border-gray-100 ml-4 sm:ml-8 md:ml-10 pl-6 sm:pl-8 space-y-6 py-2">
                {sortedItems.map((item, idx) => (
                  <div
                    className="relative group transition-all duration-300"
                    key={idx}
                  >
                    {/* Floating Node Icon */}
                    <div
                      className={`absolute -left-[45px] sm:-left-[53px] top-1.5 h-9 w-9 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${theme.iconColor}`}
                    >
                      {theme.icon}
                    </div>

                    {/* Event Detail Card */}
                    <div
                      className={`rounded-2xl border border-gray-100 border-l-4 ${theme.borderColor} ${theme.gradientBg} p-5 md:p-6 shadow-xs hover:shadow-md hover:translate-x-1 transition-all duration-300`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: Schedule Date Badge */}
                        <div className="inline-flex items-center gap-1.5 font-extrabold text-xs sm:text-sm tracking-tight text-gray-900 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full shadow-2xs">
                          <Calendar className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                          {item.date}
                        </div>
                      </div>

                      {/* Event Detail Title */}
                      <h4 className="mt-4 text-base sm:text-lg font-black text-gray-900 leading-snug tracking-tight group-hover:text-primary transition-colors duration-200">
                        {item.event}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

              {/* Separator between major categories */}
              {catIdx < calendarCategories.length - 1 && (
                <div className="pt-16 flex justify-center">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
