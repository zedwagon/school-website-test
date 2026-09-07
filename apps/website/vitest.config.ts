import { defineProject } from "vitest/config";
import path from "path";

export default defineProject({
  resolve: {
    alias: {
      "server-only": path.resolve(
        __dirname,
        "../../packages/api/test/empty.ts",
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.tsx"],
    exclude: ["**/e2e/**", "**/*.spec.ts"],
  },
});
