import { existsSync } from "node:fs";

import { expect, test } from "@playwright/test";

const storageState = process.env.E2E_STORAGE_STATE;
const signedIn = Boolean(storageState && existsSync(storageState));

test.describe("public surfaces", () => {
  test("landing renders and links into the app", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/e1-4/i);
    await expect(page.locator('a[href="/stream"]').first()).toBeVisible();
  });

  test("protected routes bounce to /login with a return path", async ({ page }) => {
    await page.goto("/stream");
    await expect(page).toHaveURL(/\/login\?next=%2Fstream/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with/i }).first(),
    ).toBeVisible();
  });
});

test.describe("login -> record -> share", () => {
  test.skip(!signedIn, "set E2E_STORAGE_STATE to a signed-in storageState.json to run");
  test.use({ storageState });

  test("records a segment and publishes a share link", async ({ page, context }) => {
    await page.goto("/stream");
    await expect(page).toHaveURL(/\/stream$/);

    await page.getByRole("button", { name: "Record" }).click();
    await expect(page.getByText(/^Recording/)).toBeVisible();
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Stop" }).click();

    const segment = page.getByRole("button", { name: "Share" }).first();
    await expect(segment).toBeVisible({ timeout: 30_000 });
    await segment.click();
    await page.getByRole("button", { name: "Create link" }).click();

    const url = await page.locator("input[readonly]").inputValue();
    expect(url).toMatch(/\/s\/[A-Za-z0-9_-]{8,64}$/);

    const visitor = await context.browser()!.newContext();
    const shared = await visitor.newPage();
    await shared.goto(url);
    await expect(shared).toHaveURL(url);
    await expect(shared.locator("audio, [data-audio-dock]").first()).toBeAttached();
    await visitor.close();
  });
});
