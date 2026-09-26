import { expect, test } from "@playwright/test";

test.describe("public surface", () => {
  test("homepage renders the brand tagline and pitch", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("earth life-forms");
    await expect(page.getByText("A social network with no typing.")).toBeVisible();
  });

  test("login page offers the three OAuth doors", async ({ page }) => {
    await page.goto("/login");
    for (const label of ["Google", "Facebook", "Microsoft"]) {
      await expect(
        page.getByRole("button", { name: `Continue with ${label}` }),
      ).toBeVisible();
    }
  });

  test("login page surfaces a provider error from the query string", async ({ page }) => {
    await page.goto("/login?error=access_denied");
    await expect(page.getByText("access_denied")).toBeVisible();
  });

  test("privacy page is reachable", async ({ page }) => {
    const res = await page.goto("/privacy");
    expect(res?.status()).toBe(200);
  });
});

test.describe("auth guards", () => {
  for (const path of ["/profile", "/stream", "/davinci", "/chalkboard"]) {
    test(`anonymous visit to ${path} redirects to /login?next=`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(
        new RegExp(`/login\\?next=${encodeURIComponent(path)}$`),
      );
    });
  }

  test("/auth/callback without a code bounces to /login with an error", async ({
    page,
  }) => {
    await page.goto("/auth/callback");
    await expect(page).toHaveURL(/\/login\?error=missing_code$/);
  });

  test("/auth/callback forwards the provider's error description", async ({ page }) => {
    await page.goto(
      "/auth/callback?error=access_denied&error_description=User%20cancelled",
    );
    await expect(page).toHaveURL(/\/login\?error=User%20cancelled$/);
    await expect(page.getByText("User cancelled")).toBeVisible();
  });
});

test.describe("API guards (unauthenticated)", () => {
  test("voice segments API requires a session", async ({ request }) => {
    expect((await request.get("/api/stream/segments")).status()).toBe(401);
    expect((await request.post("/api/stream/segments", { multipart: {} })).status()).toBe(
      401,
    );
  });

  test("Da Vinci draw API requires a session", async ({ request }) => {
    const res = await request.post("/api/davinci/draw", {
      data: { transcript: "", newText: "sun" },
    });
    expect(res.status()).toBe(401);
  });

  test("Gravity superpose API is hidden while the feature flag is off", async ({
    request,
  }) => {
    const res = await request.post("/api/gravity/superpose", { data: { text: "x" } });
    expect(res.status()).toBe(404);
  });

  test("account export requires a session", async ({ request }) => {
    expect((await request.get("/api/account/export")).status()).toBe(401);
  });
});
