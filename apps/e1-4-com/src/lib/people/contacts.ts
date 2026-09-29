import "server-only";

import { prisma } from "@/lib/db";
import { newShareToken } from "@/lib/voice/share";

import { personSelect, toPersonCard, type PersonCard } from "./handles";

/** Order-independent key for the one-to-one conversation between two people. */
export function directKeyFor(a: string, b: string): string {
  return [a, b].sort().join(":");
}

export async function addContact(ownerId: string, contactId: string): Promise<boolean> {
  if (ownerId === contactId) return false;
  await prisma.contact.upsert({
    where: { ownerId_contactId: { ownerId, contactId } },
    update: {},
    create: { ownerId, contactId },
  });
  return true;
}

export async function removeContact(ownerId: string, contactId: string): Promise<void> {
  await prisma.contact.deleteMany({ where: { ownerId, contactId } });
}

export async function isContact(ownerId: string, contactId: string): Promise<boolean> {
  return (await prisma.contact.count({ where: { ownerId, contactId } })) > 0;
}

export async function listContacts(ownerId: string): Promise<PersonCard[]> {
  const rows = await prisma.contact.findMany({
    where: { ownerId },
    include: { contact: { select: personSelect } },
  });
  return rows
    .map((r) => toPersonCard(r.contact))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Opens (creating on first use) the one-to-one conversation with `otherId` and makes sure the
 * caller is in it. The other person is only added when it's created: if they left, they stay out
 * until they open it again themselves — leaving works as "stop hearing from this person".
 */
export async function openDirect(
  userId: string,
  otherId: string,
): Promise<string | null> {
  if (userId === otherId) return null;
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    select: { id: true },
  });
  if (!other) return null;
  const directKey = directKeyFor(userId, otherId);

  for (let attempt = 0; ; attempt++) {
    try {
      const existing = await prisma.conversation.findUnique({
        where: { directKey },
        select: { id: true },
      });
      if (!existing) {
        const created = await prisma.conversation.create({
          data: {
            directKey,
            inviteToken: newShareToken(),
            createdById: userId,
            members: {
              create: [{ userId, lastReadAt: new Date() }, { userId: otherId }],
            },
          },
          select: { id: true },
        });
        await addContact(userId, otherId);
        return created.id;
      }
      await prisma.conversationMember.upsert({
        where: { conversationId_userId: { conversationId: existing.id, userId } },
        update: {},
        create: { conversationId: existing.id, userId, lastReadAt: new Date() },
      });
      await addContact(userId, otherId);
      return existing.id;
    } catch (error) {
      // Lost a race: both opened it at once (P2002), or the last member was deleting it (P2003).
      const code = (error as { code?: string }).code;
      const retryable = code === "P2002" || code === "P2003";
      if (!retryable || attempt >= 2) throw error;
    }
  }
}
