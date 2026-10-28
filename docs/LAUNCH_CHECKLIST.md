# Launch checklist

Work through this before pointing a real domain at the site and enabling indexing.

## 1. Business information to verify

- [ ] Final brand name (`siteConfig.name`) and that it is clear to use (trademark/domain search).
- [ ] Legal entity formed; set `siteConfig.legalName` (used in the footer copyright and policies).
- [ ] `siteConfig.locationStatement` ("Remote-first, working with teams across the U.S.") is accurate.
- [ ] Claims in copy are true and you're comfortable standing behind them, especially:
  - "Senior technical guidance" / "small, senior team" (home, About)
  - "free, no-pressure" intro call (About → How engagements work)
  - Response-time promise (`siteConfig.contact.responseTime`)
  - Engineering time-zone overlap wording (Dedicated Teams FAQ)
  - Code/IP ownership summary (Process page, FAQ) matches your actual contract template
- [ ] Technology lists reflect real experience (`src/content/home.ts`, `services.ts`).
- [ ] Concept projects stay labeled as concepts; replace with case studies only with written client approval
      of every fact, name, logo, and metric.
- [ ] Team profiles (`siteConfig.team`) and founder note (`siteConfig.founderNote`) added only with consent.
- [ ] Open roles (`siteConfig.openRoles`) only if actively hiring.
- [ ] Article dates and content reviewed; add an author byline only for a real, consenting person.

## 2. Contact, email, and scheduling

- [ ] Domain email set up (e.g. `hello@yourdomain.com`) with SPF, DKIM, and DMARC.
- [ ] `NEXT_PUBLIC_CONTACT_EMAIL` (and optionally `NEXT_PUBLIC_CAREERS_EMAIL`) set.
- [ ] Resend: domain verified; `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` set in production.
- [ ] Send a real test inquiry from production and confirm it arrives, reply-to works, and it isn't in spam.
- [ ] Confirm the "demo mode" notice disappears after configuring (it's evaluated at build time, so redeploy).
- [ ] Upstash Redis configured for distributed rate limiting (required on serverless hosting).
- [ ] Optional HubSpot: private app token with `crm.objects.contacts.write`; test that a contact is created.
- [ ] Optional scheduling: `NEXT_PUBLIC_SCHEDULING_URL` points to a live booking page with sensible availability.
- [ ] Someone owns the inbox and can actually meet the stated response time.

## 3. Privacy, legal, and consent

- [ ] Privacy Policy and Terms reviewed by qualified counsel; bracketed placeholders resolved.
- [ ] Service providers listed in the Privacy Policy (host, email provider, CRM).
- [ ] Data retention period decided and stated.
- [ ] Governing-law state set (`siteConfig.legal.governingLaw`).
- [ ] After review, set `siteConfig.legal.policiesAreDrafts = false` and update `lastUpdated`.
- [ ] Analytics: none is installed. If you add any, choose a privacy-friendly tool, add a consent mechanism
      where required, update the Privacy Policy, and extend the CSP `connect-src`/`script-src`.

## 4. Domain, hosting, and SEO

- [ ] Production domain connected with HTTPS; `www`/apex redirect chosen.
- [ ] `NEXT_PUBLIC_SITE_URL` set to the canonical origin (no trailing slash).
- [ ] `NEXT_PUBLIC_ALLOW_INDEXING=true` on **production only** (never on preview deployments).
- [ ] Redeploy, then verify `/robots.txt` allows crawling and `/sitemap.xml` has absolute URLs.
- [ ] Submit the sitemap in Google Search Console and Bing Webmaster Tools.
- [ ] Validate structured data with Google's Rich Results Test.
- [ ] Check social previews (LinkedIn Post Inspector, etc.) for the OG image.
- [ ] Social profile URLs set (or left empty to hide).

## 5. Manual QA

Test at roughly 375, 768, 1280, and 1440+ px wide, in Chrome, Safari (iOS and macOS), Firefox, and Edge.

- [ ] Every nav link and footer link works; the active nav state is correct.
- [ ] Mobile menu opens, traps focus, closes with Escape, the X button, the backdrop, and link taps; page scroll is locked while open.
- [ ] Keyboard-only pass: skip link, visible focus everywhere, FAQ toggles, form fully operable.
- [ ] Screen reader spot check (VoiceOver and/or NVDA): headings, landmarks, form labels, error summary, status messages.
- [ ] Contact form: empty submit → error summary; invalid email → inline error; valid submit → real delivery;
      provider outage (temporarily bad API key) → error message and the visitor's input is kept.
- [ ] Reduced-motion setting turns off float and reveal animations.
- [ ] 200% browser zoom and large text settings: no clipped or overlapping content.
- [ ] Lighthouse/PageSpeed on production: Performance, Accessibility, Best Practices, SEO. Track Core Web Vitals
      (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1) with field data once traffic exists.
- [ ] `npm run check` and `npm run test:e2e` pass on the release commit.
