import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

/**
 * Smoke tests need a real Supabase project behind the app (sign-in is OAuth-only).
 *   E2E_BASE_URL       app under test (default: `next dev` on :3000, started automatically)
 *   E2E_STORAGE_STATE  Playwright storageState JSON of a signed-in browser; without it the
 *                      authenticated record -> share flow is skipped and only the public
 *                      surfaces (landing, login redirect) run.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    permissions: ["microphone"],
    launchOptions: {
      args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
