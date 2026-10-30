import { describe, expect, it, vi } from "vitest";
import { buildApplicationEmail, handleApplication } from "@/lib/integrations/handle-application";
import { readIntakeEnv } from "@/lib/integrations/env";
import { MemoryRateLimiter } from "@/lib/integrations/rate-limit";
import { DeliveredSubmissions, type SubmissionRequest } from "@/lib/integrations/submission-guard";
import { applicationSchema } from "@/lib/validation/job-application";
import { seedManagedJobs } from "@/lib/data/jobs";
import { samplePdf, sampleUuid, validApplication, validInquiry } from "./fixtures";

const configured = readIntakeEnv({
  RESEND_API_KEY: "re_test",
  EMAIL_FROM: "NextMade Careers <careers@verified.example>",
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
    expect(payload.from).toBe("NextMade Careers <careers@verified.example>");
    expect(payload.reply_to).toBe("sam@example.com");
    expect(payload.subject).toBe("[NextMade Careers] Senior Software Engineer — Data Engineering — Application");
  });

  it("attaches the candidate's résumé file to the hiring email", async () => {
    const fetchImpl = okFetch();
    await handleApplication(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    const payload = JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(payload.attachments).toEqual([{ filename: "Sam Okafor CV.pdf", content: samplePdf, content_type: "application/pdf" }]);
    expect(payload.text).toContain("Résumé: Sam Okafor CV.pdf");
  });

  it("shows phone, location, gender, and age range to reviewers", async () => {
    const fetchImpl = okFetch();
    await handleApplication(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    const payload = JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    for (const body of [payload.text, payload.html]) {
      expect(body).toContain("+234 803 555 0142");
      expect(body).toContain("Lagos, Nigeria");
      expect(body).toContain("Man");
      expect(body).toContain("25–34");
    }
    const declined = okFetch();
    await handleApplication(request(envelope({ ...validApplication, gender: "", ageRange: "" })), deps(configured, declined as unknown as typeof fetch));
    const text = JSON.parse(String((declined.mock.calls[0] as unknown as [string, RequestInit])[1].body)).text;
    expect(text).toContain("Gender: Not disclosed");
    expect(text).toContain("Age range: Not disclosed");
  });

  it("accepts a full-size résumé but rejects bodies over the application cap", async () => {
    const nearCap = { ...validApplication, resume: { name: "cv.pdf", data: "JVBERi" + "A".repeat(4_000_000) } };
    expect((await handleApplication(request(envelope(nearCap)), deps(configured, okFetch() as unknown as typeof fetch))).httpStatus).toBe(200);
    const tooBig = { ...validApplication, resume: { name: "cv.pdf", data: "JVBERi" + "A".repeat(4_500_000) } };
    expect((await handleApplication(request(envelope(tooBig)), deps(configured))).httpStatus).toBe(413);
  });

  it("asks for a résumé when none is attached", async () => {
    const noResume: Partial<typeof validApplication> = { ...validApplication };
    delete noResume.resume;
    const res = await handleApplication(request(envelope(noResume)), deps(configured, okFetch() as unknown as typeof fetch));
    expect(res).toMatchObject({ httpStatus: 422, body: { status: "invalid", fieldErrors: { resume: expect.stringMatching(/résumé/) } } });
  });

  it("defaults the hiring inbox to careers@nextmadelabs.com, separate from client inquiries", async () => {
    const fetchImpl = okFetch();
    const env = readIntakeEnv({ RESEND_API_KEY: "re_test" });
    await handleApplication(request(envelope()), deps(env, fetchImpl as unknown as typeof fetch));
    const payload = JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(payload.to).toEqual(["careers@nextmadelabs.com"]);
  });

  it("reports an error, not success, when the provider rejects the email", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 422 }));
    const res = await handleApplication(request(envelope()), deps(configured, fetchImpl as unknown as typeof fetch));
    expect(res.httpStatus).toBe(502);
    expect(res.body).toEqual({ status: "error" });
  });

  it("only accepts roles that are currently open in the live job list", async () => {
    const jobs = seedManagedJobs().map((j) => (j.slug === validApplication.role ? { ...j, status: "closed" as const } : j));
    const withdrawn = await handleApplication(request(envelope()), { ...deps(configured, okFetch() as unknown as typeof fetch), loadJobs: async () => jobs });
    expect(withdrawn).toMatchObject({ httpStatus: 422, body: { status: "invalid", fieldErrors: { role: expect.stringMatching(/no longer accepting/) } } });

    const unknown = await handleApplication(request(envelope({ ...validApplication, role: "chief-wizard" })), deps(configured, okFetch() as unknown as typeof fetch));
    expect(unknown).toMatchObject({ httpStatus: 422, body: { fieldErrors: { role: expect.stringMatching(/choose the role/) } } });

    const posted = [...seedManagedJobs(), { ...seedManagedJobs()[0]!, slug: "product-designer", title: "Product Designer" }];
    const fetchImpl = okFetch();
    const res = await handleApplication(request(envelope({ ...validApplication, role: "product-designer" })), {
      ...deps(configured, fetchImpl as unknown as typeof fetch),
      loadJobs: async () => posted,
    });
    expect(res.body).toEqual({ status: "sent" });
    expect(JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body)).subject).toContain("Product Designer");
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

  it("never logs the candidate's name, email, links, video, or résumé", async () => {
    const d = deps(configured, okFetch() as unknown as typeof fetch);
    await handleApplication(request(envelope()), d);
    await handleApplication(request(envelope({ ...validApplication, email: "bad" })), d);
    const logged = JSON.stringify(d.log.mock.calls);
    expect(logged).not.toMatch(/sam|okafor|loom|linkedin|github|\.pdf|JVBERi/i);
  });
});

describe("buildApplicationEmail", () => {
  it("escapes content and shows links, including the video, as plain text", () => {
    const app = applicationSchema.parse({
      ...validApplication,
      name: "<b>Sam</b>",
      videoUrl: `https://evil.example/"><script>alert(1)</script>`,
    });
    const { html, text } = buildApplicationEmail(app, "Senior Software Engineer — Data Engineering");
    expect(html).not.toContain("<a href");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Sam</b>");
    expect(html).toContain("https://github.com/example");
    expect(text).toContain("Introduction video: https://evil.example/");
  });

  it("says the introduction video was not provided when it's left out", () => {
    const app = applicationSchema.parse({ ...validApplication, videoUrl: "" });
    const { html, text } = buildApplicationEmail(app, "Talent Recruiter");
    expect(text).toContain("Introduction video: Not provided");
    expect(html).toContain("Not provided");
    expect(html).not.toContain("undefined");
  });
});
