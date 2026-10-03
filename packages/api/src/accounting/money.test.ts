import { expect, it } from "vitest";
import { fromCents, toCents } from "./money";
it.each([["0", 0], ["1.01", 101], ["0.90", 90], ["-12.34", -1234], ["9999999999.99", 999999999999]])("converts %s to integer cents", (amount, cents) => {
 expect(toCents(amount as string)).toBe(cents);
 expect(toCents(fromCents(cents as number))).toBe(cents);
});
it("settles exact final cents and produces consistent rounded half salary", () => {
 expect(toCents("1.00") - toCents("0.90")).toBe(toCents("0.10"));
 const half = Math.round(toCents("1.01") / 2);
 expect(fromCents(half)).toBe("0.51");
 expect(fromCents(half - toCents("0.01"))).toBe("0.50");
});
it.each(["1.001", "NaN", "1e2", "12junk", "9007199254740991.00"])("rejects unsupported amount %s", (amount) => {
 expect(() => toCents(amount)).toThrow();
});
