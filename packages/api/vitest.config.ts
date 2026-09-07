import { defineProject } from "vitest/config";
import { config } from "dotenv";
import path from "path";
console.log("VITEST CONFIG DIRNAME:", __dirname);

// Load staging DB URL before tests start
const envPath = path.resolve(__dirname, "../../scripts/.env.sandbox");
const parsedEnv = config({ path: envPath }).parsed || {};

if (parsedEnv.DATABASE_URL) {
  process.env.DATABASE_URL = parsedEnv.DATABASE_URL;
}

export default defineProject({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "./test/empty.ts"),
    },
  },
  test: {
    environment: "node",
    env: {
      JWT_SECRET: "test_secret_for_vitest_mocking_only",
      DATABASE_URL: process.env.DATABASE_URL || "",
    },
    setupFiles: [path.resolve(__dirname, "./test/setup.ts")],
    globals: true,
  },
});
