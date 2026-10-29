import { company, emailSubjects, siteConfig } from "@/lib/site-config";
import type { IntakeEnv } from "./env";
import { escapeHtml, sendEmail, type DeliveryResult, type EmailMessage, type SmtpSender } from "./email";

/**
 * "We received it" emails to the person who submitted a form, sent only after their message reached our inbox.
 *
 * Abuse guard: the form's recipient address is typed by the visitor, so these emails never echo free text they
 * submitted (project details, introductions, links). Only a trimmed first name and our own fixed wording go out,
 * which makes the form useless as a spam relay.
 */

const firstName = (name: string) =>
  name
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .trim()
    .split(/\s+/)[0]!
    .slice(0, 40);

function render(greetingName: string, paragraphs: string[], replyTo: string) {
  const signoff = `— The ${company.displayName} team`;
  const text = [`Hi ${greetingName},`, "", ...paragraphs.flatMap((p) => [p, ""]), signoff, siteConfig.url].join("\n");
  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#101d35;line-height:1.6">
<p>Hi ${escapeHtml(greetingName)},</p>
${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n")}
<p>${escapeHtml(signoff)}<br><a href="${escapeHtml(siteConfig.url)}" style="color:#1d4ed8">${escapeHtml(company.domain)}</a></p>
<p style="color:#4a5a70;font-size:12px;margin-top:24px">You're receiving this because this address was entered on a form at ${escapeHtml(
    company.domain,
  )}. If that wasn't you, you can ignore this email, or reply to ${escapeHtml(replyTo)} and we'll delete the submission.</p>
</body></html>`;
  return { text, html };
}

export function buildInquiryConfirmation(name: string, email: string, env: IntakeEnv): EmailMessage {
  const replyTo = env.businessTo.split(",")[0]!.trim();
  const { text, html } = render(
    firstName(name),
    [
      `Thanks for telling us about your project. Your inquiry reached our team at ${company.displayName}.`,
      "A person on our team will read it and reply personally. If you'd like to add anything in the meantime — files, links, or timing — just reply to this email.",
    ],
    replyTo,
  );
  return { to: email, replyTo, subject: emailSubjects.inquiryReceived, text, html };
}

export function buildApplicationConfirmation(name: string, email: string, roleTitle: string, env: IntakeEnv): EmailMessage {
  const replyTo = env.hiringTo.split(",")[0]!.trim();
  const { text, html } = render(
    firstName(name),
    [
      `Thank you for applying for the ${roleTitle} role at ${company.displayName}. Your application reached our hiring team.`,
      "A person on our team reads every application. If there's a fit, we'll reach out about next steps. Questions in the meantime? Reply to this email.",
    ],
    replyTo,
  );
  return { to: email, replyTo, subject: emailSubjects.applicationReceived(roleTitle), text, html };
}

/** Best effort: a failed confirmation never changes the visitor's result, because their message already reached us. */
export async function sendConfirmation(
  message: EmailMessage,
  env: IntakeEnv,
  fetchImpl?: typeof fetch,
  smtpSender?: SmtpSender,
): Promise<DeliveryResult | null> {
  if (!env.sendConfirmations) return null;
  return sendEmail(message, env, fetchImpl, smtpSender);
}
