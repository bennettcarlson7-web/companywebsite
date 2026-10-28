import { describe, expect, it, vi } from "vitest";
import { handleInquiry, type InquiryRequest } from "@/lib/integrations/handle-inquiry";
import { readInquiryEnv } from "@/lib/integrations/env";
import { MemoryRateLimiter } from "@/lib/integrations/rate-limit";
import { buildInquiryEmail } from "@/lib/integrations/deliver";
import { inquirySchema } from "@/lib/validation/inquiry";
import { validInquiry } from "./fixtures";

const unconfigured = readInquiryEnv({});
const configured = readInquiryEnv({
  RESEND_API_KEY: "re_test",
  INQUIRY_TO_EMAIL: "team@example.com",
  INQUIRY_FROM_EMAIL: "Website <inquiries@example.com>",
});

function request(body: unknown, overrides: Partial<InquiryRequest> = {}): InquiryRequest {
  return {
    rawBody: JSON.stringify(body),
    contentType: "application/json",
    ip: "203.0.113.7",
    origin: "https://site.example",
    host: "site.example",
    ...overrides,
  };
}

const envelope = (inquiry: object = validInquiry, extra: object = {}) => ({ inquiry, website: "", elapsedMs: 8000, ...extra });

function deps(env = unconfigured, fetchImpl?: typeof fetch) {
  const log = vi.fn();
  return { env, limiter: new MemoryRateLimiter(5, 60_000), fetchImpl, log };
}

describe("handleInquiry", () => {
  it("never reports success when no delivery channel is configured", async () => {
    const d = deps();
    const res = await handleInquiry(request(envelope()), d);
    expect(res.httpStatus).toBe(503);
    expect(res.body).toEqual({ status: "unconfigured" });
  });

  it("delivers via Resend and reports sent only when the provider accepts", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ id: "1" }), { status: 200 }));
    const res = await handleInquiry(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    expect(res.body).toEqual({ status: "sent" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const payload = JSON.parse(String(init.body));
    expect(payload.to).toEqual(["team@example.com"]);
    expect(payload.reply_to).toBe("jordan@example.com");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
  });

  it("returns an error (not sent) when the email provider fails", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 500 }));
    const res = await handleInquiry(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    expect(res.httpStatus).toBe(502);
    expect(res.body).toEqual({ status: "error" });
  });

  it("returns field errors for invalid input", async () => {
    const res = await handleInquiry(request(envelope({ ...validInquiry, email: "nope" })), deps());
    expect(res.httpStatus).toBe(422);
    expect(res.body.status).toBe("invalid");
    if (res.body.status === "invalid") expect(res.body.fieldErrors.email).toBeDefined();
  });

  it("rejects submissions that fill the honeypot", async () => {
    const res = await handleInquiry(request(envelope(validInquiry, { website: "http://spam.example" })), deps(configured));
    expect(res.body).toEqual({ status: "rejected" });
  });

  it("rejects submissions completed implausibly fast or without timing data", async () => {
    expect((await handleInquiry(request(envelope(validInquiry, { elapsedMs: 300 })), deps())).body.status).toBe("rejected");
    expect((await handleInquiry(request({ inquiry: validInquiry }), deps())).body.status).toBe("rejected");
  });

  it("rejects cross-origin posts", async () => {
    const res = await handleInquiry(request(envelope(), { origin: "https://evil.example" }), deps());
    expect(res.httpStatus).toBe(403);
  });

  it("rejects non-JSON content types, malformed JSON, and oversized bodies", async () => {
    expect((await handleInquiry(request(envelope(), { contentType: "text/plain" }), deps())).httpStatus).toBe(415);
    expect((await handleInquiry(request(envelope(), { rawBody: "{not json" }), deps())).httpStatus).toBe(400);
    const big = envelope({ ...validInquiry, description: "x".repeat(20_000) });
    expect((await handleInquiry(request(big), deps())).httpStatus).toBe(413);
  });

  it("rate limits repeated submissions from the same IP", async () => {
    const d = { ...deps(), limiter: new MemoryRateLimiter(2, 60_000) };
    await handleInquiry(request(envelope()), d);
    await handleInquiry(request(envelope()), d);
    const third = await handleInquiry(request(envelope()), d);
    expect(third.httpStatus).toBe(429);
    expect(third.body.status).toBe("rate_limited");
    expect(third.headers?.["Retry-After"]).toBeDefined();
  });

  it("never logs personal data or the project description", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const d = deps(configured, fetchImpl as unknown as typeof fetch);
    await handleInquiry(request(envelope()), d);
    await handleInquiry(request(envelope({ ...validInquiry, email: "bad" })), d);
    const logged = JSON.stringify(d.log.mock.calls);
    expect(logged).not.toContain("jordan");
    expect(logged).not.toContain("Jordan");
    expect(logged).not.toContain("booking tool");
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
