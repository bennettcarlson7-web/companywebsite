import { inquiryFieldErrors, inquirySchema, type InquiryResponse } from "@/lib/validation/project-inquiry";
import { isCrmConfigured, isEmailConfigured, type IntakeEnv } from "./env";
import type { RateLimiter } from "./rate-limit";
import { sendEmail, type DeliveryResult, type SmtpSender } from "./email";
import { buildInquiryEmail, sendInquiryToHubSpot } from "./deliver";
import { buildInquiryConfirmation, sendConfirmation } from "./confirmation";
import { saveSubmission, type SubmissionStore } from "./submission-store";
import { DeliveredSubmissions, defaultLogger, guardSubmission, type Logger, type SubmissionRequest } from "./submission-guard";

export type InquiryDeps = {
  env: IntakeEnv;
  limiter: RateLimiter;
  fetchImpl?: typeof fetch;
  /** Test hook: replaces the real SMTP transport. */
  smtpSender?: SmtpSender;
  /** Where accepted inquiries are saved. */
  store?: SubmissionStore;
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
  if (deps.store) {
    channels.push(
      saveSubmission(deps.store, { id: guard.submissionId ?? crypto.randomUUID(), kind: "inquiry", receivedAt: new Date().toISOString(), data: { ...parsed.data } }).then(
        (r) => ({ channel: "store" as const, ok: Boolean(r?.ok), detail: r?.detail }),
      ),
    );
  }
  if (isEmailConfigured(deps.env)) {
    const { subject, html, text } = buildInquiryEmail(parsed.data);
    channels.push(sendEmail({ to: deps.env.businessTo, replyTo: parsed.data.email, subject, html, text }, deps.env, deps.fetchImpl, deps.smtpSender));
  }
  if (isCrmConfigured(deps.env)) channels.push(sendInquiryToHubSpot(parsed.data, deps.env, deps.fetchImpl));

  if (channels.length === 0) {
    log({ outcome: "unconfigured" });
    return { httpStatus: 503, body: { status: "unconfigured" } };
  }

  const results = await Promise.all(channels);
  const failures = results.filter((r) => !r.ok).map((r) => r.detail ?? r.channel);
  if (failures.length) log({ outcome: "delivery_failure", failures });

  // "Sent" only when we durably have it: saved, or accepted by email (or by the CRM when it's the only channel).
  const byChannel = (c: DeliveryResult["channel"]) => results.find((r) => r.channel === c);
  const received = byChannel("store")?.ok || byChannel("email")?.ok || (!byChannel("email") && !byChannel("store") && byChannel("crm")?.ok);
  if (!received) return { httpStatus: 502, body: { status: "error" } };

  delivered.add(guard.submissionId);
  log({ outcome: "sent", channels: results.filter((r) => r.ok).map((r) => r.channel) });

  if (byChannel("email")?.ok) {
    const confirmation = await sendConfirmation(
      buildInquiryConfirmation(parsed.data.name, parsed.data.email, deps.env),
      deps.env,
      deps.fetchImpl,
      deps.smtpSender,
    );
    if (confirmation) log({ outcome: confirmation.ok ? "confirmation_sent" : "confirmation_failed", failures: confirmation.detail ? [confirmation.detail] : undefined });
  }
  return { httpStatus: 200, body: { status: "sent" } };
}
