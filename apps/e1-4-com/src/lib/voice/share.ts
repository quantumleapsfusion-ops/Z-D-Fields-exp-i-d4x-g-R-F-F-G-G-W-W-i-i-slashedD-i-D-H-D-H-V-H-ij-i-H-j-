import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/db";

export function newShareToken(): string {
  return randomBytes(18).toString("base64url");
}

/** Returns an active (non-revoked) share or `null`. */
export async function resolveShare(token: string) {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return null;
  const share = await prisma.share.findUnique({ where: { token } });
  if (!share || share.revokedAt) return null;
  return share;
}
