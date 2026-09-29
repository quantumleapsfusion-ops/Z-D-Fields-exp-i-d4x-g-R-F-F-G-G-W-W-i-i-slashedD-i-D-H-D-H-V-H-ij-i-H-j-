import "server-only";

import type { Prisma, VoiceNote } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { AVATARS_BUCKET, VOICE_BUCKET, storage } from "@/lib/storage";
import { getTranscriber } from "@/lib/stt";
import { newShareToken } from "@/lib/voice/share";
import { extensionFor } from "@/lib/voice/stream";

import { isLive } from "./presence";

export type NoteDTO = {
  id: string;
  senderId: string;
  liveId: string | null;
  durationMs: number;
  startedAt: string;
  createdAt: string;
  mimeType: string;
  transcription: string | null;
  transcriptionStatus: VoiceNote["transcriptionStatus"];
};

export type MemberDTO = {
  id: string;
  name: string;
  image: string | null;
  you: boolean;
  /** Current live stream id when the member is streaming right now. */
  liveId: string | null;
};

export type ConversationSummary = {
  id: string;
  title: string;
  members: MemberDTO[];
  lastNoteAt: string | null;
  unread: number;
};

export type ThreadDTO = {
  id: string;
  title: string;
  inviteToken: string;
  members: MemberDTO[];
  notes: NoteDTO[];
};

export function toNoteDTO(n: VoiceNote): NoteDTO {
  return {
    id: n.id,
    senderId: n.senderId,
    liveId: n.liveId,
    durationMs: n.durationMs,
    startedAt: n.startedAt.toISOString(),
    createdAt: n.createdAt.toISOString(),
    mimeType: n.mimeType,
    transcription: n.transcription,
    transcriptionStatus: n.transcriptionStatus,
  };
}

const memberInclude = {
  user: { select: { id: true, displayName: true, email: true, avatarPath: true } },
} satisfies Prisma.ConversationMemberInclude;

type MemberRow = Prisma.ConversationMemberGetPayload<{ include: typeof memberInclude }>;

function toMemberDTO(m: MemberRow, viewerId: string, now = Date.now()): MemberDTO {
  return {
    id: m.userId,
    name: m.user.displayName ?? m.user.email?.split("@")[0] ?? "Earthling",
    image: m.user.avatarPath
      ? storage.getPublicUrl(AVATARS_BUCKET, m.user.avatarPath)
      : null,
    you: m.userId === viewerId,
    liveId: m.liveId && isLive(m.liveAt, now) ? m.liveId : null,
  };
}

/** Explicit title, else the other members' names ("Just you" until someone joins). */
function titleFor(title: string | null, members: MemberDTO[]): string {
  if (title) return title;
  const others = members.filter((m) => !m.you).map((m) => m.name);
  return others.length > 0 ? others.join(", ") : "Just you (so far)";
}

export const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export async function createConversation(userId: string, title?: string | null) {
  return prisma.conversation.create({
    data: {
      title: title?.trim().slice(0, 120) || null,
      inviteToken: newShareToken(),
      createdById: userId,
      members: { create: { userId, lastReadAt: new Date() } },
    },
    select: { id: true },
  });
}

/** Membership row, or null when `userId` is not in the conversation. */
export async function getMembership(userId: string, conversationId: string) {
  return prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
}

/** Conversation behind an invite link, for the join screen. */
export async function findByInvite(token: string) {
  if (!INVITE_TOKEN_PATTERN.test(token)) return null;
  return prisma.conversation.findUnique({
    where: { inviteToken: token },
    include: { members: { include: memberInclude } },
  });
}

export async function joinByInvite(
  userId: string,
  token: string,
): Promise<string | null> {
  const conversation = await findByInvite(token);
  if (!conversation) return null;
  await prisma.conversationMember.upsert({
    where: { conversationId_userId: { conversationId: conversation.id, userId } },
    update: {},
    create: { conversationId: conversation.id, userId },
  });
  return conversation.id;
}

export async function rotateInvite(userId: string, conversationId: string) {
  if (!(await getMembership(userId, conversationId))) return null;
  const { inviteToken } = await prisma.conversation.update({
    where: { id: conversationId },
    data: { inviteToken: newShareToken() },
    select: { inviteToken: true },
  });
  return inviteToken;
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    include: {
      conversation: { include: { members: { include: memberInclude } } },
    },
  });
  const now = Date.now();
  const summaries = await Promise.all(
    memberships.map(async (mine) => {
      const c = mine.conversation;
      const members = c.members.map((m) => toMemberDTO(m, userId, now));
      const unread = await prisma.voiceNote.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          ...(mine.lastReadAt ? { createdAt: { gt: mine.lastReadAt } } : {}),
        },
      });
      return {
        id: c.id,
        title: titleFor(c.title, members),
        members,
        lastNoteAt: (c.lastNoteAt ?? c.createdAt).toISOString(),
        unread,
      };
    }),
  );
  return summaries.sort((a, b) => (b.lastNoteAt ?? "").localeCompare(a.lastNoteAt ?? ""));
}

/** Members plus notes created at or after `since` (all notes when omitted). Null if not a member. */
export async function getThread(
  userId: string,
  conversationId: string,
  since?: Date,
): Promise<ThreadDTO | null> {
  if (!(await getMembership(userId, conversationId))) return null;
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: { include: memberInclude, orderBy: { joinedAt: "asc" } },
      notes: {
        where: since ? { createdAt: { gte: since } } : undefined,
        orderBy: [{ startedAt: "asc" }, { id: "asc" }],
      },
    },
  });
  if (!conversation) return null;
  const members = conversation.members.map((m) => toMemberDTO(m, userId));
  return {
    id: conversation.id,
    title: titleFor(conversation.title, members),
    inviteToken: conversation.inviteToken,
    members,
    notes: conversation.notes.map(toNoteDTO),
  };
}

