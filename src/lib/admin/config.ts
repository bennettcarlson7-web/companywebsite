import { deriveSessionKey } from "./token";

/**
 * Admin access settings, read from the environment (server-only).
 *
 * - Who may sign in: `ADMIN_EMAILS` (comma-separated). If unset, the hiring inbox (`HIRING_EMAIL`) is the admin,
 *   since that person already receives every application.
 * - Session signing key: `ADMIN_SESSION_SECRET` (32+ characters). If unset, a key is derived from the Upstash
 *   token Vercel already provides, so no extra setup is needed; rotating that token signs everyone out.
 * Without either, the admin area stays switched off rather than falling back to anything guessable.
 */
export type AdminConfig = { emails: string[]; secret: Buffer | null };

const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));

export function readAdminConfig(env: Record<string, string | undefined> = process.env): AdminConfig {
  const explicit = list(env.ADMIN_EMAILS);
  const emails = explicit.length ? explicit : list(env.HIRING_EMAIL);

  const raw = env.ADMIN_SESSION_SECRET?.trim();
  const kvToken = (env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN)?.trim();
  const secret = raw && raw.length >= 32 ? deriveSessionKey(raw) : kvToken ? deriveSessionKey(kvToken) : null;

  return { emails, secret };
}

export function isAdminEnabled(config: AdminConfig = readAdminConfig()): boolean {
  return config.emails.length > 0 && config.secret !== null;
}

export function isAdminEmail(email: string, config: AdminConfig = readAdminConfig()): boolean {
  return config.emails.includes(email.trim().toLowerCase());
}
