import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Live checks against the real Supabase project. Never run in CI; see docs/live-e2e.md.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    root: path.resolve(__dirname, ".."),
    include: ["live/*.live.test.ts"],
    environment: "node",
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
