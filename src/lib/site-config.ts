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
  /** Current site brand. The legal company name is NOT yet confirmed (see docs/OWNER_DECISIONS.md). */
  displayName: "Nextmade",
  market: "United States",
  /**
   * Public business inbox. Note: its domain (mentortech.space) differs from the brand; the relationship
   * between them is an open owner decision and is not stated anywhere on the site.
   */
  contactEmail: "rpatdu@mentortech.space",
  valueProposition: "Your Idea. Our Engineering. Real Results.",
  secondaryMessage: "You bring the idea. We help make it real.",
  stage: "Early-stage software development and IT consulting company",
} as const;

export type NavItem = { label: string; href: string };

export const siteConfig = {
  /** Brand name used across the UI — rename `company.displayName` and everything follows. */
  name: company.displayName,
  /** Legal entity name for footers and policies. `null` until confirmed by the owner. */
  legalName: null as string | null,
  tagline: company.secondaryMessage,
  description:
    "Nextmade is an early-stage software development and IT consulting company. We help founders, startups, and growing businesses turn ideas into well-engineered web apps, mobile apps, AI automations, and integrations.",
  /** Shown in footer/contact. Verify before launch (see docs/OWNER_DECISIONS.md). */
  locationStatement: "Remote-first, working with teams across the U.S.",

  /** Public base URL, e.g. https://www.example.com. Enables canonical URLs and sitemap hosts. */
  url: optionalUrl(process.env.NEXT_PUBLIC_SITE_URL),
  /** Search indexing is opt-in so preview deployments with draft content are not indexed. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",

  contact: {
    /** Public inbox for project inquiries (owner-supplied). */
    email: company.contactEmail as string,
    /** Public inbox for job applications. Same inbox until the owner sets up a separate one. */
    careersEmail: company.contactEmail as string,
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
    /** Policies are drafts until reviewed by qualified counsel. Flip to false after review. */
    policiesAreDrafts: true,
    lastUpdated: "2026-10-28",
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

/** Email subject lines, so both tracks are easy to filter in the shared inbox. */
export const emailSubjects = {
  inquiry: `Project inquiry — ${company.displayName}`,
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
