import { expect, test } from "@playwright/test";

import { cleanupE2eUsers, loginAs } from "./helpers/auth";
import { runFakeStorage } from "./helpers/run-fake-storage";

/**
 * Phone browser constraints, reproduced by patching the browser APIs the way iOS Safari and
 * Android Chrome behave. Runs in every project so the wording is checked against each
 * platform's user agent. The home page has no text, so what the person is told lives in the
 * screen-reader status line next to the microphone.
 */
runFakeStorage();

const speakButton = "Speak to Da Vinci";

test.describe("mobile microphone fallbacks", () => {
  // Same slow-runner headroom as the smoke suite: software WebGL behind the microphone.
  test.slow();

  test.afterEach(async () => {
    await cleanupE2eUsers();
  });

  test.beforeEach(async ({ context, page, baseURL }) => {
    await loginAs(context, baseURL!);
    await page.addInitScript(() => {
      window.requestAnimationFrame = (cb) =>
        window.setTimeout(() => cb(performance.now()), 200);
      window.cancelAnimationFrame = (id) => window.clearTimeout(id);
    });
  });

  test("Safari-style codec support (no WebM, MP4 only) still records and uploads", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const original = MediaRecorder.isTypeSupported.bind(MediaRecorder);
      MediaRecorder.isTypeSupported = (type: string) =>
        type.startsWith("audio/mp4")
          ? true
          : type.startsWith("audio/webm")
            ? false
            : original(type);
    });
    await page.goto("/");

    const upload = page.waitForResponse(
      (r) => r.url().endsWith("/api/stream/segments") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: speakButton }).click({ force: true });
    await expect(page.getByRole("status")).toContainText("Listening");
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Stop" }).click({ force: true });

    const res = await upload;
    expect(res.status(), await res.text()).toBe(201);
    const { segment } = (await res.json()) as { segment: { mimeType: string } };
    // Chromium cannot actually mux MP4, so the recorder falls back to the browser default; the
    // point is that asking for an unsupported container never breaks the flow and the server
    // still receives a valid audio type.
    expect(segment.mimeType).toMatch(/^audio\/(webm|mp4|ogg)$/);
  });

  test("denied microphone permission shows platform-specific guidance", async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
    });
    await page.goto("/");
    await page.getByRole("button", { name: speakButton }).click({ force: true });

    const status = page.getByRole("status");
    await expect(status).toContainText(/blocked/i);
    const text = (await status.textContent()) ?? "";
    if (testInfo.project.name === "ios-safari-emulated") {
      expect(text).toContain("Settings › Safari › Microphone");
    } else if (testInfo.project.name === "android-chrome") {
      expect(text).toContain("lock icon");
    }
    expect(text).not.toContain("NotAllowedError");
    // Back to idle: the microphone is offered again and nothing is held open.
    await expect(page.getByRole("button", { name: speakButton })).toBeEnabled();
  });

  test("microphone busy in another app (Android) is reported and recoverable", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      let calls = 0;
      const real = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = (c) =>
        calls++ === 0
          ? Promise.reject(
              new DOMException("Could not start audio source", "NotReadableError"),
            )
          : real(c);
    });
    await page.goto("/");
    await page.getByRole("button", { name: speakButton }).click({ force: true });
    await expect(page.getByRole("status")).toContainText(/busy/i);

    // Second attempt (mic released) succeeds and clears the message.
    await page.getByRole("button", { name: speakButton }).click({ force: true });
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Listening");
    await page.getByRole("button", { name: "Stop" }).click({ force: true });
    await expect(page.getByRole("button", { name: speakButton })).toBeVisible();
  });

  test("browsers without MediaRecorder (iOS < 14.3, some in-app browsers) cannot start", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // @ts-expect-error -- simulate old WebKit
      delete window.MediaRecorder;
    });
    await page.goto("/");
    await expect(page.getByRole("button", { name: speakButton })).toBeDisabled();
    await expect(page.getByRole("status")).toContainText(/iOS 14\.3/);
  });

  test("backgrounding the tab (iOS kills capture) saves the span instead of losing it", async ({
    page,
  }) => {
    await page.goto("/");

    const upload = page.waitForResponse(
      (r) => r.url().endsWith("/api/stream/segments") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: speakButton }).click({ force: true });
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect((await upload).status()).toBe(201);
    await page.getByRole("button", { name: "Stop" }).click({ force: true });
    await page.goto("/stream");
    await expect(page.getByRole("button", { name: "Entry 1" })).toBeVisible();
  });
});
