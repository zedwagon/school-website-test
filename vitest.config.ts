import { configDefaults, defineConfig } from "vitest/config";
import { config } from "dotenv";
import path from "node:path";

const parsed = config({ path: path.resolve(__dirname, "./scripts/.env.sandbox") }).parsed || {};

export default defineConfig({
  test: {
    testTimeout: 20000,
    exclude: [...configDefaults.exclude, "tmp/**"],
    env: {
      DATABASE_URL: parsed.DATABASE_URL || "",
    },
  },
});
