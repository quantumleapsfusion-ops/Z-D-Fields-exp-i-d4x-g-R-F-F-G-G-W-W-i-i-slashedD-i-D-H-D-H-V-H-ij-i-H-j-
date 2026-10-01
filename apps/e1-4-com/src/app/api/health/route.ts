import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { livenessMode } from "@/lib/voiceprint/liveness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tables the sign-in and save path cannot work without. */
const REQUIRED_TABLES = [
  "users",
  "sessions",
  "voiceprints",
  "login_events",
  "auth_challenges",
  "passkeys",
  "voice_streams",
  "voice_segments",
];

/**
 * Whether this deployment is set up to sign people in and save recordings. Reports only what is
 * missing, by name, never a secret or a value: a missing migration or env variable is otherwise
 * invisible, because the app answers it with a shake and a vibration, not words.
 */
export async function GET() {
  const missing: string[] = [];
  for (const name of [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    if (!process.env[name]) missing.push(`env:${name}`);
  }
  if (process.env.DATABASE_URL) {
    try {
      const rows = await prisma.$queryRaw<{ table_name: string }[]>`
        select table_name from information_schema.tables where table_schema = 'public'`;
      const present = new Set(rows.map((r) => r.table_name));
      for (const table of REQUIRED_TABLES) {
        if (!present.has(table))
          missing.push(`table:${table} (run prisma migrate deploy)`);
      }
    } catch {
      missing.push("database:unreachable");
    }
  }
  const liveness = livenessMode();
  if (liveness === "fail") missing.push("liveness:needs speech-to-text (STT_PROVIDER)");
  return NextResponse.json(
    { ok: missing.length === 0, missing, liveness },
    { status: missing.length === 0 ? 200 : 503 },
  );
}
