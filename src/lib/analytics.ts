/**
 * First-party, privacy-safe analytics hook for form outcomes. Page views are counted separately by Vercel Web
 * Analytics (`<Analytics />` in the root layout); custom events there need a Vercel Pro plan, so these stay local.
 *
 * Events are dispatched as a `nextmade:analytics` DOM event and pushed to `window.dataLayer` only if a
 * consented tag manager has already created it. Properties must never contain personal data: no names,
 * emails, descriptions, introductions, or links — only event names and non-identifying labels like a role slug.
 */
export type AnalyticsEvent =
  | { name: "project_inquiry_submitted"; props: { outcome: string; projectType?: string } }
  | { name: "job_application_submitted"; props: { outcome: string; role?: string } };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("nextmade:analytics", { detail: event }));
  if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: event.name, ...event.props });
}
