import "server-only";

import { prisma } from "@/lib/db";
import { AVATARS_BUCKET, storage } from "@/lib/storage";

const HANDLE = /^[a-z0-9_]{3,20}$/;

const RESERVED = new Set([
  "admin",
  "administrator",
  "api",
  "e1_4",
  "e14",
  "earth1",
  "help",
  "login",
  "me",
  "official",
  "root",
  "security",
  "staff",
  "support",
  "system",
  "talk",
]);

/** `" @Zach_E "` → `"zach_e"`. */
export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

/** Why a (normalized) handle can't be used, or null when it's fine. */
export function handleProblem(handle: string): string | null {
  if (!HANDLE.test(handle)) return "3–20 letters, numbers or _";
  if (RESERVED.has(handle)) return "That handle is reserved";
  return null;
}

export type PersonCard = {
  id: string;
  handle: string;
  name: string;
  image: string | null;
};

export function toPersonCard(u: {
  id: string;
  handle: string | null;
  displayName: string | null;
  avatarPath: string | null;
}): PersonCard {
  return {
    id: u.id,
    handle: u.handle ?? "",
    name: u.displayName ?? (u.handle ? `@${u.handle}` : "Earthling"),
    image: u.avatarPath ? storage.getPublicUrl(AVATARS_BUCKET, u.avatarPath) : null,
  };
}

export const personSelect = {
  id: true,
  handle: true,
  displayName: true,
  avatarPath: true,
} as const;

export type ClaimResult = { ok: true; handle: string } | { ok: false; message: string };

export async function claimHandle(userId: string, raw: string): Promise<ClaimResult> {
  const handle = normalizeHandle(raw);
  const problem = handleProblem(handle);
  if (problem) return { ok: false, message: problem };
  try {
    await prisma.user.update({ where: { id: userId }, data: { handle } });
    return { ok: true, handle };
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return { ok: false, message: `@${handle} is taken` };
    }
    throw error;
  }
}

/** Exact lookup only: handles are shared deliberately, not searched. */
export async function findByHandle(raw: string): Promise<PersonCard | null> {
  const handle = normalizeHandle(raw);
  if (handleProblem(handle) === "3–20 letters, numbers or _") return null;
  const user = await prisma.user.findUnique({ where: { handle }, select: personSelect });
  return user ? toPersonCard(user) : null;
}
