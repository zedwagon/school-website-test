import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number, includeSymbol = true) {
	const parsed = typeof amount === "string" ? parseFloat(amount) : amount;
	if (Number.isNaN(parsed) || parsed === 0) return "-";
	const formatted = parsed.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
	return includeSymbol ? `₱ ${formatted}` : formatted;
}
