import { company } from "@/lib/site-config";

/**
 * Server-only configuration for lead and application handling. Never import this from a Client Component:
 * these values are secrets or private routing details.
 */

export type IntakeEnv = {
  resendApiKey?: string;
  /** Controlled sender on a domain verified with the email provider. Visitors are only ever `replyTo`. */
  emailFrom?: string;
  /** Where project inquiries go. Defaults to the owner-supplied business inbox. */
  businessTo: string;
  /** Where job applications go. Defaults to the business inbox. */
  hiringTo: string;
  hubspotToken?: string;
  upstashUrl?: string;
  upstashToken?: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
};

const val = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export function readIntakeEnv(env: Record<string, string | undefined> = process.env): IntakeEnv {
  const businessTo = val(env.BUSINESS_CONTACT_EMAIL) ?? val(env.INQUIRY_TO_EMAIL) ?? company.contactEmail;
  return {
    resendApiKey: val(env.RESEND_API_KEY),
    emailFrom: val(env.EMAIL_FROM) ?? val(env.INQUIRY_FROM_EMAIL),
    businessTo,
    hiringTo: val(env.HIRING_EMAIL) ?? businessTo,
    hubspotToken: val(env.HUBSPOT_ACCESS_TOKEN),
    upstashUrl: val(env.UPSTASH_REDIS_REST_URL),
    upstashToken: val(env.UPSTASH_REDIS_REST_TOKEN),
    rateLimitMax: Number(env.INTAKE_RATE_LIMIT_MAX ?? env.INQUIRY_RATE_LIMIT_MAX) > 0 ? Number(env.INTAKE_RATE_LIMIT_MAX ?? env.INQUIRY_RATE_LIMIT_MAX) : 5,
    rateLimitWindowMs:
      Number(env.INTAKE_RATE_LIMIT_WINDOW_SECONDS ?? env.INQUIRY_RATE_LIMIT_WINDOW_SECONDS) > 0
        ? Number(env.INTAKE_RATE_LIMIT_WINDOW_SECONDS ?? env.INQUIRY_RATE_LIMIT_WINDOW_SECONDS) * 1000
        : 10 * 60 * 1000,
  };
}

/** Email needs a provider key AND a controlled sender; recipients have safe defaults. Fails closed. */
export function isEmailConfigured(env: IntakeEnv): boolean {
  return Boolean(env.resendApiKey && env.emailFrom);
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
