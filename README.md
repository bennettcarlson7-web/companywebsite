# Nextmade website

Marketing site for **Nextmade** (working brand name), a software development and IT consulting studio.
Built with Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript (strict), Tailwind CSS 4,
Lucide icons, MDX articles, and Zod-validated lead handling.

> This is a seed-stage business. The site deliberately contains **no** invented clients, logos, testimonials,
> metrics, team members, addresses, or open roles. See [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)
> before going live.

## Requirements

- Node.js **20.9+** (developed on Node 24 LTS)
- npm 10+

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — everything works unconfigured
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (all marketing pages are prerendered) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | Generates route types (`next typegen`) and runs `tsc --noEmit` |
| `npm run test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright smoke tests (desktop + mobile). Run `npm run build` first; first time also `npx playwright install chromium` |
| `npm run check` | lint → typecheck → test → build |

## Project structure

```
src/
  app/                  Routes, metadata routes (robots, sitemap, OG image), /api/inquiry
  components/
    layout/             Header, MobileNav (native <dialog>), Footer
    sections/           Page sections + cards (Service/Project/Article/ProcessStep), FAQ, CTA, PageHero
    ui/                 Button, primitives (Container, Section, SectionHeader, Badge…), Breadcrumbs, Reveal, Logo
    visuals/            Original CSS/SVG illustrations (no stock photography)
    forms/              ProjectInquiryForm, CandidateApplicationForm, shared form-kit (client)
    team/, careers/     TeamCard (initials avatars), JobCard
  content/              team.ts, jobs.ts, services.ts, projects.ts, process.ts, faqs.ts, home.ts, insights/
  lib/
    site-config.ts      ← company facts (brand, business email), CTAs, nav, legal flags
    seo.tsx             Metadata builder + JSON-LD (only accurate facts; JobPosting gated)
    validation/         project-inquiry.ts, job-application.ts, shared.ts (Zod)
    integrations/       submission guard, inquiry + application handlers, Resend + HubSpot adapters, rate limiting
    analytics.ts        Privacy-safe first-party event hook (no third-party scripts)
  styles/globals.css    Design tokens (Tailwind @theme)
  types/                Content types
tests/
  unit/                 Validation, inquiry pipeline, rate limiter, email escaping, ContactForm
  e2e/                  Routes, navigation, mobile menu, contact states, API guards
docs/                   Implementation plan, launch checklist
```

## Editing content

- **Company facts (brand, business email), CTAs, nav:** `src/lib/site-config.ts` (`company` export)
- **Team:** `src/content/team.ts`. Exact names/roles only; add `photo`/`profileUrl` only when real and approved.
- **Jobs:** `src/content/jobs.ts`. Unconfirmed facts (location, type, pay) stay `null`; see `docs/OWNER_DECISIONS.md`.
- **Open owner questions:** `docs/OWNER_DECISIONS.md`. **Launch status:** `docs/FINAL_LAUNCH_AUDIT.md`.
- **Services** (cards, detail pages, FAQs): `src/content/services.ts`
- **Portfolio:** `src/content/projects.ts`. All entries are `kind: "concept"` and render an
  "Illustrative concept — not a client project" label. Add real work as `kind: "case-study"` only with client-approved facts.
- **Process, home-page copy, FAQs:** `src/content/process.ts`, `home.ts`, `faqs.ts`
- **Articles:** add `src/content/insights/my-article.mdx`, add its metadata to `src/content/insights/meta.ts`
  (U.S. Pacific publish date, never in the future; a test enforces this), and register the body in `index.ts`.
  Headings in MDX start at `##`.
- **Legal pages:** `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`. Set
  `siteConfig.legal.policiesAreDrafts = false` only after legal review.

A headless CMS can later replace `src/content/*` behind the same accessor functions
(`getServices`, `getProjects`, `getArticles`) without changing UI components.

## Environment variables

