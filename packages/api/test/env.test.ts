import { it, expect } from "vitest";
it("has db url", () => {
  console.log("TEST DB URL:", process.env.DATABASE_URL);
  expect(process.env.DATABASE_URL).toBeDefined();
});
