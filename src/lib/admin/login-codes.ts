import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { company } from "@/lib/site-config";
import { LocalRedis, type Redis } from "@/lib/data/redis";
import { isEmailConfigured, type IntakeEnv } from "@/lib/integrations/env";
import { sendEmail, type SmtpSender } from "@/lib/integrations/email";
import { isAdminEmail, type AdminConfig } from "./config";

/**
 * One-time sign-in codes for the admin area, emailed through the site's existing mail setup.
 * Only a keyed hash of each code is stored (10-minute expiry, 5 attempts). Emails and IPs appear in storage keys
 * only as keyed hashes. Callers show the same message whether or not the address is an admin.
 */

export const CODE_TTL_SECONDS = 600;
export const MAX_CODE_ATTEMPTS = 5;
const WINDOW_SECONDS = 900;
const MAX_REQUESTS_PER_IP = 10;
const MAX_REQUESTS_PER_EMAIL = 5;

type Deps = { redis?: Redis; env: IntakeEnv; config: AdminConfig; fetchImpl?: typeof fetch; smtpSender?: SmtpSender };

// Without shared storage (no Upstash, no local data dir) codes live in this process only.
const processRedis = new LocalRedis();

const mac = (secret: Buffer, value: string) => createHmac("sha256", secret).update(value).digest("hex");

function keys(secret: Buffer, email: string) {
  const id = mac(secret, `email:${email.trim().toLowerCase()}`).slice(0, 32);
  return { code: `admin-login:code:${id}`, attempts: `admin-login:attempts:${id}`, requests: `admin-login:requests:${id}` };
}

export type RequestResult = "sent" | "rate_limited" | "not_admin" | "email_failed" | "disabled";

export async function requestLoginCode(email: string, ip: string, deps: Deps): Promise<RequestResult> {
  const { config, env } = deps;
  if (!config.secret || !config.emails.length || !isEmailConfigured(env)) return "disabled";
  const redis = deps.redis ?? processRedis;
  const k = keys(config.secret, email);
  const ipKey = `admin-login:ip:${mac(config.secret, `ip:${ip}`).slice(0, 32)}`;

  const [ipCount, , emailCount] = (await redis.exec([
    ["INCR", ipKey],
    ["EXPIRE", ipKey, WINDOW_SECONDS, "NX"],
    ["INCR", k.requests],
    ["EXPIRE", k.requests, WINDOW_SECONDS, "NX"],
  ])) as number[];
  if (Number(ipCount) > MAX_REQUESTS_PER_IP || Number(emailCount) > MAX_REQUESTS_PER_EMAIL) return "rate_limited";
  if (!isAdminEmail(email, config)) return "not_admin";

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await redis.exec([
    ["SET", k.code, mac(config.secret, `${k.code}:${code}`), "EX", CODE_TTL_SECONDS],
    ["DEL", k.attempts],
  ]);

  const sent = await sendEmail(
    {
      to: email.trim(),
      replyTo: email.trim(),
      subject: `Your ${company.displayName} admin sign-in code: ${code}`,
      text: [
        `Your ${company.displayName} admin sign-in code is: ${code}`,
        "",
        "It expires in 10 minutes and can be used once.",
        "If you didn't try to sign in, you can ignore this email — nobody can sign in without the code.",
      ].join("\n"),
      html: `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#101d35;line-height:1.6">
<p>Your ${company.displayName} admin sign-in code is:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
<p>It expires in 10 minutes and can be used once.</p>
<p style="color:#4a5a70;font-size:12px">If you didn't try to sign in, you can ignore this email — nobody can sign in without the code.</p>
</body></html>`,
    },
    env,
    deps.fetchImpl,
    deps.smtpSender,
  );
  return sent.ok ? "sent" : "email_failed";
}

/** True only for the current, unexpired code within the attempt limit. A code works once. */
export async function verifyLoginCode(email: string, code: string, deps: Pick<Deps, "redis" | "config">): Promise<boolean> {
  const { config } = deps;
  if (!config.secret || !/^\d{6}$/.test(code) || !isAdminEmail(email, config)) return false;
  const redis = deps.redis ?? processRedis;
  const k = keys(config.secret, email);

  const [stored, attempts] = await redis.exec([
    ["GET", k.code],
    ["INCR", k.attempts],
    ["EXPIRE", k.attempts, CODE_TTL_SECONDS, "NX"],
  ]);
  if (typeof stored !== "string") return false;
  if (Number(attempts) > MAX_CODE_ATTEMPTS) {
    await redis.exec([["DEL", k.code]]);
    return false;
  }
  const expected = Buffer.from(stored, "hex");
  const given = Buffer.from(mac(config.secret, `${k.code}:${code}`), "hex");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  await redis.exec([["DEL", k.code, k.attempts]]);
  return true;
}
