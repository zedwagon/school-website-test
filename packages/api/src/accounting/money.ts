/** Convert a decimal amount to integer cents without floating-point rounding. */
export function toCents(value: string | number): number {
	const text = String(value).trim();
	if (!/^-?\d+(?:\.\d{1,2})?$/.test(text)) throw new Error("Amount must have at most two decimal places");
	const negative = text.startsWith("-");
	const [whole, fraction = ""] = (negative ? text.slice(1) : text).split(".");
	const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
	if (!Number.isSafeInteger(cents)) throw new Error("Amount is too large");
	return negative ? -cents : cents;
}

export function fromCents(cents: number): string {
	if (!Number.isSafeInteger(cents)) throw new Error("Invalid amount in cents");
	const absolute = Math.abs(cents);
	return `${cents < 0 ? "-" : ""}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}
