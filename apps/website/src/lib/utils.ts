import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Build an image path by inserting the name in the middle.
 * @param base Base folder path (must end with '/')
 * @param name Name or filename to insert
 * @param ext Optional extension (default: '.webp')
 * @returns full path string
 */
export function getStaffImagePath(
  name: string,
  base = "/about/administration-faculty/",
  ext = ".webp",
): string {
  return `${base}${name}${ext}`;
}

/**
 * Format a date to Philippine Time (GMT+8).
 * This ensures users always see times in Philippine timezone regardless of their device settings.
 * @param date - ISO string, Date object, or null/undefined
 * @param options - Intl.DateTimeFormatOptions to customize the output format
 * @returns Formatted string in Philippine Time, or "—" if date is null/undefined
 */
export function formatPH(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  },
) {
  if (!date) return "—";
  try {
    // PostgreSQL returns timestamps without a timezone suffix (e.g. "2026-04-12 11:52:58.351277").
    // When JavaScript's Date constructor receives a string with no timezone indicator it treats
    // it as LOCAL time, which means the subsequent Asia/Manila conversion would be wrong.
    // We normalise the string to a proper UTC ISO 8601 value before parsing:
    //   1. Replace the space separator with "T" (ISO 8601 requires "T")
    //   2. Append "Z" if there is no existing timezone offset (+/-) or "Z" already
    let normalized: string;
    if (typeof date === "string") {
      const s = date.replace(" ", "T");
      normalized = /[Z+\-]\d*$/.test(s) ? s : `${s}Z`;
    } else {
      normalized = date instanceof Date ? date.toISOString() : String(date);
    }
    return new Intl.DateTimeFormat("en-PH", {
      ...options,
      timeZone: "Asia/Manila",
    }).format(new Date(normalized));
  } catch (error) {
    console.error("Error formatting date for PH timezone:", error);
    return "—";
  }
}
