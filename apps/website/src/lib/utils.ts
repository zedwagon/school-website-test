export { cn, formatPH } from "@school/ui";

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