See [.env.example](.env.example) for the full annotated list.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build | Canonical base URL override (default `https://nextmadelabs.com`) |
| `NEXT_PUBLIC_ALLOW_INDEXING` | build | `true` to allow search engines (production only) |
| `NEXT_PUBLIC_LINKEDIN_URL` / `_GITHUB_URL` / `_X_URL` | build | Footer social links (hidden when empty) |
| `BOOKING_URL` | build (server) | Real booking link; without it, visitors are asked to request a call by email |
| `RESEND_API_KEY` | server | **Recommended.** Sends as `notifications@nextmadelabs.com` once the domain is verified in Resend |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | server | Fallback when Resend isn't set: send through an existing mailbox (as that mailbox) |
| `EMAIL_FROM` | server | Sender override. Default `Nextmade <notifications@nextmadelabs.com>` (Resend) or the SMTP mailbox |
| `BUSINESS_CONTACT_EMAIL` | server | Inquiry recipient (default `hello@nextmadelabs.com`) |
| `HIRING_EMAIL` | server | Application recipient (default `careers@nextmadelabs.com`) |
| `SEND_CONFIRMATION_EMAILS` | server | `true` to email a "we received it" note to the client/candidate (never echoes their text) |
| `HUBSPOT_ACCESS_TOKEN` | server | Optional: also create a HubSpot contact for **project inquiries only** |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | server | Distributed rate limiting (recommended on Vercel) |
| `INTAKE_RATE_LIMIT_MAX`, `INTAKE_RATE_LIMIT_WINDOW_SECONDS` | server | Per form, per IP. Defaults: 5 per 600 s |

The domain and public addresses (`hello@` and `careers@nextmadelabs.com`) are owner-supplied and live in `company`
in `src/lib/site-config.ts`, not in env vars. Legacy names (`INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`, `NEXT_PUBLIC_SCHEDULING_URL`,
`INQUIRY_RATE_LIMIT_*`) are still read as fallbacks.

Build-time values are inlined when the site is built, so redeploy after changing them. Server-only values are read
per request by the API routes.

## Lead and application handling

Two separate tracks share one abuse guard (same-origin check → JSON content type and 16 KB cap → per-form, per-IP
rate limit → honeypot and minimum fill time → submission-ID dedupe), then diverge:

| | Project inquiry | Job application |
| --- | --- | --- |
| Page / form | `/contact` · `ProjectInquiryForm` | `/careers/apply?role=<slug>` · `CandidateApplicationForm` |
| Endpoint | `POST /api/inquiry` | `POST /api/apply` |
| Schema | `lib/validation/project-inquiry.ts` | `lib/validation/job-application.ts` (https-only links, no uploads) |
| Delivered to | `BUSINESS_CONTACT_EMAIL` (+ optional HubSpot) | `HIRING_EMAIL` (email only, never the CRM) |
| Subject | `[Nextmade Inquiry] <type> — <name>` | `[Nextmade Careers] <role> — Application` |
| Analytics event | `project_inquiry_submitted` (outcome, project type) | `job_application_submitted` (outcome, role slug) |

- **Configured:** the visitor sees "received" only after the mail server (SMTP) or Resend accepts the message. Failures say "not sent"
  and keep the input. `from` is always `EMAIL_FROM`; the visitor or candidate is only `reply_to`.
- **Unconfigured (fails closed):** the API returns `503 { status: "unconfigured" }`, and the form says nothing was
  sent and offers a one-click prefilled email to the right inbox plus a copyable summary. The email address itself
  is not printed in page content (only the footer shows it).
- **Logging:** outcome codes only (plus the role slug for applications), never names, emails, links, or text.
- **Analytics:** no third-party scripts. Events are dispatched as `nextmade:analytics` DOM events (and pushed to
  `window.dataLayer` only if a consented tag manager creates it), without personal data.

**Rate limiting on serverless:** without Upstash, counts live in each serverless instance's memory and reset on
cold starts, which isn't real protection. Configure Upstash Redis before enabling delivery.

### Where submissions go (one-click, like an ATS)

Like Greenhouse or Lever, the site **saves every accepted application and inquiry first**. Email is a notification on
top. Visitors click Submit once and see "We received…" as soon as the submission is saved *or* emailed. If neither
worked, they get an honest error, never a false confirmation.

