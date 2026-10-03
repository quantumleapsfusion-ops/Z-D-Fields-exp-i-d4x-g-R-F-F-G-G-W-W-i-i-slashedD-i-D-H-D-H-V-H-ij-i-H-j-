import { expect, test } from "@playwright/test";

import {
  cleanupE2eUsers,
  expectLoggedOut,
  loginAs,
  rememberSessionUser,
} from "./helpers/auth";
import { runFakeStorage } from "./helpers/run-fake-storage";

/**
 * The front door is a microphone: a visitor speaks to get in, and a signed-in person speaks to
 * Da Vinci. The fake microphone that Chromium is launched with plays a steady tone, which the
 * voiceprint code accepts as a voice, so the whole path runs without a human.
 */
runFakeStorage();

test.afterEach(async () => {
  await cleanupE2eUsers();
});

// The pin field behind the button is WebGL drawn in software on CI; slow its frame loop so the
// page stays responsive while a test drives it.
async function calmAnimation(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.requestAnimationFrame = (cb) =>
      window.setTimeout(() => cb(performance.now()), 200);
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
  });
}

test.describe("smoke: speak to enter → speak → stream", () => {
  // Decoding, voice matching and saving all happen after Stop, on a page that is also drawing
  // WebGL in software on CI. Give every test here three times the usual budget.
  test.slow();

  test("the front door is a microphone, not a form", async ({ page }) => {
    await calmAnimation(page);
    await page.goto("/");
    await expect(page).toHaveTitle(/e1-4/i);
    await expect(page.getByRole("button", { name: "Speak to enter" })).toBeEnabled();
    await expect(page.getByRole("status")).toHaveText("Tap and speak to enter");
    await expect(page.locator("input, textarea")).toHaveCount(0);
  });

  test("anonymous visitors are sent from /stream to the front door", async ({ page }) => {
    await calmAnimation(page);
    await expectLoggedOut(page);
    await expect(page.getByRole("button", { name: "Speak to enter" })).toBeVisible();
  });

  test("anonymous visitors are sent from /talk to the front door", async ({ page }) => {
    await page.goto("/talk");
    await expect(page).toHaveURL(/\/login\?next=%2Ftalk/);
  });

  test("speaking at the front door signs the voice in and keeps what was said", async ({
    page,
    context,
  }) => {
    await calmAnimation(page);
    await page.goto("/");
    const speak = page.getByRole("button", { name: "Speak to enter" });
    await expect(speak).toBeEnabled();
    await speak.click({ force: true });
    await expect(page.getByRole("status")).toHaveText("Listening");
    await page.waitForTimeout(2500);

    const voiceId = page.waitForResponse((r) => r.url().endsWith("/api/voice-id"));
    const firstEntry = page.waitForResponse(
      (r) => r.url().endsWith("/api/stream/segments") && r.request().method() === "POST",
    );
    const stoppedAt = Date.now();
    await page.getByRole("button", { name: "Stop" }).click({ force: true });

    const recognised = await voiceId;
    // Sign-in budget is 5 s from the tap; about 2.5 s of that is the person speaking.
    const answeredInMs = Date.now() - stoppedAt;
    console.log(`voice-id answered ${answeredInMs} ms after Stop`);
    expect(answeredInMs).toBeLessThan(2500);
    console.log(`voice-id answered ${recognised.status()} ${await recognised.text()}`);
    expect(recognised.status()).toBe(200);
    expect(await recognised.json()).toMatchObject({ ok: true });

    // A session cookie now exists, so the voice owns a stream and what it said is its first entry.
    await expect
      .poll(async () => (await context.cookies()).some((c) => c.name === "e14_session"))
      .toBe(true);
    expect((await firstEntry).status()).toBe(201);
    await expect(page).toHaveURL(/\/(journey)?$/, { timeout: 30_000 });

    // Remember the account so the test deletes it afterwards.
    const cookie = (await context.cookies()).find((c) => c.name === "e14_session")!;
    await rememberSessionUser(cookie.value);

    await page.goto("/stream");
    await expect(page).toHaveURL(/\/stream$/);
    await expect(page.getByRole("button", { name: "Entry 1" })).toBeVisible();
  });

  test("a signed-in person speaks on the home page and the entry lands in their stream", async ({
    page,
    context,
    baseURL,
  }) => {
    await loginAs(context, baseURL!);
    await calmAnimation(page);
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Your stream" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Talk" })).toBeVisible();

    const speak = page.getByRole("button", { name: "Speak to Da Vinci" });
    await expect(speak).toBeEnabled();
    const upload = page.waitForResponse(
      (r) => r.url().endsWith("/api/stream/segments") && r.request().method() === "POST",
    );
    await speak.click({ force: true });
    await expect(page.getByRole("status")).toContainText("Listening");
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Stop" }).click({ force: true });

    const res = await upload;
    expect(res.status(), await res.text()).toBe(201);
    const { segment } = (await res.json()) as {
      segment: { id: string; mimeType: string; durationMs: number };
    };
    expect(segment.mimeType).toMatch(/^audio\/(webm|mp4|ogg)$/);
    expect(segment.durationMs).toBeGreaterThan(1500);

    // The stored audio streams back to its owner.
    const audio = await page.request.get(`/api/stream/segments/${segment.id}/audio`);
    expect(audio.status()).toBe(200);
    expect((await audio.body()).byteLength).toBeGreaterThan(1000);

    // A stranger with no session gets nothing.
    const stranger = await page.context().browser()!.newContext();
    const forbidden = await stranger.request.get(
      `${baseURL}/api/stream/segments/${segment.id}/audio`,
    );
    expect([401, 403, 404]).toContain(forbidden.status());
    await stranger.close();

    await page.goto("/stream");
    await expect(page.getByRole("button", { name: "Entry 1" })).toBeVisible();
  });
});
