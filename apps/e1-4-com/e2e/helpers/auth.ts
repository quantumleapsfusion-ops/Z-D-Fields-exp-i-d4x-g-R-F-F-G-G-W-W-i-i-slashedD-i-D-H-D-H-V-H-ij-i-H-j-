import { createHash, randomBytes, randomUUID } from "node:crypto";

import type { BrowserContext, Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

import { Pool } from "pg";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required for the e2e suite`);
  return v;
}

// Plain `pg` rather than the generated Prisma client: Playwright loads specs as CommonJS, which
// cannot evaluate the generated client's `import.meta`.
export const db = new Pool({ connectionString: requireEnv("DATABASE_URL") });
const testUsers = new Set<string>();
let storageClient: ReturnType<typeof createClient> | null = null;

function getStorageClient() {
  storageClient ??= createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  return storageClient;
}

async function removePrefix(bucket: "voice" | "avatars", prefix: string) {
  const paths: string[] = [];

  async function walk(directory: string) {
    let offset = 0;
    for (;;) {
      const { data, error } = await getStorageClient()
        .storage.from(bucket)
        .list(directory, { limit: 1000, offset });
      if (error) throw error;
      if (!data?.length) break;
      for (const entry of data) {
        const path = `${directory}/${entry.name}`;
        if (entry.id === null) await walk(path);
        else paths.push(path);
      }
      if (data.length < 1000) break;
      offset += 1000;
    }
  }

  await walk(prefix);
  for (let i = 0; i < paths.length; i += 1000) {
    const { error } = await getStorageClient()
      .storage.from(bucket)
      .remove(paths.slice(i, i + 1000));
    if (error) throw error;
  }
}

export async function loginAs(context: BrowserContext, baseURL: string): Promise<string> {
  const { hostname, protocol } = new URL(baseURL);
  const {
    rows: [user],
  } = await db.query<{ id: string }>(
    "insert into users (id, display_name, updated_at) values (gen_random_uuid(), $1, now()) returning id",
    [`E2E ${randomUUID()}`],
  );
  testUsers.add(user.id);

  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await db.query(
    "insert into sessions (id, token_hash, user_id, expires_at, last_seen_at) values (gen_random_uuid(), $1, $2, $3, $4)",
    [
      createHash("sha256").update(token).digest("hex"),
      user.id,
      new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      now,
    ],
  );
  await context.addCookies([
    {
      name: "e14_session",
      value: token,
      domain: hostname,
      path: "/",
      httpOnly: true,
      secure: protocol === "https:",
      sameSite: "Lax",
    },
  ]);
  return user.id;
}

/**
 * Adopts the account behind a session the app itself created (for example by a voice signing in at
 * the front door), so `cleanupE2eUsers` removes it with the rest.
 */
export async function rememberSessionUser(sessionToken: string): Promise<string> {
  const {
    rows: [session],
  } = await db.query<{ user_id: string }>(
    "select user_id from sessions where token_hash = $1",
    [createHash("sha256").update(sessionToken).digest("hex")],
  );
  if (!session) throw new Error("no session for that cookie");
  testUsers.add(session.user_id);
  return session.user_id;
}

export async function expectLoggedOut(page: Page): Promise<void> {
  await page.goto("/stream");
  await page.waitForURL(/\/login\?next=%2Fstream/);
}

export async function cleanupE2eUsers(): Promise<void> {
  for (const userId of testUsers) {
    await removePrefix("voice", userId);
    await removePrefix("avatars", userId);
    await db.query("delete from users where id = $1", [userId]);
    testUsers.delete(userId);
  }
}
