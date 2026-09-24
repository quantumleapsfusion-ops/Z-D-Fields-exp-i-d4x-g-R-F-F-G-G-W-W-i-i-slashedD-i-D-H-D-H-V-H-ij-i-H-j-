'use server';

import type { Prisma } from '@prisma/client';

import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseBoardDocument, type BoardDocument } from '@/lib/chalkboard/types';

export type BoardSummary = { id: string; title: string; updatedAt: string };

async function authed(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error('Not signed in');
  return userId;
}

export async function listBoardsAction(): Promise<BoardSummary[]> {
  const userId = await authed();
  const boards = await prisma.board.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, updatedAt: true },
    take: 50,
  });
  return boards.map((b) => ({ ...b, updatedAt: b.updatedAt.toISOString() }));
}

export async function loadBoardAction(id: string): Promise<{ title: string; doc: BoardDocument }> {
  const userId = await authed();
  const board = await prisma.board.findFirst({ where: { id, userId } });
  if (!board) throw new Error('Board not found');
  return { title: board.title, doc: parseBoardDocument(board.data) };
}

export async function saveBoardAction(input: {
  id: string | null;
  title: string;
  doc: BoardDocument;
}): Promise<{ id: string }> {
  const userId = await authed();
  const doc = parseBoardDocument(input.doc);
  const data = doc as unknown as Prisma.InputJsonValue;
  const title = input.title.trim().slice(0, 120) || 'Untitled board';
  if (input.id) {
    const updated = await prisma.board.updateMany({
      where: { id: input.id, userId },
      data: { title, data },
    });
    if (updated.count > 0) return { id: input.id };
  }
  const board = await prisma.board.create({ data: { userId, title, data } });
  return { id: board.id };
}

export async function deleteBoardAction(id: string): Promise<void> {
  const userId = await authed();
  await prisma.board.deleteMany({ where: { id, userId } });
}
