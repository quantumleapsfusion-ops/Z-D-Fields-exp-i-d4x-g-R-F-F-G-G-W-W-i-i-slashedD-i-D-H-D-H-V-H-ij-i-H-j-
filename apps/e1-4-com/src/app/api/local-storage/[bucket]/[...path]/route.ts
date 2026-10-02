import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth/user";
import { env } from "@/lib/env";
import { AVATARS_BUCKET, VOICE_BUCKET, storage, type StorageBucket } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKETS: readonly StorageBucket[] = [AVATARS_BUCKET, VOICE_BUCKET];

/**
 * Serves objects kept on disk by the local storage provider. Avatars are public, as on Supabase;
 * voice needs a session. Does not exist at all when storage is Supabase.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> },
) {
  if (env.storage.provider !== "local") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { bucket, path } = await params;
  if (!BUCKETS.includes(bucket as StorageBucket)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (bucket === VOICE_BUCKET && !(await getUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const blob = await storage.download(bucket as StorageBucket, path.join("/"));
    return new Response(blob, {
      headers: {
        "Content-Type": blob.type || "application/octet-stream",
        "Content-Length": String(blob.size),
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
