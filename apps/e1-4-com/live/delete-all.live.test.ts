import { createHash, randomUUID } from "node:crypto";

import { afterAll, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { hardDeleteUser } = await import("@/lib/privacy/hard-delete");
const { prisma } = await import("@/lib/db");
const { AVATARS_BUCKET, VOICE_BUCKET, storage } = await import("@/lib/storage");

let userId = "";
let contactId = "";

it("removes a user's rows and Storage objects", async () => {
  const user = await prisma.user.create({
    data: { displayName: `Delete test ${randomUUID()}` },
    select: { id: true },
  });
  userId = user.id;
  const contact = await prisma.user.create({
    data: { displayName: `Delete test contact ${randomUUID()}` },
    select: { id: true },
  });
  contactId = contact.id;

  const stream = await prisma.voiceStream.create({ data: { userId } });
  const segmentPath = `${userId}/${stream.id}/${randomUUID()}.webm`;
  const avatarPath = `${userId}/avatar.png`;
  const notePath = `${userId}/talk/${randomUUID()}/${randomUUID()}.webm`;
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  );
  const audio = Buffer.from("voice data");
  await Promise.all([
    storage.upload({
      bucket: AVATARS_BUCKET,
      path: avatarPath,
      body: png,
      contentType: "image/png",
    }),
    storage.upload({
      bucket: VOICE_BUCKET,
      path: segmentPath,
      body: audio,
      contentType: "audio/webm",
    }),
    storage.upload({
      bucket: VOICE_BUCKET,
      path: notePath,
      body: audio,
      contentType: "audio/webm",
    }),
  ]);

  const segment = await prisma.voiceSegment.create({
    data: {
      streamId: stream.id,
      index: 0,
      audioPath: segmentPath,
      mimeType: "audio/webm",
      sizeBytes: audio.byteLength,
      durationMs: 1000,
      startedAt: new Date(),
      endedAt: new Date(),
    },
    select: { id: true },
  });
  await prisma.share.create({
    data: {
      token: randomUUID().replaceAll("-", ""),
      userId,
      segmentId: segment.id,
    },
  });
  await prisma.voiceprint.create({
    data: { userId, print: [0.1, 0.2, 0.3], samples: 1, modelVersion: "mfcc-v1" },
  });
  await prisma.session.create({
    data: {
      userId,
      tokenHash: createHash("sha256").update(randomUUID()).digest("hex"),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.loginEvent.create({
    data: {
      userId,
      method: "voice",
      success: true,
      clientHash: createHash("sha256").update("delete-all-test").digest("hex"),
      device: "live test",
    },
  });
  await prisma.board.create({
    data: { userId, title: "Delete test", data: { elements: [] } },
  });
  await prisma.contact.create({ data: { ownerId: userId, contactId } });
  const conversation = await prisma.conversation.create({
    data: {
      inviteToken: randomUUID().replaceAll("-", ""),
      createdById: userId,
      members: { create: { userId } },
    },
    select: { id: true },
  });
  await prisma.voiceNote.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      audioPath: notePath,
      mimeType: "audio/webm",
      sizeBytes: audio.byteLength,
      durationMs: 1000,
      startedAt: new Date(),
      endedAt: new Date(),
    },
  });
  await prisma.aiUsageEvent.create({
    data: {
      userId,
      feature: "delete-all-live-test",
      tier: "EVERYDAY",
      model: "test",
      inputTokens: 0,
      outputTokens: 0,
      costMicros: BigInt(0),
    },
  });

  const result = await hardDeleteUser(userId);

  expect(result.dbRowsRemoved).toBe(true);
  const rows = {
    users: await prisma.user.count({ where: { id: userId } }),
    sessions: await prisma.session.count({ where: { userId } }),
    voiceprints: await prisma.voiceprint.count({ where: { userId } }),
    loginEvents: await prisma.loginEvent.count({ where: { userId } }),
    voiceStreams: await prisma.voiceStream.count({ where: { userId } }),
    voiceSegments: await prisma.voiceSegment.count({ where: { stream: { userId } } }),
    shares: await prisma.share.count({ where: { userId } }),
    boards: await prisma.board.count({ where: { userId } }),
    contacts: await prisma.contact.count({
      where: { OR: [{ ownerId: userId }, { contactId: userId }] },
    }),
    conversationMembers: await prisma.conversationMember.count({ where: { userId } }),
    voiceNotes: await prisma.voiceNote.count({ where: { senderId: userId } }),
    aiUsageEvents: await prisma.aiUsageEvent.count({ where: { userId } }),
  };

  expect(rows).toEqual({
    users: 0,
    sessions: 0,
    voiceprints: 0,
    loginEvents: 0,
    voiceStreams: 0,
    voiceSegments: 0,
    shares: 0,
    boards: 0,
    contacts: 0,
    conversationMembers: 0,
    voiceNotes: 0,
    aiUsageEvents: 0,
  });
  expect(await storage.listAll(VOICE_BUCKET, userId)).toEqual([]);
  expect(await storage.listAll(AVATARS_BUCKET, userId)).toEqual([]);
});

afterAll(async () => {
  if (userId && (await prisma.user.findUnique({ where: { id: userId } }))) {
    await hardDeleteUser(userId);
  }
  if (contactId) await prisma.user.deleteMany({ where: { id: contactId } });
  await prisma.$disconnect();
});
