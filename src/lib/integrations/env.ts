import { company } from "@/lib/site-config";

/**
 * Server-only configuration for lead and application handling. Never import this from a Client Component:
 * these values are secrets or private routing details.
 *
 * Mail flow for nextmadelabs.com:
 * - Inbound: Cloudflare Email Routing receives hello@ / careers@ and forwards to the team's mailbox. It cannot send.
 * - Outbound (this site): Resend on the verified nextmadelabs.com domain (preferred), or SMTP through an existing
 *   mailbox as a fallback.
 */

export type IntakeEnv = {
  /**
   * Resend API key. Preferred provider: sends as the company domain once nextmadelabs.com is verified in Resend.
   * Before turning it on in production, add Resend back to the Privacy Policy's service providers.
   */
  resendApiKey?: string;
  /** SMTP through an existing mailbox. Used only when Resend isn't configured. */
  smtp?: { host: string; port: number; user: string; password: string };
  /** Controlled sender. Visitors and candidates are only ever `replyTo`, never the sender. */
  emailFrom?: string;
  /** Where project inquiries go. Defaults to hello@nextmadelabs.com. */
  businessTo: string;
  /** Where job applications go. Defaults to careers@nextmadelabs.com. */
  hiringTo: string;
  /** Send a short "we received it" email to the visitor/candidate after their message is delivered to us. */
  sendConfirmations: boolean;
  /**
   * Where submissions are saved on disk (like an ATS inbox), for long-running servers such as local development.
   * Opt-in via `SUBMISSIONS_DIR` — there is deliberately no implicit default, so every environment behaves the same
   * for the same settings. Ignored on Vercel, whose filesystem doesn't persist (use Upstash there).
   */
  submissionsDir?: string;
  hubspotToken?: string;
  upstashUrl?: string;
  upstashToken?: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
};

const val = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export function readIntakeEnv(env: Record<string, string | undefined> = process.env): IntakeEnv {
  const resendApiKey = val(env.RESEND_API_KEY);
  const smtpHost = val(env.SMTP_HOST);
  const smtpUser = val(env.SMTP_USER);
  const smtpPassword = env.SMTP_PASSWORD; // not trimmed: passwords may legitimately contain spaces
  const smtp =
    smtpHost && smtpUser && smtpPassword
      ? { host: smtpHost, port: Number(env.SMTP_PORT) > 0 ? Number(env.SMTP_PORT) : 465, user: smtpUser, password: smtpPassword }
      : undefined;
  // Resend sends as the company domain; an SMTP mailbox can only send as itself.
  const defaultFrom = resendApiKey
    ? `${company.displayName} <${company.notificationsEmail}>`
    : smtp
      ? `${company.displayName} Website <${smtp.user}>`
      : undefined;
  return {
    resendApiKey,
    smtp,
    emailFrom: val(env.EMAIL_FROM) ?? val(env.INQUIRY_FROM_EMAIL) ?? defaultFrom,
    businessTo: val(env.BUSINESS_CONTACT_EMAIL) ?? val(env.INQUIRY_TO_EMAIL) ?? company.contactEmail,
    hiringTo: val(env.HIRING_EMAIL) ?? company.careersEmail,
    sendConfirmations: val(env.SEND_CONFIRMATION_EMAILS)?.toLowerCase() === "true",
    submissionsDir: env.VERCEL || val(env.SUBMISSIONS_DIR)?.toLowerCase() === "off" ? undefined : val(env.SUBMISSIONS_DIR),
    hubspotToken: val(env.HUBSPOT_ACCESS_TOKEN),
    // Vercel's Storage tab ("Upstash for Redis") injects the KV_* names automatically; both spellings work.
    upstashUrl: val(env.UPSTASH_REDIS_REST_URL) ?? val(env.KV_REST_API_URL),
    upstashToken: val(env.UPSTASH_REDIS_REST_TOKEN) ?? val(env.KV_REST_API_TOKEN),
    rateLimitMax: Number(env.INTAKE_RATE_LIMIT_MAX ?? env.INQUIRY_RATE_LIMIT_MAX) > 0 ? Number(env.INTAKE_RATE_LIMIT_MAX ?? env.INQUIRY_RATE_LIMIT_MAX) : 5,
    rateLimitWindowMs:
      Number(env.INTAKE_RATE_LIMIT_WINDOW_SECONDS ?? env.INQUIRY_RATE_LIMIT_WINDOW_SECONDS) > 0
        ? Number(env.INTAKE_RATE_LIMIT_WINDOW_SECONDS ?? env.INQUIRY_RATE_LIMIT_WINDOW_SECONDS) * 1000
        : 10 * 60 * 1000,
  };
}

/** Email needs a complete provider (Resend key, or an SMTP mailbox) and a sender. Fails closed otherwise. */
export function isEmailConfigured(env: IntakeEnv): boolean {
  return Boolean((env.resendApiKey || env.smtp) && env.emailFrom);
}

export function isCrmConfigured(env: IntakeEnv): boolean {
  return Boolean(env.hubspotToken);
}

/** Project inquiries can be delivered by email or (optionally) the CRM. */
export function isInquiryDeliveryConfigured(env: IntakeEnv = readIntakeEnv()): boolean {
  return isEmailConfigured(env) || isCrmConfigured(env);
}

/** Applications are only ever delivered by email (candidate data is not sent to the sales CRM). */
export function isApplicationDeliveryConfigured(env: IntakeEnv = readIntakeEnv()): boolean {
  return isEmailConfigured(env);
}
