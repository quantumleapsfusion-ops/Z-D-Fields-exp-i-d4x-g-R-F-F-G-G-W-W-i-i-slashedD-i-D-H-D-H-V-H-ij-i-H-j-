import { createHash, randomBytes, randomUUID } from "node:crypto";

import type { BrowserContext, Page } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import { PrismaClient } from "../../src/generated/prisma/client";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required for the e2e suite`);
  return v;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireEnv("DATABASE_URL") }),
});
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

export async function loginAs(context: BrowserContext, baseURL: string): Promise<void> {
  const { hostname, protocol } = new URL(baseURL);
  const user = await prisma.user.create({
    data: { displayName: `E2E ${randomUUID()}` },
    select: { id: true },
  });
  testUsers.add(user.id);

  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await prisma.session.create({
    data: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
      userId: user.id,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      lastSeenAt: now,
    },
  });
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
}

export async function expectLoggedOut(page: Page): Promise<void> {
  await page.goto("/stream");
  await page.waitForURL(/\/login\?next=%2Fstream/);
}

export async function cleanupE2eUsers(): Promise<void> {
  for (const userId of testUsers) {
    await removePrefix("voice", userId);
    await removePrefix("avatars", userId);
    await prisma.user.deleteMany({ where: { id: userId } });
    testUsers.delete(userId);
  }
  await prisma.$disconnect();
}
