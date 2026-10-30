/**
 * Central, editable business configuration.
 *
 * `company` holds facts supplied by the business owner. Everything else a non-developer is likely to change
 * lives here or in `src/content/*`. Values that must not be invented (scheduling, socials, legal entity)
 * default to `null`; the UI checks for `null` and adapts instead of showing placeholder data as fact.
 * Open owner questions are tracked in docs/OWNER_DECISIONS.md.
 */

function optionalEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function optionalUrl(value: string | undefined): string | null {
  const v = optionalEnv(value);
  if (!v) return null;
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString().replace(/\/$/, "") : null;
  } catch {
    return null;
  }
}

/** Owner-supplied company facts (Oct 2026). */
export const company = {
  /** Customer-facing brand used across the site (owner-confirmed Oct 30, 2026). */
  displayName: "NextMade",
  /**
   * Legal and contracting entity that owns and operates the NextMade brand (owner-verified Oct 30, 2026).
   * Shown where the law or clarity needs it: copyright line, policies, terms, structured data.
   */
  legalName: "Blossom Technologies LLC",
  market: "United States",
  /** Company domain (owner-supplied). DNS on Cloudflare; inbound mail via Cloudflare Email Routing. */
  domain: "nextmadelabs.com",
  /** Public inbox for clients (owner-chosen). Cloudflare Email Routing forwards it to the team's mailbox. */
  contactEmail: "hello@nextmadelabs.com",
  /** Public inbox for candidates (owner-chosen), kept separate so applicant data can be access-restricted. */
  careersEmail: "careers@nextmadelabs.com",
  /** Sender for website notifications and confirmations. Must be on a domain verified with the provider. */
  notificationsEmail: "notifications@nextmadelabs.com",
  valueProposition: "Your Idea. Our Engineering. Real Results.",
  secondaryMessage: "You bring the idea. We help make it real.",
  stage: "Early-stage software development and IT consulting company",
} as const;

export type NavItem = { label: string; href: string };

export const siteConfig = {
  /** Brand name used across the UI — rename `company.displayName` and everything follows. */
  name: company.displayName,
  /** Legal entity name for footers, policies, and structured data. */
  legalName: company.legalName as string | null,
  tagline: company.secondaryMessage,
  description:
    "NextMade is an early-stage software development and IT consulting company. We help founders, startups, and growing businesses turn ideas into well-engineered web apps, mobile apps, AI automations, and integrations.",
  /** Shown in footer/contact. Verify before launch (see docs/OWNER_DECISIONS.md). */
  locationStatement: "Remote-first, working with teams across the U.S.",

  /**
   * Public base URL for canonical URLs, Open Graph, JSON-LD, and sitemap hosts. Defaults to the company domain;
   * `NEXT_PUBLIC_SITE_URL` overrides it (e.g. for a staging host).
   */
  url: optionalUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? `https://${company.domain}`,
  /** Search indexing is opt-in so preview deployments with draft content are not indexed. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",

  contact: {
    /** Public inbox for project inquiries (owner-supplied). */
    email: company.contactEmail as string,
    /** Public inbox for job applications and candidate questions. */
    careersEmail: company.careersEmail as string,
    /**
     * Real booking page (Cal.com, Calendly, HubSpot Meetings…). Read at build time on the server only.
     * `null` → visitors are invited to request a call by email instead.
     */
    schedulingUrl: optionalUrl(process.env.BOOKING_URL ?? process.env.NEXT_PUBLIC_SCHEDULING_URL),
    /**
     * Response-time wording. No turnaround is promised until the owner approves one
     * (e.g. "We aim to reply within two business days.").
     */
    responseTime: "Every message is read by a person on our team, and we reply personally.",
  },

  social: {
    linkedin: optionalUrl(process.env.NEXT_PUBLIC_LINKEDIN_URL),
    github: optionalUrl(process.env.NEXT_PUBLIC_GITHUB_URL),
    x: optionalUrl(process.env.NEXT_PUBLIC_X_URL),
  },

  cta: {
    primary: { label: "Tell Us About Your Project", href: "/contact" },
    secondary: { label: "Explore Our Work", href: "/work" },
    header: { label: "Start a Project", href: "/contact" },
    careers: { label: "Explore Open Roles", href: "/careers" },
    schedule: "Book a Discovery Call",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Work", href: "/work" },
    { label: "Process", href: "/process" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "Careers", href: "/careers" },
  ] satisfies NavItem[],

  /**
   * A short first-person note from leadership, in their own words. `null` → not shown.
   * Never write this on someone's behalf.
   */
  leadershipNote: null as { body: string; signature: string } | null,

  legal: {
    /** Privacy Policy is in effect (owner-approved Oct 29, 2026, with retention periods). */
    privacy: { draft: false, lastUpdated: "2026-10-30" },
    /** Terms stay a draft until the governing-law state is chosen and counsel has reviewed them. */
    terms: { draft: true, lastUpdated: "2026-10-28" },
    /** Governing-law state for the Terms page, e.g. "Delaware". `null` → shown as a draft placeholder. */
    governingLaw: null as string | null,
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function getCareersEmail(): string {
  return siteConfig.contact.careersEmail;
}

/** Absolute URL for a path when the public base URL is configured, otherwise `null`. */
export function absoluteUrl(path = "/"): string | null {
  if (!siteConfig.url) return null;
  return new URL(path, `${siteConfig.url}/`).toString();
}

export function copyrightHolder(): string {
  return siteConfig.legalName ?? siteConfig.name;
}

/** "NextMade is a brand of Blossom Technologies LLC." — or `null` when brand and legal entity are the same. */
export function brandOwnershipStatement(): string | null {
  const legal = siteConfig.legalName;
  return legal && legal !== siteConfig.name ? `${siteConfig.name} is a brand of ${legal}.` : null;
}

/** "NextMade (Blossom Technologies LLC)" for consent text, so people know who receives their data. */
export function brandWithEntity(): string {
  const legal = siteConfig.legalName;
  return legal && legal !== siteConfig.name ? `${siteConfig.name} (${legal})` : siteConfig.name;
}

/** How the operator is named in policies: "Blossom Technologies LLC, which operates NextMade" or just the brand. */
export function operatorName(): string {
  const legal = siteConfig.legalName;
  return legal && legal !== siteConfig.name ? `${legal}, which operates ${siteConfig.name}` : siteConfig.name;
}

/** Email subject lines, so both tracks are easy to filter in the shared inbox. */
export const emailSubjects = {
  inquiry: `Project inquiry — ${company.displayName}`,
  inquiryReceived: `We received your project inquiry — ${company.displayName}`,
  applicationReceived: (roleTitle: string) => `We received your application: ${roleTitle} — ${company.displayName}`,
  application: (roleTitle: string) => `[${company.displayName} Careers] ${roleTitle} — Application`,
  careersQuestion: `Careers question — ${company.displayName}`,
  callRequest: `Call request — ${company.displayName}`,
};

/** `mailto:` link with an optional prefilled subject and body. */
export function mailtoHref(to: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  // URLSearchParams encodes spaces as "+", which some mail clients show literally.
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${to}${query ? `?${query}` : ""}`;
}
