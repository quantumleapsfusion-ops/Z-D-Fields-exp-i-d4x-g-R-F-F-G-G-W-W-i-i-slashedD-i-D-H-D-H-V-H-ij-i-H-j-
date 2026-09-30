"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserId } from "@/lib/auth/user";
import { addContact, openDirect, removeContact } from "@/lib/people/contacts";
import { claimHandle, findByHandle } from "@/lib/people/handles";

import type { ActionState } from "./profile";

async function authed(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

export async function claimHandleAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const result = await claimHandle(await authed(), String(form.get("handle") ?? ""));
  if (!result.ok) return result;
  revalidatePath("/profile");
  revalidatePath("/talk/contacts");
  return { ok: true, message: `You're @${result.handle}` };
}

export async function addContactByHandleAction(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const userId = await authed();
  const person = await findByHandle(String(form.get("handle") ?? ""));
  if (!person) return { ok: false, message: "No one has that handle" };
  if (!(await addContact(userId, person.id))) {
    return { ok: false, message: "That's you" };
  }
  revalidatePath("/talk/contacts");
  return { ok: true, message: `Added ${person.name}` };
}

export async function addContactAction(contactId: string): Promise<void> {
  await addContact(await authed(), contactId);
  revalidatePath("/talk/contacts");
}

export async function removeContactAction(contactId: string): Promise<void> {
  await removeContact(await authed(), contactId);
  revalidatePath("/talk/contacts");
}

/** Opens the one-to-one conversation with someone (creating it the first time). */
export async function openDirectAction(otherId: string): Promise<void> {
  const id = await openDirect(await authed(), otherId);
  if (!id) throw new Error("Can't open that conversation");
  revalidatePath("/talk");
  redirect(`/talk/${id}`);
}
