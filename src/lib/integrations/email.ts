import type { IntakeEnv } from "./env";

export type DeliveryResult = { channel: "email" | "crm"; ok: boolean; detail?: string };

export type EmailMessage = {
  to: string;
  /** The visitor's or candidate's address. Never used as `from`. */
  replyTo: string;
  subject: string;
  html: string;
  text: string;
};

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

/**
 * Sends through the Resend REST API (no SDK). Reports success only when Resend accepts the message (2xx).
 * `from` is always the configured, domain-verified sender.
 */
export async function sendEmail(message: EmailMessage, env: IntakeEnv, fetchImpl: typeof fetch = fetch): Promise<DeliveryResult> {
  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.emailFrom,
        to: message.to.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: message.replyTo,
        subject: message.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
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
