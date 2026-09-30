"use server";

import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { revalidatePath } from "next/cache";

import { getUserId } from "@/lib/auth/user";
import {
  authenticationOptions,
  PasskeyError,
  registrationOptions,
  removePasskey,
  verifyAuthentication,
  verifyRegistration,
} from "@/lib/auth/passkeys";
import { startSessionFor } from "@/lib/auth/session";

import type { ActionState } from "./profile";

async function authed(): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

function failure(error: unknown): ActionState {
  if (error instanceof PasskeyError) return { ok: false, message: error.message };
  console.error("passkey", error instanceof Error ? error.message : error);
  return { ok: false, message: "Passkey failed. Try again." };
}

export async function passkeyRegisterOptionsAction() {
  try {
    return { ok: true as const, ...(await registrationOptions(await authed())) };
  } catch (error) {
    return failure(error) as { ok: false; message: string };
  }
}

export async function passkeyRegisterVerifyAction(
  challengeId: string,
  response: RegistrationResponseJSON,
  name: string | null,
): Promise<ActionState> {
  try {
    await verifyRegistration(await authed(), challengeId, response, name);
    revalidatePath("/profile");
    return { ok: true, message: "Passkey added. You can sign in with it now." };
  } catch (error) {
    return failure(error);
  }
}

export async function passkeyLoginOptionsAction() {
  return authenticationOptions();
}

export async function passkeyLoginVerifyAction(
  challengeId: string,
  response: AuthenticationResponseJSON,
): Promise<ActionState> {
  try {
    await startSessionFor(await verifyAuthentication(challengeId, response));
    return { ok: true, message: "Signed in" };
  } catch (error) {
    return failure(error);
  }
}

export async function removePasskeyAction(id: string): Promise<void> {
  await removePasskey(await authed(), id);
  revalidatePath("/profile");
}
