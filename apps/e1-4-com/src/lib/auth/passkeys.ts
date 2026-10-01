import "server-only";

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";

import { prisma } from "@/lib/db";
import { publicEnv } from "@/lib/env";

/**
 * Passkeys (WebAuthn), verified on our own server with @simplewebauthn/server. The device does
 * the personal verification (Face ID, fingerprint, PIN); we store only the public key.
 */

const CHALLENGE_TTL_MS = 5 * 60_000;

type Purpose = "register" | "login";

export function relyingParty() {
  const url = new URL(publicEnv.siteUrl);
  return { id: url.hostname, origin: url.origin, name: "e1-4" };
}

async function saveChallenge(purpose: Purpose, challenge: string, userId: string | null) {
  const now = new Date();
  await prisma.authChallenge.deleteMany({ where: { expiresAt: { lt: now } } });
  const row = await prisma.authChallenge.create({
    data: {
      purpose,
      challenge,
      userId,
      expiresAt: new Date(now.getTime() + CHALLENGE_TTL_MS),
    },
    select: { id: true },
  });
  return row.id;
}

/** Deletes the challenge (single use) and returns it if it's valid for this purpose/user. */
export async function consumeChallenge(
  id: string,
  purpose: Purpose,
  userId: string | null,
): Promise<string | null> {
  const row = await prisma.authChallenge.delete({ where: { id } }).catch(() => null);
  if (!row) return null;
  if (row.purpose !== purpose || row.userId !== userId) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;
  return row.challenge;
}

export class PasskeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasskeyError";
  }
}

export async function registrationOptions(
  userId: string,
): Promise<{ challengeId: string; options: PublicKeyCredentialCreationOptionsJSON }> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      handle: true,
      displayName: true,
      passkeys: { select: { id: true, transports: true } },
    },
  });
  const rp = relyingParty();
  const options = await generateRegistrationOptions({
    rpName: rp.name,
    rpID: rp.id,
    userName: user.handle ? `@${user.handle}` : `e1-4 ${userId.slice(0, 8)}`,
    userDisplayName: user.displayName ?? user.handle ?? "e1-4",
    userID: new TextEncoder().encode(userId),
    attestationType: "none",
    excludeCredentials: user.passkeys.map((p) => ({
      id: p.id,
      transports: p.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  return {
    challengeId: await saveChallenge("register", options.challenge, userId),
    options,
  };
}

export async function verifyRegistration(
  userId: string,
  challengeId: string,
  response: RegistrationResponseJSON,
): Promise<void> {
  const challenge = await consumeChallenge(challengeId, "register", userId);
  if (!challenge) throw new PasskeyError("expired");
  const rp = relyingParty();
  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: rp.origin,
    expectedRPID: rp.id,
    requireUserVerification: true,
  });
  if (!verified || !registrationInfo) throw new PasskeyError("unverified");
  const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
  await prisma.passkey.create({
    data: {
      id: credential.id,
      userId,
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ?? [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    },
  });
}

export async function authenticationOptions(): Promise<{
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}> {
  const rp = relyingParty();
  const options = await generateAuthenticationOptions({
    rpID: rp.id,
    userVerification: "required",
  });
  return { challengeId: await saveChallenge("login", options.challenge, null), options };
}

/** Verifies a sign-in assertion and returns the user id it proves. */
export async function verifyAuthentication(
  challengeId: string,
  response: AuthenticationResponseJSON,
): Promise<string> {
  const challenge = await consumeChallenge(challengeId, "login", null);
  if (!challenge) throw new PasskeyError("expired");
  const passkey = await prisma.passkey.findUnique({ where: { id: response.id } });
  if (!passkey) throw new PasskeyError("unknown");
  const rp = relyingParty();
  const { verified, authenticationInfo } = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: rp.origin,
    expectedRPID: rp.id,
    requireUserVerification: true,
    credential: {
      id: passkey.id,
      publicKey: new Uint8Array(passkey.publicKey),
      counter: passkey.counter,
      transports: passkey.transports as AuthenticatorTransportFuture[],
    },
  });
  if (!verified) throw new PasskeyError("unverified");
  await prisma.passkey.update({
    where: { id: passkey.id },
    data: { counter: authenticationInfo.newCounter, lastUsedAt: new Date() },
  });
  return passkey.userId;
}

export async function listPasskeys(userId: string) {
  return prisma.passkey.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, deviceType: true, createdAt: true, lastUsedAt: true },
  });
}

export async function removePasskey(userId: string, id: string): Promise<void> {
  await prisma.passkey.deleteMany({ where: { id, userId } });
}
