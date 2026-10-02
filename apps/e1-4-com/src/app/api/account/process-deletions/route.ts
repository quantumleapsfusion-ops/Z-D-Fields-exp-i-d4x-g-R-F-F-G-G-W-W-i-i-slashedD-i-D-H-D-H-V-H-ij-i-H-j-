import { prisma } from "@/lib/db";
import { hardDeleteUser } from "@/lib/privacy/hard-delete";

const DELETION_DELAY_DAYS = 30;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.CRON_API_KEY;

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DELETION_DELAY_DAYS);

    const usersToDelete = await prisma.user.findMany({
      where: {
        scheduledDeleteAt: {
          lte: cutoffDate,
        },
      },
      select: { id: true },
    });

    let deleted = 0;
    for (const user of usersToDelete) {
      try {
        await hardDeleteUser(user.id);
        deleted += 1;
      } catch (error) {
        console.error(`Failed to delete user ${user.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      deleted,
      total: usersToDelete.length,
    });
  } catch (error) {
    console.error("Error processing deletions:", error);
    return Response.json(
      { success: false, error: "Failed to process deletions" },
      { status: 500 },
    );
  }
}
