import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { hardDeleteUser } from "@/lib/privacy/hard-delete";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Execute scheduled account deletions. Called by Vercel scheduled functions or external cron.
 * Requires CRON_SECRET for security (should only be called from internal systems).
 */
export async function POST(request: NextRequest) {
  // Verify the request is from a trusted source
  const authHeader = request.headers.get("authorization");
  const secret = authHeader?.replace("Bearer ", "");

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find users scheduled for deletion whose time has come
    const now = new Date();
    const usersToDelete = await prisma.user.findMany({
      where: {
        deletionScheduledFor: {
          lte: now,
        },
      },
      select: { id: true },
    });

    let deleted = 0;
    for (const user of usersToDelete) {
      try {
        await hardDeleteUser(user.id);
        deleted++;
      } catch (error) {
        console.error(`Failed to delete user ${user.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error executing scheduled deletions:", error);
    return NextResponse.json(
      { error: "Failed to execute deletions" },
      { status: 500 }
    );
  }
}
