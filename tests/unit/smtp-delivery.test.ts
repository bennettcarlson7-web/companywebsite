import { describe, expect, it, vi } from "vitest";
import { handleInquiry } from "@/lib/integrations/handle-inquiry";
import { handleApplication } from "@/lib/integrations/handle-application";
import { isEmailConfigured, readIntakeEnv } from "@/lib/integrations/env";
import { MemoryRateLimiter } from "@/lib/integrations/rate-limit";
import { DeliveredSubmissions } from "@/lib/integrations/submission-guard";
import type { SmtpSender } from "@/lib/integrations/email";
import { validApplication, validInquiry } from "./fixtures";

const smtpEnv = readIntakeEnv({
  SMTP_HOST: "mail.privateemail.com",
  SMTP_PORT: "465",
  SMTP_USER: "rpatdu@mentortech.space",
  SMTP_PASSWORD: "app password with spaces ",
});

const req = (payload: object) => ({
  rawBody: JSON.stringify({ payload, website: "", elapsedMs: 9000 }),
  contentType: "application/json",
  ip: "192.0.2.10",
  origin: null,
  host: null,
});
const deps = (smtpSender: SmtpSender) => ({
  env: smtpEnv,
  limiter: new MemoryRateLimiter(10, 60_000),
  smtpSender,
  log: vi.fn(),
  delivered: new DeliveredSubmissions(),
});

describe("SMTP configuration", () => {
  it("is complete with host, user, and password; defaults to port 465 and the mailbox as sender", () => {
    expect(isEmailConfigured(smtpEnv)).toBe(true);
    expect(smtpEnv.smtp).toEqual({
      host: "mail.privateemail.com",
      port: 465,
      user: "rpatdu@mentortech.space",
      password: "app password with spaces ",
    });
    expect(smtpEnv.emailFrom).toBe("Nextmade Website <rpatdu@mentortech.space>");
    expect(readIntakeEnv({ SMTP_HOST: "h", SMTP_USER: "u" }).smtp).toBeUndefined();
  });
});

describe("delivery over SMTP", () => {
  it("sends inquiries from the company mailbox to the business inbox, with the visitor as reply-to", async () => {
    const send = vi.fn<SmtpSender>(async () => {});
    const res = await handleInquiry(req(validInquiry), deps(send));
    expect(res.body).toEqual({ status: "sent" });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Nextmade Website <rpatdu@mentortech.space>",
        to: "rpatdu@mentortech.space",
        replyTo: "jordan@example.com",
        subject: "[Nextmade Inquiry] New product / MVP — Jordan Rivera",
      }),
    );
  });

  it("sends applications with the careers subject", async () => {
    const send = vi.fn<SmtpSender>(async () => {});
    const res = await handleApplication(req(validApplication), deps(send));
    expect(res.body).toEqual({ status: "sent" });
    expect(send.mock.calls[0]![0].subject).toBe("[Nextmade Careers] Senior Software Engineer — Data Engineering — Application");
    expect(send.mock.calls[0]![0].replyTo).toBe("sam@example.com");
  });

  it("reports an error (never success) when the mail server rejects the login, and logs only the error code", async () => {
    const send = vi.fn<SmtpSender>(async () => {
      throw Object.assign(new Error("Invalid login: 535 Authentication failed for rpatdu@mentortech.space"), { code: "EAUTH" });
    });
    const d = deps(send);
    const res = await handleInquiry(req(validInquiry), d);
    expect(res.httpStatus).toBe(502);
    expect(res.body).toEqual({ status: "error" });
    const logged = JSON.stringify(d.log.mock.calls);
    expect(logged).toContain("smtp_EAUTH");
    expect(logged).not.toMatch(/Authentication failed|jordan|rpatdu/);
  });
});
