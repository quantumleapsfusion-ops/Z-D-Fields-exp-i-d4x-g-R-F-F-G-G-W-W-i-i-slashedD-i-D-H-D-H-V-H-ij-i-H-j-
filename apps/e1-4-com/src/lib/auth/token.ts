/** Name of the httpOnly cookie that carries a signed-in user's session. */
export const SESSION_COOKIE = "e14_session";

/** Sessions last half a year so a returning voice is still signed in. */
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 180;

const encoder = new TextEncoder();

function base64url(bytes: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** `<userId>.<expiresAtSeconds>.<HMAC-SHA256>` */
export async function createSessionToken(
  userId: string,
  secret: string,
  now = Date.now(),
): Promise<string> {
  const payload = `${userId}.${Math.floor(now / 1000) + SESSION_MAX_AGE_S}`;
  return `${payload}.${await sign(payload, secret)}`;
}

/** The user id in a genuine, unexpired token, otherwise null. */
export async function readSessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): Promise<string | null> {
  const parts = token?.split(".");
  if (!parts || parts.length !== 3) return null;
  const [userId, expires, signature] = parts;
  if (!userId || !/^\d+$/.test(expires) || Number(expires) * 1000 <= now) return null;
  return sameText(signature, await sign(`${userId}.${expires}`, secret)) ? userId : null;
}

/**
 * Signing key: `SESSION_SECRET` when set, otherwise derived from the service-role key (already a
 * server-only secret), so no extra configuration is needed. Null when neither is available.
 */
export function sessionSecret(): string | null {
  const explicit = process.env.SESSION_SECRET?.trim();
  if (explicit) return explicit;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return service ? `e1-4 session v1:${service}` : null;
}
