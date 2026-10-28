import { siteConfig } from "@/lib/site-config";
import { budgetRanges, labelFor, projectTypes, timelines, type Inquiry } from "@/lib/validation/inquiry";
import type { InquiryEnv } from "./env";

export type DeliveryResult = { channel: "email" | "crm"; ok: boolean; detail?: string };

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Human-readable summary used for the email body and the "copy your inquiry" fallback. */
export function formatInquiryText(inquiry: Inquiry): string {
  return [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Company: ${inquiry.company ?? "Not provided"}`,
    `Project type: ${labelFor(projectTypes, inquiry.projectType)}`,
    `Budget: ${labelFor(budgetRanges, inquiry.budget)}`,
    `Timeline: ${labelFor(timelines, inquiry.timeline)}`,
    "",
    "Project description:",
    inquiry.description,
  ].join("\n");
}

export function buildInquiryEmail(inquiry: Inquiry) {
  const rows: [string, string][] = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Company", inquiry.company ?? "Not provided"],
    ["Project type", labelFor(projectTypes, inquiry.projectType)],
    ["Budget", labelFor(budgetRanges, inquiry.budget)],
    ["Timeline", labelFor(timelines, inquiry.timeline)],
  ];
  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#101d35">
<h2 style="margin:0 0 16px">New project inquiry</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#4a5a70"><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join("")}</table>
<h3 style="margin:24px 0 8px">Project description</h3>
<p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(inquiry.description)}</p>
<p style="color:#4a5a70;font-size:12px;margin-top:24px">Sent from the ${escapeHtml(siteConfig.name)} website contact form. Reply directly to respond.</p>
</body></html>`;
  // Fields are already single-line (no CR/LF) after validation, so header injection isn't possible.
  const subject = `New inquiry: ${labelFor(projectTypes, inquiry.projectType)} — ${inquiry.name}`.slice(0, 200);
  return { subject, html, text: formatInquiryText(inquiry) };
}

export async function sendInquiryEmail(inquiry: Inquiry, env: InquiryEnv, fetchImpl: typeof fetch = fetch): Promise<DeliveryResult> {
  const { subject, html, text } = buildInquiryEmail(inquiry);
  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.inquiryFrom,
        to: env.inquiryTo!.split(",").map((s) => s.trim()),
        reply_to: inquiry.email,
        subject,
        html,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return { channel: "email", ok: res.ok, detail: res.ok ? undefined : `resend_${res.status}` };
  } catch (err) {
    return { channel: "email", ok: false, detail: err instanceof Error ? err.name : "unknown" };
  }
}

/**
 * Optional HubSpot adapter: creates a contact using a private-app token
 * (scope: crm.objects.contacts.write). An existing contact (409) counts as delivered.
 */
export async function sendInquiryToHubSpot(inquiry: Inquiry, env: InquiryEnv, fetchImpl: typeof fetch = fetch): Promise<DeliveryResult> {
  const [firstname, ...rest] = inquiry.name.split(" ");
  try {
    const res = await fetchImpl("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.hubspotToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        properties: {
          email: inquiry.email,
          firstname,
          lastname: rest.join(" ") || undefined,
          company: inquiry.company,
          message: formatInquiryText(inquiry).slice(0, 65_000),
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const ok = res.ok || res.status === 409;
    return { channel: "crm", ok, detail: ok ? undefined : `hubspot_${res.status}` };
  } catch (err) {
    return { channel: "crm", ok: false, detail: err instanceof Error ? err.name : "unknown" };
  }
}
