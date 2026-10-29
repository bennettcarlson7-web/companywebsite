# Owner decisions needed

Facts the site needs but that nobody has confirmed yet. Until each is resolved, the site uses the conservative
default shown. Nothing here is presented to visitors as fact.

Last reviewed: Oct 28, 2026 (U.S. time).

## Brand, entity, and domain

| # | Decision | Current default | Where to change |
| --- | --- | --- | --- |
| 1 | ~~**Legal company name.**~~ **Resolved (owner, Oct 30, 2026):** NextMade is the customer-facing brand (nextmadelabs.com); **Blossom Technologies LLC** is the verified legal and contracting entity that owns and operates it. | Footer "© Blossom Technologies LLC · NextMade is a brand of Blossom Technologies LLC"; Privacy/Terms name the LLC as operator; About page "Our company" structure; consent text "NextMade (Blossom Technologies LLC)"; JSON-LD `name: NextMade`, `legalName: Blossom Technologies LLC`. If NextMade is used as a DBA, confirm the assumed-name filing in the LLC's state. | `company.legalName` in `src/lib/site-config.ts` |
| 2 | ~~**Company domain and inboxes.**~~ **Resolved (owner, Oct 29, 2026):** domain `nextmadelabs.com`. Clients use `hello@nextmadelabs.com` and candidates use `careers@nextmadelabs.com`. The address appears only in the footer and in email links, not in page content. | Canonical URL `https://nextmadelabs.com`. | `company` in `src/lib/site-config.ts` |
| 3 | **Email provider setup** (docs/EMAIL_SETUP.md): Cloudflare routes for `hello@` / `careers@`, Resend domain verification, DMARC, a "send as hello@" mailbox for replies, and `RESEND_API_KEY` in Vercel. Also: should the existing Zoho Mail setup replace Cloudflare routing? | Forms fall back to "email us" until a provider is configured. Confirmation emails are off. | Cloudflare DNS; Resend; `.env.local` / Vercel env vars |
| 4 | **Logo and brand mark.** The "N" mark is a placeholder created for this site. | Placeholder mark in use. | `src/components/ui/logo.tsx`, `src/app/icon.svg` |
| 5 | **Business registration / postal address**, if required for your state or for CAN-SPAM-style disclosures. | Not shown anywhere. | Privacy/Terms pages, footer |
| 6 | **Location statement**: "Remote-first, working with teams across the U.S." | Shown in footer and contact. | `siteConfig.locationStatement` |

## Team

| # | Decision | Current default |
| --- | --- | --- |
| 7 | **Headshots.** Only real, approved portraits. | Initials avatars. Add `photo` per person in `src/content/team.ts`. |
| 8 | **Public profile links** (e.g. LinkedIn), with each person's consent. | None shown. Set `profileUrl`. |
| 9 | **Short bios**, written or approved by each person. | Role-based focus line only (e.g. "Technology strategy & engineering leadership"). |
| 10 | **Founders.** Are any team members founders? The site no longer says "founder-led" because this wasn't confirmed. | "Senior-led team". |
| 11 | **Leadership note** in a leader's own words. | Not shown (`siteConfig.leadershipNote = null`). |

## Hiring

| # | Decision | Current default |
| --- | --- | --- |
| 12 | ~~**Location / workplace.**~~ **Resolved (owner, Oct 29, 2026):** remote, worldwide **outside the United States**. The U.S. is excluded because USD 2,000/month full-time (~$24k/yr) is below California, New York and other state minimum wages and the federal overtime-exempt salary threshold. | Shown on cards, job pages, and the FAQ. |
| 13 | ~~**Employment type.**~~ **Resolved:** full-time. **Still open:** *how* each hire is engaged in their country (local entity, employer-of-record service, or independent contractor). "Full-time employee" abroad usually needs an EOR or local entity; misclassifying contractors carries local legal risk. | Not stated beyond "Full-time". |
| 14 | ~~**Compensation.**~~ **Resolved:** USD 2,000 per month, all three roles. Consider whether this is competitive for *senior* engineers in your target countries. `JobPosting` structured data stays off (Google can't express "worldwide except the U.S." cleanly, and indexing is off). | Shown as "USD 2,000 per month". |
| 15 | **Work authorization / visa sponsorship** policy. | Not mentioned. |
| 16 | **Hiring process** steps and timeline. | Not described (only "a person reads every application"). |
| 17 | **Equal opportunity statement**, and any accommodation-request contact. | Not shown. Add only wording approved by counsel. |
| 18 | **Job descriptions.** Responsibilities and qualifications are proposed drafts for owner review. | Shown with a note that the description "may be refined". |
| 19 | **Applicant data handling.** Retention resolved: applications are kept up to 12 months after the role closes, and inquiries up to 24 months after last contact. **Still open:** who can read careers@ mail in the shared Gmail, and a calendar reminder to delete expired applications. | In the Privacy Policy. |

## Customer intake

| # | Decision | Current default |
| --- | --- | --- |
| 20 | **Response-time promise.** "Two business days" isn't used because it hasn't been approved. | "Every message is read by a person on our team, and we reply personally." |
| 21 | **Booking link** (Cal.com/Calendly/etc.). | "Email us to request a call". Set `BOOKING_URL`. |
| 22 | **Free intro call.** About says "a short, no-pressure conversation"; it doesn't say "free". Confirm if you want to promise that. | Neutral wording. |
| 23 | **Budget ranges** offered in the inquiry form. | Under $25k / $25–50k / $50–100k / $100k+ / Not sure. |
| 24 | **CRM.** Use HubSpot for inquiries? | Off. |

## Legal and content

| # | Decision | Current default |
| --- | --- | --- |
| 25 | **Privacy Policy: active** (owner, Oct 29, 2026). It lists the providers (Vercel, Cloudflare, Resend, Google), retention periods, international transfers, and privacy rights. Legal review is still recommended, especially for EU/UK candidates. **Terms of Use:** still a **Draft**, pending the governing-law state and counsel review. | Privacy final; Terms marked Draft. |
| 26 | **Publication date policy.** Dates use the U.S. Pacific calendar date of actual publication; no future dates. Enforced by `tests/unit/content-integrity.test.ts`. | Articles dated Oct 28, 2026. |
| 27 | **Analytics** (tool, consent banner). | None loaded. Forms emit privacy-safe `nextmade:analytics` DOM events only. |
| 28 | **Real case studies.** Portfolio entries stay "Illustrative concept — not a client project" until replaced with client-approved work. | 5 concepts. |
| 29 | **Official social profiles.** | None shown. |
