import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const IV_BYTES = 12;
const TAG_BYTES = 16;

/** `VOICE_PROFILE_KEY` is 32 random bytes, base64-encoded (`openssl rand -base64 32`). */
export function parseProfileKey(base64: string): Buffer {
  const key = Buffer.from(base64, "base64");
  if (key.length !== 32)
    throw new Error("VOICE_PROFILE_KEY must be 32 bytes, base64-encoded");
  return key;
}

/** AES-256-GCM: `iv | tag | ciphertext`. Voiceprints are biometric data and never stored in the clear. */
export function sealProfile(profile: Uint8Array, key: Buffer): Uint8Array<ArrayBuffer> {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(profile), cipher.final()]);
  return new Uint8Array(Buffer.concat([iv, cipher.getAuthTag(), body]));
}

export function openProfile(sealed: Uint8Array, key: Buffer): Uint8Array {
  const buf = Buffer.from(sealed);
  const decipher = createDecipheriv("aes-256-gcm", key, buf.subarray(0, IV_BYTES));
  decipher.setAuthTag(buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
  return new Uint8Array(
    Buffer.concat([
      decipher.update(buf.subarray(IV_BYTES + TAG_BYTES)),
      decipher.final(),
    ]),
  );
}
