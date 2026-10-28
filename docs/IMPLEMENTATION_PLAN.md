# Nextmade website — implementation plan & assumptions

## Starting point

- The workspace was empty (no existing code to preserve). `references/website-preview.png`
  was not present on disk; the design montage was supplied directly in the conversation and
  used as the visual reference.
- Node.js was not installed. A portable Node.js 24 LTS (v24.22.2, checksum-verified) was
  installed under `%USERPROFILE%\.local` and added to the user `PATH`. Node 26 became LTS one
  day before this work started, so the mature 24.x line was chosen for ecosystem compatibility.

## Stack (versions resolved at install time)

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16.4 App Router, Turbopack, **Cache Components + Partial Prefetching on** (framework default) |
| UI | React 19.3, TypeScript 5 (strict), Tailwind CSS 4, Lucide icons |
| Content | Typed TS modules for services/projects/FAQs; MDX (`@next/mdx` + `remark-gfm`) for articles |
| Validation | Zod 4 (shared client/server schema) |
| Email | Resend REST API via a small adapter (no SDK dependency) |
| CRM | Optional HubSpot adapter (disabled unless a token is set) |
| Rate limiting | In-memory fixed window (single instance) or Upstash Redis REST (distributed) when configured |
| Tests | Vitest + Testing Library (unit/component), Playwright (E2E smoke) |

TypeScript 7 (native compiler) was available but skipped: Next's type-checking and
typescript-eslint still target the TS 5 JS API.

## Architecture

```
src/
  app/                 routes, metadata routes (robots, sitemap, OG image), API route
  components/
    layout/            Header, MobileNav, Footer, Container, SkipLink
    sections/          page sections (Hero, ServicesGrid, ProcessSteps, FAQ, CTA…)
    ui/                Button, SectionHeader, Badge, Breadcrumbs, Reveal, Logo…
    visuals/           original CSS/SVG illustrations (hero, concept projects, articles)
    forms/             ContactForm (client)
  content/             services.ts, projects.ts, faqs.ts, process.ts, insights/*.mdx
  lib/
    site-config.ts     ALL editable business data + brand name
    seo.ts             metadata + JSON-LD helpers
    validation/        Zod inquiry schema
    inquiry/           server-side handler, spam checks, rate limit, email/CRM adapters
  styles/globals.css   design tokens (Tailwind @theme)
  types/               shared content types
```

- Every marketing page is static (prerendered). Articles are statically imported MDX — no
  runtime file-system access, which keeps them compatible with Cache Components.
- The only dynamic endpoint is `POST /api/inquiry`.
- A headless CMS can later replace `src/content/*` behind the same typed accessors
  (`getServices()`, `getProjects()`, `getArticles()`), without touching UI components.

## Honesty guardrails (applied throughout)

- No client logos, testimonials, metrics, years in business, team size, addresses, or
  certifications. Technology names appear as plain text under “Technologies we work with”
  with an explicit no-affiliation note.
- All three portfolio entries are labeled **Concept / Illustrative project** on cards and
  detail pages.
- No team members or headshots are shown. Team/founder content is driven by config and shows
  an honest placeholder when empty.
- No open roles are listed (config-driven; empty by default).
- Contact email, scheduling URL, social links, and legal entity are `null` unless configured
  through environment variables / `site-config.ts`. The UI adapts instead of showing fake data.
- The inquiry form never shows "sent" unless an email provider actually accepted the message.
- Privacy and Terms pages are clearly marked DRAFT.

## Assumptions

1. Brand name “Nextmade” is a working name; change `site.name` in `src/lib/site-config.ts`.
2. Location statement defaults to “Remote-first, working with teams across the U.S.” —
   verify before launch (listed in the launch checklist).
3. Search-engine indexing is **off** until `NEXT_PUBLIC_SITE_URL` is set and
   `NEXT_PUBLIC_ALLOW_INDEXING=true`, so preview deployments with draft content are not indexed.
4. No analytics or tracking scripts are included until consent/legal decisions are made.
5. The hero uses an original CSS/SVG product-collaboration illustration rather than stock
   photography, avoiding licensing questions and keeping LCP text-based.
6. CSP uses `'unsafe-inline'` for scripts/styles because nonce-based CSP would force every page
   to render dynamically; see README → Security.

## Build sequence

1. Tokens + layout components → 2. content modules → 3. all routes → 4. inquiry backend →
5. SEO/a11y/security → 6. tests → 7. lint/typecheck/test/build → 8. screenshot QA at
375 / 768 / 1280 / 1440 → 9. README + launch checklist.
