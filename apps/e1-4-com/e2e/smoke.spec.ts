import { expect, test } from "@playwright/test";

import { expectLoggedOut, loginAs } from "./helpers/auth";

test.describe("smoke: login → record → share", () => {
  test("landing renders and links into the app", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/e1-4/i);
    await expect(page.locator('a[href="/stream"]').first()).toBeVisible();
  });

  test("anonymous visitors are bounced from /stream to /login", async ({ page }) => {
    await expectLoggedOut(page);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with/i }).first()).toBeVisible();
  });

  test("a signed-in user records a segment and generates a share link", async ({
    page,
    context,
    baseURL,
  }) => {
    await loginAs(context, baseURL!);
    page.on("dialog", (d) => void d.accept());

    await page.goto("/stream");
    await expect(page).toHaveURL(/\/stream$/);
    await expect(page.getByRole("heading", { name: /voice stream/i })).toBeVisible();

    // Start clean: the shared test user may have leftovers from an aborted run.
    const wipe = page.getByRole("button", { name: "Delete entire stream" });
    if (await wipe.isVisible()) {
      await wipe.click();
      await expect(wipe).toBeHidden();
    }

    const record = page.getByRole("button", { name: "Record" });
    await expect(record).toBeEnabled();

    const upload = page.waitForResponse(
      (r) => r.url().endsWith("/api/stream/segments") && r.request().method() === "POST",
    );
    await record.click();
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    await expect(page.getByTestId("recorder-error")).toHaveCount(0);
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Stop" }).click();

    const res = await upload;
    expect(res.status(), await res.text()).toBe(201);
    const { segment } = (await res.json()) as {
      segment: { id: string; mimeType: string; durationMs: number; audioPath: string };
    };
    expect(segment.mimeType).toMatch(/^audio\/(webm|mp4|ogg)$/);
    expect(segment.durationMs).toBeGreaterThan(1500);

    // The uploaded segment appears on the timeline with its actions.
    const shareSegment = page.getByRole("button", { name: "Share", exact: true }).first();
    await expect(shareSegment).toBeVisible();

    // Stored audio streams back through the signed-URL proxy.
    const audio = await page.request.get(`/api/stream/segments/${segment.id}/audio`);
    expect(audio.status()).toBe(200);
    expect((await audio.body()).byteLength).toBeGreaterThan(1000);

    // Share one segment.
    await shareSegment.click();
    await page.getByRole("button", { name: "Create link" }).click();
    const linkInput = page.locator("input[readonly]").first();
    await expect(linkInput).toHaveValue(/\/s\/[A-Za-z0-9_-]{16,}$/);
    const link = await linkInput.inputValue();

    // The link works for a stranger (fresh context, no cookies).
    const stranger = await page.context().browser()!.newContext();
    const strangerPage = await stranger.newPage();
    await strangerPage.goto(link);
    await expect(
      strangerPage.getByRole("heading", { name: /shared a moment of their stream/i }),
    ).toBeVisible();
    // Stranger cannot reach the owner's private API.
    const forbidden = await strangerPage.request.get(
      `/api/stream/segments/${segment.id}/audio`,
    );
    expect([401, 403, 404]).toContain(forbidden.status());
    await stranger.close();

    // Close the segment popover (it overlaps the footer on phone viewports), then share the whole stream.
    await shareSegment.click();
    await expect(linkInput).toBeHidden();
    await page.getByRole("button", { name: "Share whole stream" }).click();
    await page.getByRole("button", { name: "Create link" }).click();
    await expect(page.locator("input[readonly]").last()).toHaveValue(
      /\/s\/[A-Za-z0-9_-]{16,}$/,
    );

    // Cleanup so the shared test account does not accumulate audio.
    await page.getByRole("button", { name: "Delete entire stream" }).click();
    await expect(page.getByText(/your stream is silent/i)).toBeVisible();
  });
});
