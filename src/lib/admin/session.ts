import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAdminEmail, readAdminConfig } from "./config";
import { SESSION_TTL_SECONDS, signSession, verifySession, type AdminSession } from "./token";

export { SESSION_TTL_SECONDS, signSession, verifySession, type AdminSession };

/**
 * Stateless admin sessions: a signed (HMAC-SHA256) token in an HttpOnly, SameSite=Lax cookie that expires after
 * 8 hours. Every admin page, Server Action, and route handler calls `requireAdmin()` itself; nothing trusts the
 * browser. The email is re-checked against the admin list on every request, so removing someone from
 * ADMIN_EMAILS revokes access immediately.
 */

export const SESSION_COOKIE = "nm_admin";

/** The signed-in admin, or null. Reads the request cookie, so call it inside a Suspense boundary. */
export async function getAdminSession(): Promise<AdminSession | null> {
  // Read the request first, unconditionally: deciding before touching request data would let Next.js prerender
  // the answer at build time (e.g. a permanent "signed out" redirect when no key is set during the build).
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await connection(); // expiry checks read the clock: always evaluate per request, never in a prerender
  const config = readAdminConfig();
  if (!config.secret) return null;
  const session = verifySession(token, config.secret);
  return session && isAdminEmail(session.email, config) ? session : null;
}

/** Guard for every admin page, action, and route: redirects to sign-in when there's no valid session. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function startSession(email: string): Promise<void> {
  const { secret } = readAdminConfig();
  if (!secret) throw new Error("admin_disabled");
  (await cookies()).set(SESSION_COOKIE, signSession(email.toLowerCase(), secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.VERCEL === "1",
    // Only sent to the admin area, never with public page requests.
    path: "/admin",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}
