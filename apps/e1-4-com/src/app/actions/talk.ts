"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserId } from "@/lib/auth/user";
import {
  createConversation,
  deleteOwnNotes,
  joinByInvite,
  leaveConversation,
  markRead,
  rotateInvite,
} from "@/lib/talk/conversations";

async function authed(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

export async function startConversationAction(formData: FormData): Promise<void> {
  const userId = await authed();
  const title = formData.get("title");
  const { id } = await createConversation(
    userId,
    typeof title === "string" ? title : null,
  );
  redirect(`/talk/${id}`);
}

export async function joinConversationAction(token: string): Promise<void> {
  const userId = await authed();
  const id = await joinByInvite(userId, token);
  if (!id) throw new Error("This invite link is no longer valid");
  redirect(`/talk/${id}`);
}

export async function markReadAction(conversationId: string): Promise<void> {
  await markRead(await authed(), conversationId);
}

export async function deleteNotesAction(noteIds: string[]): Promise<{ deleted: number }> {
  const deleted = await deleteOwnNotes(await authed(), noteIds);
  return { deleted };
}

export async function rotateInviteAction(
  conversationId: string,
): Promise<{ token: string }> {
  const token = await rotateInvite(await authed(), conversationId);
  if (!token) throw new Error("Conversation not found");
  return { token };
}

export async function leaveConversationAction(conversationId: string): Promise<void> {
  await leaveConversation(await authed(), conversationId);
  revalidatePath("/talk");
  redirect("/talk");
}
