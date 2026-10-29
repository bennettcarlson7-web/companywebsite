import { describe, expect, it, vi } from "vitest";
import { handleInquiry } from "@/lib/integrations/handle-inquiry";
import { readIntakeEnv } from "@/lib/integrations/env";
import { MemoryRateLimiter } from "@/lib/integrations/rate-limit";
import { buildInquiryEmail } from "@/lib/integrations/deliver";
import { DeliveredSubmissions, type SubmissionRequest } from "@/lib/integrations/submission-guard";
import { inquirySchema } from "@/lib/validation/project-inquiry";
import { sampleUuid, validInquiry } from "./fixtures";

const unconfigured = readIntakeEnv({});
const configured = readIntakeEnv({ RESEND_API_KEY: "re_test", EMAIL_FROM: "Nextmade Website <inquiries@verified.example>" });

function request(body: unknown, overrides: Partial<SubmissionRequest> = {}): SubmissionRequest {
  return {
    rawBody: JSON.stringify(body),
    contentType: "application/json",
    ip: "203.0.113.7",
    origin: "https://site.example",
    host: "site.example",
    ...overrides,
  };
}

const envelope = (payload: object = validInquiry, extra: object = {}) => ({ payload, website: "", elapsedMs: 8000, ...extra });

function deps(env = unconfigured, fetchImpl?: typeof fetch) {
  return { env, limiter: new MemoryRateLimiter(5, 60_000), fetchImpl, log: vi.fn(), delivered: new DeliveredSubmissions() };
}

const okFetch = () => vi.fn(async () => new Response(JSON.stringify({ id: "1" }), { status: 200 }));

describe("readIntakeEnv", () => {
  it("routes inquiries to hello@ and applications to careers@ on the company domain by default", () => {
    expect(unconfigured.businessTo).toBe("hello@nextmadelabs.com");
    expect(unconfigured.hiringTo).toBe("careers@nextmadelabs.com");
    expect(unconfigured.emailFrom).toBeUndefined();
    expect(unconfigured.sendConfirmations).toBe(false);
  });

  it("sends as notifications@nextmadelabs.com with Resend unless EMAIL_FROM overrides it", () => {
    expect(readIntakeEnv({ RESEND_API_KEY: "re_x" }).emailFrom).toBe("Nextmade <notifications@nextmadelabs.com>");
    expect(readIntakeEnv({ RESEND_API_KEY: "re_x", EMAIL_FROM: "Team <team@nextmadelabs.com>" }).emailFrom).toBe("Team <team@nextmadelabs.com>");
    expect(readIntakeEnv({ SEND_CONFIRMATION_EMAILS: "TRUE" }).sendConfirmations).toBe(true);
  });
});

