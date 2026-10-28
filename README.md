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
    forms/              ContactForm (client)
  content/              services.ts, projects.ts, process.ts, faqs.ts, home.ts, insights/*.mdx
  lib/
    site-config.ts      ← brand name, contact details, CTAs, nav, roles, team, legal flags
    seo.tsx             Metadata builder + JSON-LD (only accurate facts)
    validation/         Shared Zod inquiry schema
    integrations/       Inquiry pipeline, rate limiting, Resend + HubSpot adapters
  styles/globals.css    Design tokens (Tailwind @theme)
  types/                Content types
tests/
  unit/                 Validation, inquiry pipeline, rate limiter, email escaping, ContactForm
  e2e/                  Routes, navigation, mobile menu, contact states, API guards
docs/                   Implementation plan, launch checklist
```

## Editing content

- **Business details, brand name, CTAs, nav, open roles, team:** `src/lib/site-config.ts`
- **Services** (cards, detail pages, FAQs): `src/content/services.ts`
- **Portfolio:** `src/content/projects.ts`. All entries are `kind: "concept"` and render an
  "Illustrative project" label. Add real work as `kind: "case-study"` only with client-approved facts.
- **Process, home-page copy, FAQs:** `src/content/process.ts`, `home.ts`, `faqs.ts`
- **Articles:** add `src/content/insights/my-article.mdx`, then register it with metadata in
  `src/content/insights/index.ts`. Headings in MDX start at `##`.
- **Legal pages:** `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`. Set
  `siteConfig.legal.policiesAreDrafts = false` only after legal review.

A headless CMS can later replace `src/content/*` behind the same accessor functions
(`getServices`, `getProjects`, `getArticles`) without changing UI components.

## Environment variables

See [.env.example](.env.example) for the full annotated list.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build | Canonical base URL; enables canonical tags, JSON-LD, absolute sitemap |
| `NEXT_PUBLIC_ALLOW_INDEXING` | build | `true` to allow search engines (also requires the URL) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | build | Public inbox shown on the site and used for mailto fallbacks |
| `NEXT_PUBLIC_CAREERS_EMAIL` | build | Optional careers inbox |
| `NEXT_PUBLIC_SCHEDULING_URL` | build | Real booking link; without it, "discovery call" CTAs go to `/contact` |
| `NEXT_PUBLIC_LINKEDIN_URL` / `_GITHUB_URL` / `_X_URL` | build | Footer social links (hidden when empty) |
| `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL` | server | Email delivery of inquiries (all three required) |
| `HUBSPOT_ACCESS_TOKEN` | server | Optional: also create a HubSpot contact |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | server | Optional distributed rate limiting |
| `INQUIRY_RATE_LIMIT_MAX`, `INQUIRY_RATE_LIMIT_WINDOW_SECONDS` | server | Defaults: 5 per 600 s per IP |

`NEXT_PUBLIC_*` values are inlined at **build** time, so rebuild after changing them. Server-only values are read
per request by `/api/inquiry`.

## Lead handling

`POST /api/inquiry` runs: same-origin check → JSON content type and 16 KB body cap → rate limit →
honeypot and minimum fill-time check → Zod validation → delivery.

- **Configured** (Resend and/or HubSpot): the visitor sees "received" only after the primary provider accepts
  the message. Provider failures return a clear error, and the form keeps the visitor's input.
- **Unconfigured**: the server returns `503 { status: "unconfigured" }`. The form says plainly that nothing was
  sent and offers a copyable summary, plus a pre-filled email link if `NEXT_PUBLIC_CONTACT_EMAIL` is set. The
  contact page also shows a "demo mode" notice before submission.
- **Logging**: only outcome codes are logged, never names, emails, or descriptions.

**Rate limiting on serverless:** the default limiter keeps counts in process memory, so each serverless instance
has its own counter and it resets on cold starts. That is fine for development, but it is not real protection
in production. Configure Upstash Redis (free tier is sufficient) to get a shared limit.

To enable email with Resend: verify your sending domain in Resend, create an API key, and set
`RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, and `INQUIRY_FROM_EMAIL` (e.g. `Nextmade Website <inquiries@yourdomain.com>`).

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
