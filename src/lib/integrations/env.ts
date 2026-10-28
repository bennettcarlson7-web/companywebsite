/**
 * Server-only configuration for lead handling. Never import this from a Client Component:
 * these values are secrets or private routing details.
 */

export type InquiryEnv = {
  resendApiKey?: string;
  inquiryTo?: string;
  inquiryFrom?: string;
  hubspotToken?: string;
  upstashUrl?: string;
  upstashToken?: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
};

const val = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export function readInquiryEnv(env: Record<string, string | undefined> = process.env): InquiryEnv {
  return {
    resendApiKey: val(env.RESEND_API_KEY),
    inquiryTo: val(env.INQUIRY_TO_EMAIL),
    inquiryFrom: val(env.INQUIRY_FROM_EMAIL),
    hubspotToken: val(env.HUBSPOT_ACCESS_TOKEN),
    upstashUrl: val(env.UPSTASH_REDIS_REST_URL),
    upstashToken: val(env.UPSTASH_REDIS_REST_TOKEN),
    rateLimitMax: Number(env.INQUIRY_RATE_LIMIT_MAX) > 0 ? Number(env.INQUIRY_RATE_LIMIT_MAX) : 5,
    rateLimitWindowMs:
      Number(env.INQUIRY_RATE_LIMIT_WINDOW_SECONDS) > 0 ? Number(env.INQUIRY_RATE_LIMIT_WINDOW_SECONDS) * 1000 : 10 * 60 * 1000,
  };
}

export function isEmailConfigured(env: InquiryEnv): boolean {
  return Boolean(env.resendApiKey && env.inquiryTo && env.inquiryFrom);
}

export function isCrmConfigured(env: InquiryEnv): boolean {
  return Boolean(env.hubspotToken);
}

/** True when at least one real delivery channel is configured. */
export function isInquiryDeliveryConfigured(env: InquiryEnv = readInquiryEnv()): boolean {
  return isEmailConfigured(env) || isCrmConfigured(env);
}
