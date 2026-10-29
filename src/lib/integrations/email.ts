import nodemailer from "nodemailer";
import type { IntakeEnv } from "./env";

export type DeliveryResult = { channel: "email" | "crm" | "store"; ok: boolean; detail?: string };

export type EmailMessage = {
  to: string;
  /**
   * Where replies go: the visitor/candidate on notifications to us, our inbox on confirmations to them.
   * Never used as `from`.
   */
  replyTo: string;
  subject: string;
  html: string;
  text: string;
};

/** Sends one fully-formed message over SMTP. Injectable for tests. */
export type SmtpSender = (message: EmailMessage & { from: string }) => Promise<void>;

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Minimal, escaped notification layout shared by inquiry and application emails. */
export function renderNotificationHtml(heading: string, rows: [string, string][], bodyLabel: string, body: string, footer: string) {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#101d35">
<h2 style="margin:0 0 16px">${escapeHtml(heading)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#4a5a70;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join("")}</table>
<h3 style="margin:24px 0 8px">${escapeHtml(bodyLabel)}</h3>
<p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(body)}</p>
<p style="color:#4a5a70;font-size:12px;margin-top:24px">${escapeHtml(footer)}</p>
</body></html>`;
}

const recipients = (to: string) => to.split(",").map((s) => s.trim()).filter(Boolean);
const cleanSubject = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 200);

function smtpSenderFor(smtp: NonNullable<IntakeEnv["smtp"]>): SmtpSender {
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465, // 465 = implicit TLS; 587 upgrades with STARTTLS
    requireTLS: smtp.port !== 465,
    auth: { user: smtp.user, pass: smtp.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return async (m) => {
    await transport.sendMail({ from: m.from, to: recipients(m.to), replyTo: m.replyTo, subject: m.subject, html: m.html, text: m.text });
  };
}

/**
 * Sends one email. Reports success only when the provider accepts the message:
 * Resend returns 2xx, or the SMTP server accepts the DATA command.
 * `from` is always the configured company sender. Resend (company domain) is preferred over SMTP (mailbox).
 */
export async function sendEmail(
  message: EmailMessage,
  env: IntakeEnv,
  fetchImpl: typeof fetch = fetch,
  smtpSender?: SmtpSender,
): Promise<DeliveryResult> {
  const subject = cleanSubject(message.subject);

  if (!env.resendApiKey && env.smtp) {
    try {
      const send = smtpSender ?? smtpSenderFor(env.smtp);
      await send({ ...message, subject, from: env.emailFrom ?? env.smtp.user });
      return { channel: "email", ok: true };
    } catch (err) {
      // Error codes only (e.g. EAUTH, ETIMEDOUT) — never message content.
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "smtp_error";
      return { channel: "email", ok: false, detail: `smtp_${code}` };
    }
  }

  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.emailFrom,
        to: recipients(message.to),
        reply_to: message.replyTo,
        subject,
        html: message.html,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return { channel: "email", ok: res.ok, detail: res.ok ? undefined : `resend_${res.status}` };
  } catch (err) {
    return { channel: "email", ok: false, detail: err instanceof Error ? err.name : "unknown" };
  }
}
