import { describe, expect, it, vi } from "vitest";
import { handleInquiry } from "@/lib/integrations/handle-inquiry";
import { handleApplication } from "@/lib/integrations/handle-application";
import { isEmailConfigured, readIntakeEnv } from "@/lib/integrations/env";
import { MemoryRateLimiter } from "@/lib/integrations/rate-limit";
import { DeliveredSubmissions } from "@/lib/integrations/submission-guard";
import type { SmtpSender } from "@/lib/integrations/email";
import { validApplication, validInquiry } from "./fixtures";

const smtpVars = {
  SMTP_HOST: "mail.privateemail.com",
  SMTP_PORT: "465",
  SMTP_USER: "rpatdu@mentortech.space",
  SMTP_PASSWORD: "app password with spaces ",
};
const smtpEnv = readIntakeEnv(smtpVars);

const req = (payload: object) => ({
  rawBody: JSON.stringify({ payload, website: "", elapsedMs: 9000 }),
  contentType: "application/json",
  ip: "192.0.2.10",
  origin: null,
  host: null,
});
const deps = (env: ReturnType<typeof readIntakeEnv>, smtpSender?: SmtpSender, fetchImpl?: typeof fetch) => ({
  env,
  limiter: new MemoryRateLimiter(10, 60_000),
  smtpSender,
  fetchImpl,
  log: vi.fn(),
  delivered: new DeliveredSubmissions(),
});
const okFetch = () => vi.fn(async () => new Response("{}", { status: 200 }));
const resendBodies = (fetchImpl: ReturnType<typeof okFetch>) =>
  fetchImpl.mock.calls.map((c) => JSON.parse(String((c as unknown as [string, RequestInit])[1].body)));

describe("SMTP fallback configuration", () => {
  it("is complete with host, user, and password; defaults to port 465 and the mailbox as sender", () => {
    expect(isEmailConfigured(smtpEnv)).toBe(true);
    expect(smtpEnv.smtp).toEqual({
      host: "mail.privateemail.com",
      port: 465,
      user: "rpatdu@mentortech.space",
      password: "app password with spaces ",
    });
    expect(smtpEnv.emailFrom).toBe("NextMade Website <rpatdu@mentortech.space>");
    expect(readIntakeEnv({ SMTP_HOST: "h", SMTP_USER: "u" }).smtp).toBeUndefined();
  });
});

describe("delivery over SMTP", () => {
  it("sends inquiries from the mailbox to hello@nextmadelabs.com, with the visitor as reply-to", async () => {
    const send = vi.fn<SmtpSender>(async () => {});
    const res = await handleInquiry(req(validInquiry), deps(smtpEnv, send));
    expect(res.body).toEqual({ status: "sent" });
    expect(send).toHaveBeenCalledTimes(1); // confirmations are off by default
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "NextMade Website <rpatdu@mentortech.space>",
        to: "hello@nextmadelabs.com",
        replyTo: "jordan@example.com",
        subject: "[NextMade Inquiry] New product / MVP — Jordan Rivera",
      }),
    );
  });

  it("sends applications to careers@nextmadelabs.com with the careers subject", async () => {
    const send = vi.fn<SmtpSender>(async () => {});
    const res = await handleApplication(req(validApplication), deps(smtpEnv, send));
    expect(res.body).toEqual({ status: "sent" });
    expect(send.mock.calls[0]![0].to).toBe("careers@nextmadelabs.com");
    expect(send.mock.calls[0]![0].subject).toBe("[NextMade Careers] Senior Software Engineer — Data Engineering — Application");
    expect(send.mock.calls[0]![0].replyTo).toBe("sam@example.com");
    expect(send.mock.calls[0]![0].attachments).toEqual([
      { filename: "Sam Okafor CV.pdf", contentType: "application/pdf", content: validApplication.resume.data },
    ]);
  });

  it("reports an error (never success) when the mail server rejects the login, and logs only the error code", async () => {
    const send = vi.fn<SmtpSender>(async () => {
      throw Object.assign(new Error("Invalid login: 535 Authentication failed for rpatdu@mentortech.space"), { code: "EAUTH" });
    });
    const d = deps(smtpEnv, send);
    const res = await handleInquiry(req(validInquiry), d);
    expect(res.httpStatus).toBe(502);
    expect(res.body).toEqual({ status: "error" });
    const logged = JSON.stringify(d.log.mock.calls);
    expect(logged).toContain("smtp_EAUTH");
    expect(logged).not.toMatch(/Authentication failed|jordan|rpatdu/);
  });
});