describe("handleInquiry", () => {
  it("never reports success when no delivery channel is configured", async () => {
    const res = await handleInquiry(request(envelope()), deps());
    expect(res.httpStatus).toBe(503);
    expect(res.body).toEqual({ status: "unconfigured" });
  });

  it("treats a Resend key alone as configured, sending from the company domain to hello@", async () => {
    const fetchImpl = okFetch();
    const res = await handleInquiry(request(envelope()), deps(readIntakeEnv({ RESEND_API_KEY: "re_x" }), fetchImpl as unknown as typeof fetch));
    expect(res.body).toEqual({ status: "sent" });
    const payload = JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(payload.from).toBe("Nextmade <notifications@nextmadelabs.com>");
    expect(payload.to).toEqual(["hello@nextmadelabs.com"]);
  });

  it("emails the business inbox from the controlled sender with the visitor as reply-to", async () => {
    const fetchImpl = okFetch();
    const res = await handleInquiry(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    expect(res.body).toEqual({ status: "sent" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const payload = JSON.parse(String(init.body));
    expect(payload.to).toEqual(["hello@nextmadelabs.com"]);
    expect(payload.from).toBe("Nextmade Website <inquiries@verified.example>");
    expect(payload.reply_to).toBe("jordan@example.com");
    expect(payload.subject).toMatch(/^\[Nextmade Inquiry\] New product \/ MVP — Jordan Rivera$/);
  });

  it("returns an error (not sent) when the email provider fails", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 500 }));
    const res = await handleInquiry(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    expect(res.httpStatus).toBe(502);
    expect(res.body).toEqual({ status: "error" });
  });

  it("returns an error when the provider is unreachable", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const res = await handleInquiry(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    expect(res.body).toEqual({ status: "error" });
  });

  it("does not send a second email for a repeated submission ID", async () => {
    const fetchImpl = okFetch();
    const d = deps(configured, fetchImpl as unknown as typeof fetch);
    await handleInquiry(request(envelope(validInquiry, { submissionId: sampleUuid })), d);
    const again = await handleInquiry(request(envelope(validInquiry, { submissionId: sampleUuid })), d);
    expect(again.body).toEqual({ status: "sent" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns field errors for invalid input", async () => {
    const res = await handleInquiry(request(envelope({ ...validInquiry, email: "nope" })), deps());
    expect(res.httpStatus).toBe(422);
    if (res.body.status === "invalid") expect(res.body.fieldErrors.email).toBeDefined();
  });

  it("rejects honeypot, too-fast, cross-origin, wrong content type, malformed, and oversized submissions", async () => {
    expect((await handleInquiry(request(envelope(validInquiry, { website: "spam" })), deps(configured))).body.status).toBe("rejected");
    expect((await handleInquiry(request(envelope(validInquiry, { elapsedMs: 300 })), deps())).body.status).toBe("rejected");
    expect((await handleInquiry(request({ payload: validInquiry }), deps())).body.status).toBe("rejected");
    expect((await handleInquiry(request(envelope(), { origin: "https://evil.example" }), deps())).httpStatus).toBe(403);
    expect((await handleInquiry(request(envelope(), { contentType: "text/plain" }), deps())).httpStatus).toBe(415);
    expect((await handleInquiry(request(envelope(), { rawBody: "{not json" }), deps())).httpStatus).toBe(400);
    expect((await handleInquiry(request(envelope({ ...validInquiry, description: "x".repeat(20_000) })), deps())).httpStatus).toBe(413);
  });

  it("rate limits repeated submissions from the same IP", async () => {
    const d = { ...deps(), limiter: new MemoryRateLimiter(2, 60_000) };
    await handleInquiry(request(envelope()), d);
    await handleInquiry(request(envelope()), d);
    const third = await handleInquiry(request(envelope()), d);
    expect(third.httpStatus).toBe(429);
    expect(third.headers?.["Retry-After"]).toBeDefined();
  });

  it("never logs personal data or the project description", async () => {
    const d = deps(configured, okFetch() as unknown as typeof fetch);
    await handleInquiry(request(envelope()), d);
    await handleInquiry(request(envelope({ ...validInquiry, email: "bad" })), d);
    const logged = JSON.stringify(d.log.mock.calls);
    expect(logged).not.toMatch(/jordan|booking tool/i);
  });
});

describe("MemoryRateLimiter", () => {
  it("resets after the window passes", async () => {
    let now = 0;
    const limiter = new MemoryRateLimiter(1, 1000, () => now);
    expect((await limiter.hit("a")).allowed).toBe(true);
    expect((await limiter.hit("a")).allowed).toBe(false);
    expect((await limiter.hit("b")).allowed).toBe(true);
    now = 1500;
    expect((await limiter.hit("a")).allowed).toBe(true);
  });
});

describe("buildInquiryEmail", () => {
  it("escapes HTML in user-provided content", () => {
    const inquiry = inquirySchema.parse({
      ...validInquiry,
      name: "<script>alert(1)</script>",
      description: `<img src=x onerror="alert(1)"> and some more text here`,
    });
    const { html, subject, text } = buildInquiryEmail(inquiry);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(subject).not.toMatch(/[\r\n]/);
    expect(text).toContain("Project type: New product / MVP");
  });
});
