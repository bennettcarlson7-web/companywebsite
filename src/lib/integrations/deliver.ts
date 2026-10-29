import { siteConfig } from "@/lib/site-config";
import { labelFor } from "@/lib/validation/shared";
import { budgetRanges, projectTypes, timelines, type Inquiry } from "@/lib/validation/project-inquiry";
import type { IntakeEnv } from "./env";
import { renderNotificationHtml, type DeliveryResult } from "./email";

/** Human-readable inquiry summary used for the email body and the "copy your inquiry" fallback. */
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
  // Fields are single-line after validation, so the subject can't carry header injection.
  const subject = `[${siteConfig.name} Inquiry] ${labelFor(projectTypes, inquiry.projectType)} — ${inquiry.name}`;
  const html = renderNotificationHtml(
    "New project inquiry",
    rows,
    "Project description",
    inquiry.description,
    `Sent from the ${siteConfig.name} website project inquiry form. Reply directly to respond.`,
  );
  return { subject, html, text: formatInquiryText(inquiry) };
}

/**
 * Optional HubSpot adapter for project inquiries only: creates a contact using a private-app token
 * (scope: crm.objects.contacts.write). An existing contact (409) counts as delivered.
 */
export async function sendInquiryToHubSpot(inquiry: Inquiry, env: IntakeEnv, fetchImpl: typeof fetch = fetch): Promise<DeliveryResult> {
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
