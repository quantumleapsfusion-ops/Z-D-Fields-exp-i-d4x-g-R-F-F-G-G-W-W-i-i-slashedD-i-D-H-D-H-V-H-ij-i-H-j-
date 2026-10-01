"use server";

import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

import { getUserId } from "@/lib/auth/user";
import {
  authenticationOptions,
  PasskeyError,
  registrationOptions,
  verifyAuthentication,
  verifyRegistration,
} from "@/lib/auth/passkeys";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/** The result of a passkey step. No wording: the page answers with a glyph and a vibration. */
export type PasskeyResult = { ok: boolean };

function failed(error: unknown): PasskeyResult {
  if (!(error instanceof PasskeyError)) console.error("[passkey]", error);
  return { ok: false };
}

export async function hasPasskeyAction(): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  return (await prisma.passkey.count({ where: { userId } })) > 0;
}

export async function passkeyRegisterOptionsAction() {
  const userId = await getUserId();
  if (!userId) return null;
  try {
    return await registrationOptions(userId);
  } catch (error) {
    failed(error);
    return null;
  }
}

export async function passkeyRegisterVerifyAction(
  challengeId: string,
  response: RegistrationResponseJSON,
): Promise<PasskeyResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false };
  try {
    await verifyRegistration(userId, challengeId, response);
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}

export async function passkeyLoginOptionsAction() {
  return authenticationOptions();
}

export async function passkeyLoginVerifyAction(
  challengeId: string,
  response: AuthenticationResponseJSON,
): Promise<PasskeyResult> {
  try {
    await createSession(await verifyAuthentication(challengeId, response));
    return { ok: true };
  } catch (error) {
    return failed(error);
  }
}
