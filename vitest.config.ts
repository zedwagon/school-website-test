import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import path from "path";

const parsed = config({ path: path.resolve(__dirname, "./scripts/.env.sandbox") }).parsed || {};

export default defineConfig({
  test: {
    testTimeout: 20000,
    env: {
      DATABASE_URL: parsed.DATABASE_URL || "",
    },
  },
});
