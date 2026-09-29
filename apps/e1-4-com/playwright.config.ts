import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Smoke suite against a real Next.js server and the live Supabase project.
 * Requires the Supabase env plus E2E_TEST_EMAIL / E2E_TEST_PASSWORD (an
 * email+password user created via the Auth admin API). Chromium is launched
 * with a fake microphone so MediaRecorder produces real audio.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        permissions: ["microphone"],
        launchOptions: {
          args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
        },
      },
    },
    {
      // Android Chrome emulation: touch, mobile UA, fake mic.
      name: "android-chrome",
      use: {
        ...devices["Pixel 7"],
        permissions: ["microphone"],
        launchOptions: {
          args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
        },
      },
    },
    {
      // iOS Safari *emulation* on Chromium: viewport + UA only. The WebM→MP4
      // and permission fallbacks are asserted by injecting Safari's behaviour
      // (see tests/e2e/mobile-fallbacks.spec.ts). Real WebKit is not shipped
      // in CI because Playwright's WebKit build has no fake microphone.
      name: "ios-safari-emulated",
      use: {
        ...devices["iPhone 14"],
        defaultBrowserType: "chromium",
        permissions: ["microphone"],
        launchOptions: {
          args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
        },
      },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
