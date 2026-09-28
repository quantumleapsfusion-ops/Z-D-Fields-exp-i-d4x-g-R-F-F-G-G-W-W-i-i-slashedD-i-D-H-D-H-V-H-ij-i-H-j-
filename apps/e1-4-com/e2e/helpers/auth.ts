import type { BrowserContext, Page } from "@playwright/test";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v)
    throw new Error(`${name} is required for the e2e suite (see playwright.config.ts)`);
  return v;
}

/**
 * Signs in with email+password through Supabase and returns the exact cookies
 * `@supabase/ssr` would set in the browser, so the Next.js proxy/server
 * components see a real session. The login page only offers OAuth buttons
 * (Google/Facebook/Microsoft), which cannot be driven headlessly, so the
 * smoke suite authenticates via this password grant instead.
 */
export async function supabaseSessionCookies(): Promise<CookieToSet[]> {
  const jar: CookieToSet[] = [];
  const supabase = createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => jar.map(({ name, value }) => ({ name, value })),
        setAll: (cookies) => {
          for (const c of cookies) {
            const i = jar.findIndex((j) => j.name === c.name);
            if (i >= 0) jar[i] = c;
            else jar.push(c);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({
    email: requireEnv("E2E_TEST_EMAIL"),
    password: requireEnv("E2E_TEST_PASSWORD"),
  });
  if (error) throw new Error(`Supabase password sign-in failed: ${error.message}`);
  if (jar.length === 0) throw new Error("Supabase sign-in produced no session cookies");
  return jar;
}

export async function loginAs(context: BrowserContext, baseURL: string): Promise<void> {
  const { hostname } = new URL(baseURL);
  const cookies = await supabaseSessionCookies();
  await context.addCookies(
    cookies.map(({ name, value }) => ({
      name,
      value,
      domain: hostname,
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    })),
  );
}

export async function expectLoggedOut(page: Page): Promise<void> {
  await page.goto("/stream");
  await page.waitForURL(/\/login\?next=%2Fstream/);
}
