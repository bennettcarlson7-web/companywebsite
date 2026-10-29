import { describe, expect, it, vi } from "vitest";
import { buildApplicationEmail, handleApplication } from "@/lib/integrations/handle-application";
import { readIntakeEnv } from "@/lib/integrations/env";
import { MemoryRateLimiter } from "@/lib/integrations/rate-limit";
import { DeliveredSubmissions, type SubmissionRequest } from "@/lib/integrations/submission-guard";
import { applicationSchema } from "@/lib/validation/job-application";
import { sampleUuid, validApplication, validInquiry } from "./fixtures";

const configured = readIntakeEnv({
  RESEND_API_KEY: "re_test",
  EMAIL_FROM: "Nextmade Careers <careers@verified.example>",
  HIRING_EMAIL: "hiring@example.com",
});

function request(body: unknown, overrides: Partial<SubmissionRequest> = {}): SubmissionRequest {
  return { rawBody: JSON.stringify(body), contentType: "application/json", ip: "198.51.100.4", origin: null, host: null, ...overrides };
}
const envelope = (payload: object = validApplication, extra: object = {}) => ({ payload, website: "", elapsedMs: 9000, ...extra });
function deps(env = readIntakeEnv({}), fetchImpl?: typeof fetch) {
  return { env, limiter: new MemoryRateLimiter(5, 60_000), fetchImpl, log: vi.fn(), delivered: new DeliveredSubmissions() };
}
const okFetch = () => vi.fn(async () => new Response("{}", { status: 200 }));

describe("handleApplication", () => {
  it("fails closed with no fake success when email isn't configured", async () => {
    const res = await handleApplication(request(envelope()), deps());
    expect(res.httpStatus).toBe(503);
    expect(res.body).toEqual({ status: "unconfigured" });
  });

  it("emails the hiring inbox with a role-specific subject and the candidate as reply-to", async () => {
    const fetchImpl = okFetch();
    const res = await handleApplication(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    expect(res.body).toEqual({ status: "sent" });
    const payload = JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(payload.to).toEqual(["hiring@example.com"]);
    expect(payload.from).toBe("Nextmade Careers <careers@verified.example>");
    expect(payload.reply_to).toBe("sam@example.com");
    expect(payload.subject).toBe("[Nextmade Careers] Senior Software Engineer — Data Engineering — Application");
  });

  it("defaults the hiring inbox to the business email", async () => {
    const fetchImpl = okFetch();
    const env = readIntakeEnv({ RESEND_API_KEY: "re_test", EMAIL_FROM: "x@verified.example" });
    await handleApplication(request(envelope()), deps(env, fetchImpl as unknown as typeof fetch));
    const payload = JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(payload.to).toEqual(["rpatdu@mentortech.space"]);
  });

  it("reports an error, not success, when the provider rejects the email", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 422 }));
    const res = await handleApplication(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    expect(res.httpStatus).toBe(502);
    expect(res.body).toEqual({ status: "error" });
  });

  it("rejects a project-inquiry payload sent to the application endpoint", async () => {
    const res = await handleApplication(request(envelope(validInquiry)), deps(configured, okFetch() as unknown as typeof fetch));
    expect(res.httpStatus).toBe(422);
    expect(res.body.status).toBe("invalid");
  });

  it("does not deliver the same submission twice", async () => {
    const fetchImpl = okFetch();
    const d = deps(configured, fetchImpl as unknown as typeof fetch);
    await handleApplication(request(envelope(validApplication, { submissionId: sampleUuid })), d);
    await handleApplication(request(envelope(validApplication, { submissionId: sampleUuid })), d);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("applies bot and abuse checks", async () => {
    expect((await handleApplication(request(envelope(validApplication, { website: "x" })), deps(configured))).body.status).toBe("rejected");
    expect((await handleApplication(request(envelope(validApplication, { elapsedMs: 100 })), deps(configured))).body.status).toBe("rejected");
    const d = { ...deps(), limiter: new MemoryRateLimiter(1, 60_000) };
    await handleApplication(request(envelope()), d);
    expect((await handleApplication(request(envelope()), d)).httpStatus).toBe(429);
  });

  it("uses a separate rate-limit bucket from project inquiries", async () => {
    const limiter = new MemoryRateLimiter(1, 60_000);
    const { handleInquiry } = await import("@/lib/integrations/handle-inquiry");
    await handleInquiry(request({ payload: validInquiry, website: "", elapsedMs: 9000 }), { ...deps(), limiter });
    const res = await handleApplication(request(envelope()), { ...deps(), limiter });
    expect(res.httpStatus).not.toBe(429);
  });

  it("never logs the candidate's name, email, introduction, or links", async () => {
    const d = deps(configured, okFetch() as unknown as typeof fetch);
    await handleApplication(request(envelope()), d);
    await handleApplication(request(envelope({ ...validApplication, email: "bad" })), d);
    const logged = JSON.stringify(d.log.mock.calls);
    expect(logged).not.toMatch(/sam|okafor|pipelines|linkedin|github/i);
  });
});

describe("buildApplicationEmail", () => {
  it("escapes content and shows links as plain text", () => {
    const app = applicationSchema.parse({
      ...validApplication,
      name: "<b>Sam</b>",
      introduction: `<a href="https://evil.example">click</a> plus enough words to pass validation easily here.`,
    });
    const { html } = buildApplicationEmail(app);
    expect(html).not.toContain("<a href");
    expect(html).not.toContain("<b>Sam</b>");
    expect(html).toContain("https://github.com/example");
  });
});
