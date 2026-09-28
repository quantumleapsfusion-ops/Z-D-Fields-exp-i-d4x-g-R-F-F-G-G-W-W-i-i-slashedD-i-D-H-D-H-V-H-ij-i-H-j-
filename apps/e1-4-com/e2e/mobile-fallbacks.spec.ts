import { expect, test } from "@playwright/test";

import { loginAs } from "./helpers/auth";

/**
 * Mobile browser constraints, reproduced by patching the browser APIs the way
 * iOS Safari / Android Chrome behave. Runs in every project so the copy is
 * checked against each platform's user agent.
 */
test.describe("mobile microphone fallbacks", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await loginAs(context, baseURL!);
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
    page.on("dialog", (d) => void d.accept());
    await page.goto("/stream");

    const upload = page.waitForResponse(
      (r) => r.url().endsWith("/api/stream/segments") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Record" }).click();
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    await expect(page.getByTestId("recorder-error")).toHaveCount(0);
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Stop" }).click();

    const res = await upload;
    expect(res.status(), await res.text()).toBe(201);
    const { segment } = (await res.json()) as { segment: { mimeType: string } };
    // Chromium cannot actually mux MP4, so the recorder falls back to the browser
    // default; the point is that requesting an unsupported container never breaks
    // the flow and the server still receives a valid audio type.
    expect(segment.mimeType).toMatch(/^audio\/(webm|mp4|ogg)$/);

    await page.getByRole("button", { name: "Delete entire stream" }).click();
    await expect(page.getByText(/your stream is silent/i)).toBeVisible();
  });

  test("denied microphone permission shows platform-specific guidance", async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
    });
    await page.goto("/stream");
    await page.getByRole("button", { name: "Record" }).click();

    const alert = page.getByTestId("recorder-error");
    await expect(alert).toBeVisible();
    const text = (await alert.textContent()) ?? "";
    if (testInfo.project.name === "ios-safari-emulated") {
      expect(text).toContain("Settings › Safari › Microphone");
    } else if (testInfo.project.name === "android-chrome") {
      expect(text).toContain("lock icon");
    } else {
      expect(text).toMatch(/blocked/i);
    }
    expect(text).not.toContain("NotAllowedError");
    // Recorder is back to idle: Record is offered again and no mic is held.
    await expect(page.getByRole("button", { name: "Record" })).toBeEnabled();
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
    await page.goto("/stream");
    await page.getByRole("button", { name: "Record" }).click();
    await expect(page.getByTestId("recorder-error")).toContainText(/busy/i);

    // Second attempt (mic released) succeeds and clears the error.
    await page.getByRole("button", { name: "Record" }).click();
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    await expect(page.getByTestId("recorder-error")).toHaveCount(0);
    await page.getByRole("button", { name: "Stop" }).click();
    await expect(page.getByRole("button", { name: "Record" })).toBeVisible();
  });

  test("browsers without MediaRecorder (iOS < 14.3, some in-app browsers) disable Record", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // @ts-expect-error -- simulate old WebKit
      delete window.MediaRecorder;
    });
    await page.goto("/stream");
    await expect(page.getByRole("button", { name: "Record" })).toBeDisabled();
    await expect(page.getByTestId("recorder-error")).toContainText(
      /iOS 14\.3|does not support/i,
    );
  });

  test("backgrounding the tab (iOS kills capture) flushes the span instead of losing it", async ({
    page,
  }) => {
    page.on("dialog", (d) => void d.accept());
    await page.goto("/stream");

    const upload = page.waitForResponse(
      (r) => r.url().endsWith("/api/stream/segments") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Record" }).click();
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
    await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
    await page.getByRole("button", { name: "Stop" }).click();

    await page.getByRole("button", { name: "Delete entire stream" }).click();
    await expect(page.getByText(/your stream is silent/i)).toBeVisible();
  });
});
