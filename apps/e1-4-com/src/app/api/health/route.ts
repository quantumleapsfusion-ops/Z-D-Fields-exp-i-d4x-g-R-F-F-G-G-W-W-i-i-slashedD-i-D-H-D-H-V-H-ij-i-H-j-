import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { AVATARS_BUCKET, VOICE_BUCKET } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tables the app queries; a missing one means `prisma migrate deploy` has not run. */
const TABLES = [
  "users",
  "voice_streams",
  "voice_segments",
  "shares",
  "conversations",
  "conversation_members",
  "voice_notes",
  "boards",
  "ai_usage_events",
  "ai_budget_alerts",
  "contacts",
  "sessions",
  "voiceprints",
  "login_events",
  "_prisma_migrations",
] as const;

const ENV_VARS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const has = (name: string) => Boolean(process.env[name]?.trim());

/** Booleans only, never a value, so the URL shape is reported without the URL. */
function databaseUrlShape() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return {
      postgresScheme: url.protocol === "postgres:" || url.protocol === "postgresql:",
      poolerPort6543: url.port === "6543",
      pgbouncerParam: url.searchParams.get("pgbouncer") === "true",
    };
  } catch {
    return { postgresScheme: false, poolerPort6543: false, pgbouncerParam: false };
  }
}

async function checkDatabase() {
  if (!has("DATABASE_URL")) return { connected: false, tables: null };
  try {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      select table_name from information_schema.tables where table_schema = 'public'`;
    const present = new Set(rows.map((r) => r.table_name));
    return {
      connected: true,
      tables: Object.fromEntries(TABLES.map((t) => [t, present.has(t)])),
    };
  } catch {
    return { connected: false, tables: null };
  }
}

async function checkBuckets() {
  if (env.storage.provider === "local")
    return { provider: "local" as const, buckets: null };
  if (!has("NEXT_PUBLIC_SUPABASE_URL") || !has("SUPABASE_SERVICE_ROLE_KEY")) {
    return { provider: "supabase" as const, reachable: false, buckets: null };
  }
  try {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data, error } = await client.storage.listBuckets();
    if (error || !data)
      return { provider: "supabase" as const, reachable: false, buckets: null };
    const ids = new Set(data.map((b) => b.id));
    return {
      provider: "supabase" as const,
      reachable: true,
      buckets: {
        [VOICE_BUCKET]: ids.has(VOICE_BUCKET),
        [AVATARS_BUCKET]: ids.has(AVATARS_BUCKET),
      },
    };
  } catch {
    return { provider: "supabase" as const, reachable: false, buckets: null };
  }
}

/**
 * Deployment self-check. Reports only booleans: which variables are set, whether the database
 * answers, which tables exist and whether the storage buckets exist. Never echoes a value.
 */
export async function GET() {
  const [database, storage] = await Promise.all([checkDatabase(), checkBuckets()]);
  const tablesOk = database.tables
    ? Object.values(database.tables).every(Boolean)
    : false;
  const bucketsOk =
    storage.provider === "local" ||
    (storage.buckets ? Object.values(storage.buckets).every(Boolean) : false);
  const ok = database.connected && tablesOk && bucketsOk;
  return NextResponse.json(
    {
      ok,
      env: Object.fromEntries(ENV_VARS.map((n) => [n, has(n)])),
      databaseUrl: databaseUrlShape(),
      database,
      storage,
    },
    { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
