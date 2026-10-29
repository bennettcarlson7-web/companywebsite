import { inquiryFieldErrors, inquirySchema, type InquiryResponse } from "@/lib/validation/project-inquiry";
import { isCrmConfigured, isEmailConfigured, type IntakeEnv } from "./env";
import type { RateLimiter } from "./rate-limit";
import { sendEmail, type DeliveryResult } from "./email";
import { buildInquiryEmail, sendInquiryToHubSpot } from "./deliver";
import { DeliveredSubmissions, defaultLogger, guardSubmission, type Logger, type SubmissionRequest } from "./submission-guard";

export type InquiryDeps = {
  env: IntakeEnv;
  limiter: RateLimiter;
  fetchImpl?: typeof fetch;
  log?: Logger;
  delivered?: DeliveredSubmissions;
};

export type InquiryResult = { httpStatus: number; body: InquiryResponse; headers?: Record<string, string> };

const deliveredInquiries = new DeliveredSubmissions();

/** Customer project inquiry: shared guard → inquiry schema → email (+ optional CRM). */
export async function handleInquiry(req: SubmissionRequest, deps: InquiryDeps): Promise<InquiryResult> {
  const log = deps.log ?? defaultLogger("inquiry");
  const delivered = deps.delivered ?? deliveredInquiries;

  const guard = await guardSubmission(req, { namespace: "inquiry", limiter: deps.limiter, log });
  if (!guard.ok) return { httpStatus: guard.httpStatus, body: guard.body, headers: guard.headers };

  const parsed = inquirySchema.safeParse(guard.payload);
  if (!parsed.success) {
    log({ outcome: "invalid" });
    return { httpStatus: 422, body: { status: "invalid", fieldErrors: inquiryFieldErrors(parsed.error) } };
  }

  if (delivered.has(guard.submissionId)) {
    log({ outcome: "duplicate_ignored" });
    return { httpStatus: 200, body: { status: "sent" } };
  }

  const channels: Promise<DeliveryResult>[] = [];
  if (isEmailConfigured(deps.env)) {
    const { subject, html, text } = buildInquiryEmail(parsed.data);
    channels.push(sendEmail({ to: deps.env.businessTo, replyTo: parsed.data.email, subject, html, text }, deps.env, deps.fetchImpl));
  }
  if (isCrmConfigured(deps.env)) channels.push(sendInquiryToHubSpot(parsed.data, deps.env, deps.fetchImpl));

  if (channels.length === 0) {
    log({ outcome: "unconfigured" });
    return { httpStatus: 503, body: { status: "unconfigured" } };
  }

  const results = await Promise.all(channels);
  const failures = results.filter((r) => !r.ok).map((r) => r.detail ?? r.channel);
  if (failures.length) log({ outcome: "delivery_failure", failures });

  // The visitor only sees "sent" if the primary channel (email, when configured) accepted it.
  const primary = results.find((r) => r.channel === "email") ?? results[0]!;
  if (!primary.ok) return { httpStatus: 502, body: { status: "error" } };

  delivered.add(guard.submissionId);
  log({ outcome: "sent", channels: results.filter((r) => r.ok).map((r) => r.channel) });
  return { httpStatus: 200, body: { status: "sent" } };
}