| Where it runs | Saved to | Read them with |
| --- | --- | --- |
| Local / any long-running server | `.data/submissions/applications.jsonl` and `inquiries.jsonl` (git-ignored, owner-only file permissions) | `npm run submissions` (`-- applications` or `-- inquiries`) |
| Vercel (serverless) | Upstash Redis, when `UPSTASH_REDIS_REST_URL`/`TOKEN` (or Vercel Storage's `KV_REST_API_URL`/`TOKEN`) are set. Kept for the Privacy Policy retention periods (TTL) | `npm run submissions` with the Upstash vars in `.env.local`, or the Upstash console |

On Vercel, set Upstash **or** email. With neither, there's nowhere durable to put a submission, so the form falls back
to the "send by email" screen. `SUBMISSIONS_DIR` overrides the folder (`off` disables file storage).

### Enabling email delivery

Full owner steps, including the DNS records: **[docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md)**. In short:

- **Receiving:** Cloudflare Email Routing (already the domain's MX) forwards `hello@` and `careers@nextmadelabs.com` to
  the team's mailbox. Create both routes.
- **Sending (recommended): Resend.** Verify `nextmadelabs.com` in Resend (DKIM + `send` subdomain records in
  Cloudflare), add DMARC, set `RESEND_API_KEY`, and redeploy. Notifications go *from* `notifications@`, *to* `hello@` /
  `careers@`, with *Reply-To* set to the visitor or candidate.
- **Confirmations:** with `SEND_CONFIRMATION_EMAILS=true`, the visitor or candidate gets a short "we received it" email
  after our copy is delivered. Its Reply-To is `hello@` / `careers@`. It never repeats their text, and a failed
  confirmation never changes their result.
- **Fallback: SMTP** through an existing mailbox (e.g. `SMTP_HOST=mail.privateemail.com`, port 465). Used only when
  `RESEND_API_KEY` is empty.

If nothing is configured, or the provider rejects a message, the visitor sees "we couldn't send your
inquiry/application from the website" with a one-click prefilled email instead. Never a false confirmation.
## SEO

- Per-page metadata via `buildMetadata()`, title template, Open Graph/Twitter cards, and a generated default OG
  image (`src/app/opengraph-image.tsx`).
- `robots.txt` disallows all crawling until both `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ALLOW_INDEXING=true` are
  set, and every page also emits `noindex` in that state, so preview deployments are never indexed.
- `sitemap.xml` covers all routes, services, projects, and articles.
- JSON-LD: Organization, WebSite, BreadcrumbList, Service, Article (publisher only, no invented author), and
  FAQPage. Emitted only once a public URL is configured.

## Accessibility

Targets WCAG 2.2 AA: skip link, landmark structure, one `h1` per page, visible focus rings, AA color contrast
(tokens documented in `globals.css`), native `<details>` FAQ, native `<dialog>` mobile menu (focus containment,
Escape, focus return), labeled inputs with hints, inline errors plus a focusable error summary, ≥44 px touch
targets, and `prefers-reduced-motion` support. Scroll-reveal animations never hide content for visitors without
JS or with reduced motion.

## Security

Security headers are set in `next.config.ts`: CSP, HSTS (production), `X-Content-Type-Options`,
`X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and `poweredByHeader: false`. No secrets
reach the browser; all integrations run in the route handler.

The CSP allows `'unsafe-inline'` for scripts because Next's inline bootstrap scripts need either that or
per-request nonces, and nonces would force every page to render dynamically. If you later add third-party
scripts or need a stricter policy, move to a nonce-based CSP in `src/proxy.ts` (see the Next.js
"Content Security Policy" guide in `node_modules/next/dist/docs`) and accept dynamic rendering.

## Deployment

The site is a standard Next.js app.

- **Vercel (simplest):** import the repository, set environment variables (Production and Preview separately —
  keep `NEXT_PUBLIC_ALLOW_INDEXING` unset on Preview), and deploy. Add Upstash for rate limiting.
- **Self-hosted Node:** `npm ci && npm run build && npm run start` behind a reverse proxy that terminates TLS and
  sets `X-Forwarded-For`/`X-Forwarded-Host`.

Cache Components require the Node.js runtime (no edge runtime for pages).

## Phase 1 non-goals

No chatbot, client portal, proposal engine, applicant tracking, CMS dashboard, or database. The content layer and
integration adapters are separated so these can be added later.