describe("provider order", () => {
  it("prefers Resend on the company domain over the SMTP mailbox when both are configured", async () => {
    const send = vi.fn<SmtpSender>(async () => {});
    const fetchImpl = okFetch();
    const env = readIntakeEnv({ ...smtpVars, RESEND_API_KEY: "re_test" });
    const res = await handleInquiry(req(validInquiry), deps(env, send, fetchImpl as unknown as typeof fetch));
    expect(res.body).toEqual({ status: "sent" });
    expect(send).not.toHaveBeenCalled();
    expect(resendBodies(fetchImpl)[0].from).toBe("NextMade <notifications@nextmadelabs.com>");
  });
});

describe("confirmation emails", () => {
  const env = readIntakeEnv({ RESEND_API_KEY: "re_test", SEND_CONFIRMATION_EMAILS: "true" });

  it("confirms an inquiry to the visitor after it reaches us, replying to hello@, without echoing their message", async () => {
    const fetchImpl = okFetch();
    const d = deps(env, undefined, fetchImpl as unknown as typeof fetch);
    const res = await handleInquiry(req(validInquiry), d);
    expect(res.body).toEqual({ status: "sent" });
    const [notification, confirmation] = resendBodies(fetchImpl);
    expect(notification.to).toEqual(["hello@nextmadelabs.com"]);
    expect(confirmation.to).toEqual(["jordan@example.com"]);
    expect(confirmation.reply_to).toBe("hello@nextmadelabs.com");
    expect(confirmation.from).toBe("NextMade <notifications@nextmadelabs.com>");
    expect(confirmation.subject).toBe("We received your project inquiry — NextMade");
    expect(confirmation.text).toContain("Hi Jordan,");
    expect(confirmation.text).not.toContain(validInquiry.description);
    expect(confirmation.html).not.toContain(validInquiry.description);
    expect(JSON.stringify(d.log.mock.calls)).toContain("confirmation_sent");
  });

  it("confirms an application with the role title, replying to careers@", async () => {
    const fetchImpl = okFetch();
    await handleApplication(req(validApplication), deps(env, undefined, fetchImpl as unknown as typeof fetch));
    const confirmation = resendBodies(fetchImpl)[1];
    expect(confirmation.to).toEqual(["sam@example.com"]);
    expect(confirmation.reply_to).toBe("careers@nextmadelabs.com");
    expect(confirmation.subject).toBe("We received your application: Senior Software Engineer — Data Engineering — NextMade");
    expect(confirmation.text).not.toContain(validApplication.videoUrl);
    expect(confirmation.attachments).toBeUndefined(); // the résumé goes only to us, never back out
  });

  it("never confirms when our own delivery failed", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 500 }));
    const res = await handleInquiry(req(validInquiry), deps(env, undefined, fetchImpl as unknown as typeof fetch));
    expect(res.body).toEqual({ status: "error" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("keeps the visitor's result as sent when only the confirmation fails", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockResolvedValueOnce(new Response("{}", { status: 422 }));
    const d = deps(env, undefined, fetchImpl as unknown as typeof fetch);
    const res = await handleInquiry(req(validInquiry), d);
    expect(res.body).toEqual({ status: "sent" });
    expect(JSON.stringify(d.log.mock.calls)).toContain("confirmation_failed");
  });

  it("strips markup from the name used in the greeting", async () => {
    const fetchImpl = okFetch();
    await handleInquiry(req({ ...validInquiry, name: "<b>Eve</b> Smith" }), deps(env, undefined, fetchImpl as unknown as typeof fetch));
    const confirmation = resendBodies(fetchImpl)[1];
    expect(confirmation.html).not.toContain("<b>");
  });
});