export async function markRead(userId: string, conversationId: string) {
  await prisma.conversationMember.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

/** Starts (liveId) or ends (null) the member's live presence in a conversation. */
export async function setLive(
  userId: string,
  conversationId: string,
  liveId: string | null,
) {
  const { count } = await prisma.conversationMember.updateMany({
    where: { conversationId, userId },
    data: liveId ? { liveId, liveAt: new Date() } : { liveId: null, liveAt: null },
  });
  return count > 0;
}

type AppendNoteInput = {
  userId: string;
  conversationId: string;
  liveId: string | null;
  audio: Uint8Array;
  mimeType: string;
  durationMs: number;
  startedAt: Date;
  endedAt: Date;
};

/** Stores one clip (a whole voice note, or one part of a live stream). Blob first, then the row. */
export async function appendNote(input: AppendNoteInput): Promise<VoiceNote | null> {
  if (!(await getMembership(input.userId, input.conversationId))) return null;
  const transcriber = getTranscriber();
  const id = crypto.randomUUID();
  // First path segment must be the sender's uid (Storage RLS + hardDeleteUser prefix purge).
  const audioPath = `${input.userId}/talk/${input.conversationId}/${id}.${extensionFor(input.mimeType)}`;

  await storage.upload({
    bucket: VOICE_BUCKET,
    path: audioPath,
    body: input.audio,
    contentType: input.mimeType,
  });
  try {
    const now = new Date();
    const [note] = await prisma.$transaction([
      prisma.voiceNote.create({
        data: {
          id,
          conversationId: input.conversationId,
          senderId: input.userId,
          liveId: input.liveId,
          audioPath,
          mimeType: input.mimeType,
          sizeBytes: input.audio.byteLength,
          durationMs: Math.max(0, Math.round(input.durationMs)),
          startedAt: input.startedAt,
          endedAt: input.endedAt,
          transcriptionStatus: transcriber ? "PENDING" : "SKIPPED",
        },
      }),
      prisma.conversation.update({
        where: { id: input.conversationId },
        data: { lastNoteAt: now },
      }),
      // Sending counts as reading; a live part also refreshes the live heartbeat.
      prisma.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: input.userId,
          },
        },
        data: input.liveId
          ? { lastReadAt: now, liveId: input.liveId, liveAt: now }
          : { lastReadAt: now },
      }),
    ]);
    return note;
  } catch (error) {
    await storage.remove(VOICE_BUCKET, [audioPath]);
    throw error;
  }
}

export async function transcribeNote(noteId: string): Promise<void> {
  const transcriber = getTranscriber();
  if (!transcriber) {
    await prisma.voiceNote.update({
      where: { id: noteId },
      data: { transcriptionStatus: "SKIPPED" },
    });
    return;
  }
  const note = await prisma.voiceNote.findUnique({ where: { id: noteId } });
  if (!note) return;
  try {
    const blob = await storage.download(VOICE_BUCKET, note.audioPath);
    const { text } = await transcriber.transcribe(
      new Uint8Array(await blob.arrayBuffer()),
      note.mimeType,
    );
    await prisma.voiceNote.update({
      where: { id: noteId },
      data: {
        transcription: text,
        transcriptionStatus: "DONE",
        transcriptionError: null,
      },
    });
  } catch (error) {
    console.error(`[talk] transcription failed for ${noteId}`, error);
    await prisma.voiceNote.update({
      where: { id: noteId },
      data: {
        transcriptionStatus: "FAILED",
        transcriptionError:
          error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
      },
    });
  }
}

/** A note the viewer may listen to (they are a member of its conversation). */
export async function findAudibleNote(userId: string, noteId: string) {
  return prisma.voiceNote.findFirst({
    where: { id: noteId, conversation: { members: { some: { userId } } } },
    select: { audioPath: true, mimeType: true },
  });
}

/** Unsends the sender's own notes: blobs, then rows. Returns how many were removed. */
export async function deleteOwnNotes(userId: string, noteIds: string[]): Promise<number> {
  const notes = await prisma.voiceNote.findMany({
    where: { id: { in: noteIds }, senderId: userId },
    select: { id: true, audioPath: true },
  });
  if (notes.length === 0) return 0;
  await storage.remove(
    VOICE_BUCKET,
    notes.map((n) => n.audioPath),
  );
  await prisma.voiceNote.deleteMany({ where: { id: { in: notes.map((n) => n.id) } } });
  return notes.length;
}

/** Destroys a conversation (every note's audio, then the rows) once nobody is left in it. */
export async function deleteConversationIfEmpty(
  conversationId: string,
): Promise<boolean> {
  const remaining = await prisma.conversationMember.count({ where: { conversationId } });
  if (remaining > 0) return false;
  const notes = await prisma.voiceNote.findMany({
    where: { conversationId },
    select: { audioPath: true },
  });
  if (notes.length > 0) {
    await storage.remove(
      VOICE_BUCKET,
      notes.map((n) => n.audioPath),
    );
  }
  await prisma.conversation.deleteMany({ where: { id: conversationId } });
  return true;
}

/** Leaves a conversation. Your notes stay for the others; the last one out deletes everything. */
export async function leaveConversation(userId: string, conversationId: string) {
  await prisma.conversationMember.deleteMany({ where: { conversationId, userId } });
  await deleteConversationIfEmpty(conversationId);
}
