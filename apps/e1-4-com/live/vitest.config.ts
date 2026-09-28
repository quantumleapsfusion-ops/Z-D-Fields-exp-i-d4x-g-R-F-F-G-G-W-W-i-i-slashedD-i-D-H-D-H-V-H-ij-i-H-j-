import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Live checks against the real Supabase project. Never run in CI; see docs/live-e2e.md.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("../src/test/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    root: fileURLToPath(new URL("..", import.meta.url)),
    include: ["live/*.live.test.ts"],
    environment: "node",
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
