import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** Signed admin session tokens (HMAC-SHA256). Pure functions, no framework imports. */

export const SESSION_TTL_SECONDS = 8 * 3600;

export type AdminSession = { email: string; expiresAt: number };

/** The signing key, derived from a configured secret so the raw value is never used directly. */
export function deriveSessionKey(raw: string): Buffer {
  return createHmac("sha256", raw).update("nextmade-admin-session-v1").digest();
}

const b64url = (b: Buffer) => b.toString("base64url");

export function signSession(email: string, secret: Buffer, now = Date.now()): string {
  const payload = b64url(Buffer.from(JSON.stringify({ e: email, x: now + SESSION_TTL_SECONDS * 1000, n: b64url(randomBytes(9)) })));
  const sig = b64url(createHmac("sha256", secret).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined, secret: Buffer, now = Date.now()): AdminSession | null {
  if (!token || token.length > 512) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { e?: unknown; x?: unknown };
    if (typeof e !== "string" || typeof x !== "number" || x <= now) return null;
    return { email: e, expiresAt: x };
  } catch {
    return null;
  }
}
