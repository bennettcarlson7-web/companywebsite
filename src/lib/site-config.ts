/**
 * Central, editable business configuration.
 *
 * Everything a non-developer is likely to change lives here or in `src/content/*`.
 * Values that must not be invented (contact details, scheduling, socials, legal entity)
 * default to `null` and are filled in through environment variables or by editing this file.
 * The UI checks for `null` and adapts instead of showing placeholder data as if it were real.
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

export type NavItem = { label: string; href: string };

export const siteConfig = {
  /** Working brand name — rename here and everything follows. */
  name: "Nextmade",
  /** Legal entity name for footers and policies. `null` until the entity is formed/verified. */
  legalName: null as string | null,
  tagline: "You bring the idea. We help make it real.",
  description:
    "Nextmade is a product-minded software development and IT consulting studio. We help founders, startups, and growing businesses turn ideas into well-engineered web apps, mobile apps, AI automations, and integrations.",
  /** Shown in footer/contact. Verify before launch (see docs/LAUNCH_CHECKLIST.md). */
  locationStatement: "Remote-first, working with teams across the U.S.",

  /** Public base URL, e.g. https://www.example.com. Enables canonical URLs and sitemap hosts. */
  url: optionalUrl(process.env.NEXT_PUBLIC_SITE_URL),
  /** Search indexing is opt-in so preview deployments with draft content are not indexed. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",

  contact: {
    /** Public inbox for project inquiries. */
    email: optionalEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    /** Public inbox for job interest. Falls back to the contact email when unset. */
    careersEmail: optionalEnv(process.env.NEXT_PUBLIC_CAREERS_EMAIL),
    /** Real booking page (Cal.com, Calendly, HubSpot Meetings…). */
    schedulingUrl: optionalUrl(process.env.NEXT_PUBLIC_SCHEDULING_URL),
    /** Plain-language promise about response time. Keep it something you can actually meet. */
    responseTime: "We aim to reply within two business days.",
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
   * Real open roles only. Leave empty when nothing is open — the careers page then says so.
   * Example: { title: "Senior Full-Stack Engineer", type: "Contract", location: "Remote (U.S.)", href: "https://…" }
   */
  openRoles: [] as { title: string; type: string; location: string; href: string }[],

  /**
   * Real team members only (with their consent). Empty → the About page explains that
   * profiles are coming and invites visitors to ask who they would work with.
   */
  team: [] as { name: string; role: string; bio: string }[],

  /**
   * The founder's own words. `null` → the About page shows the company-level story only.
   * Replace with a short first-person note written by the founder.
   */
  founderNote: null as { body: string; signature: string } | null,

  legal: {
    /** Policies are drafts until reviewed by qualified counsel. Flip to false after review. */
    policiesAreDrafts: true,
    lastUpdated: "2026-10-29",
    /** Governing-law state for the Terms page, e.g. "Delaware". `null` → shown as a draft placeholder. */
    governingLaw: null as string | null,
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function getCareersEmail(): string | null {
  return siteConfig.contact.careersEmail ?? siteConfig.contact.email;
}

/** Absolute URL for a path when the public base URL is configured, otherwise `null`. */
export function absoluteUrl(path = "/"): string | null {
  if (!siteConfig.url) return null;
  return new URL(path, `${siteConfig.url}/`).toString();
}

export function copyrightHolder(): string {
  return siteConfig.legalName ?? siteConfig.name;
}
