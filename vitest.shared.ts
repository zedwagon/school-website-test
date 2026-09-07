import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "./packages/api/test/empty.ts"),
    },
  },
  test: {
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**", "**/*.spec.ts"],
  },
});
