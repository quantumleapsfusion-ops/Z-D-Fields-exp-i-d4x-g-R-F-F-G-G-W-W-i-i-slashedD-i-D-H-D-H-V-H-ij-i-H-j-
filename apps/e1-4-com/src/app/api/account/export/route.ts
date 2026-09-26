import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth/user";
import { exportUserData } from "@/lib/privacy/hard-delete";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await exportUserData(userId);
  return new NextResponse(
    JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2),
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="e1-4-export-${userId}.json"`,
      },
    },
  );
}
