# Final launch audit

**Question:** can this site be published as a real U.S. software consultancy website that accepts client
inquiries and job applications?

**Answer:** The website itself is ready to show, but **not ready to accept submissions** and **not ready to advertise
the roles publicly**. In its current fail-closed state it can be published safely: every form path is honest, and
the email fallbacks work. The blockers below are mostly owner inputs and credentials, not code.

Audited Oct 28–29, 2026 on branch `update/team-careers-launch` (local production build, no credentials). The live
site (companywebsite-smoky.vercel.app) still serves `version1.0` and was not changed.

## Top 5 launch blockers

1. **Email delivery is unverified.** The site sends as `notifications@nextmadelabs.com` via Resend, with SMTP as a fallback,
   to `hello@` / `careers@nextmadelabs.com`, which Cloudflare Email Routing forwards. No provider key was available here,
   and the Resend DNS records don't exist yet, so no real message has been delivered. Until then, both forms fall back to
   "we couldn't send it from the website — email us". *Owner:* follow `docs/EMAIL_SETUP.md`, then test both forms.
2. **How international hires are engaged is undefined.** Job terms are now shown: remote worldwide outside the U.S.,
   full-time, USD 2,000/month. "Full-time" abroad usually needs a local entity or an employer-of-record service,
   otherwise it's a contractor relationship with misclassification risk. Decide this before making offers. The U.S. is
   excluded because this pay is below several state minimum wages and the federal overtime-exempt salary threshold.
3. **Cloudflare routes not yet confirmed.** `hello@` / `careers@` must forward to the team Gmail inbox (owner-provided
   destination). Until they do, mail to those addresses, and the site's notifications, will bounce.
4. **Terms of Use are still a draft** (no governing-law state). The **Privacy Policy is now active**, with retention
   periods, providers, transfers, and rights. Counsel review is still recommended for EU/UK candidates.
5. **Upstash is needed on Vercel.** It now does two jobs: durable storage of submissions (so one-click submit works on
   the live site without email) and distributed rate limiting. Set `UPSTASH_REDIS_REST_URL`/`TOKEN` in Vercel before
   launch. Locally, submissions are saved to `.data/submissions` and read with `npm run submissions`.

## Checks

| Check | Result | Evidence | Next action |
| --- | --- | --- | --- |
| Lint / typecheck / unit tests / build | PASS | `npm run check`: 0 lint problems, tsc clean, 65/65 tests, build OK | — |
| E2E suite (desktop + Pixel 7) | PASS | 113 passed, 9 skipped by design | Run in CI on every PR |
| All routes return 200 with one `h1` and a title | PASS | E2E "routes" (25 routes × 2 devices) | — |
| Not-found states (page, service slug, job slug) | PASS | E2E: 404s | — |
| Title/description/Open Graph per page | PASS | E2E checks og:title/og:image; the OG image was missing on custom-metadata pages — fixed | Check previews with LinkedIn Post Inspector after deploy |
| Canonical URLs | PASS (local) | Default base `https://nextmadelabs.com` (unit test); canonical tags emitted | View source on the live domain after deploy |
| robots.txt / sitemap.xml | PASS | robots disallows all (indexing off by design); sitemap includes 3 job pages, excludes the apply form | Set `NEXT_PUBLIC_ALLOW_INDEXING=true` on production only after the blockers clear |
| Team names/roles consistent, mobile + desktop | PASS | Unit (exact list/order) + E2E on both devices | Add portraits/bios only with consent |
| No fabricated bios, photos, logos, stats, certifications | PASS | Team data has `photo`/`profileUrl` = null (test-enforced); no logos or metrics in source | Keep `content-integrity.test.ts` in CI |
| Concepts clearly labeled | PASS | "Illustrative concept — not a client project" ×3 (E2E) | Replace with approved case studies when available |
| Careers: 3 roles, no "not hiring" contradiction | PASS | Unit + E2E | — |
| Role preselection + back navigation | PASS | E2E for all 3 roles | — |
| Unverified job terms not promised | PASS | Facts render "Shared during the hiring process"; JobPosting JSON-LD withheld (unit) | Fill `facts` + `posting` after legal review |
| Separate inquiry vs. application workflows | PASS | Separate schemas/endpoints/handlers/subjects/rate buckets; cross-payloads rejected (unit + E2E) | — |
| Privacy consent required on both forms | PASS | Schema `consent: true` literal; tests | — |
| Sanitized email templates | PASS | HTML-escaping unit tests; links shown as text | — |
| `from` controlled, `replyTo` = visitor/candidate | PASS (mocked provider) | Unit asserts the Resend request body | Re-verify headers in a real received email |
| Success only after the provider accepts | PASS (mocked) | Unit: 2xx → sent; 4xx/5xx/network → error | — |
| Unconfigured outcome is honest | PASS | E2E: 503 → "has not been sent" + prefilled mailto to the business inbox | — |
| **End-to-end deliverability to a company inbox** | **NOT TESTED** | SMTP adapter unit-tested with a mocked transport (success, auth failure → error). No mailbox password here. **NOT VERIFIED — requires credentials.** | Owner: set `SMTP_PASSWORD`; submit both forms; confirm receipt, reply-to, and spam placement |
| Sender domain alignment (nextmadelabs.com) | NOT READY (DNS checked Oct 29) | MX = Cloudflare Email Routing (receive only); SPF covers Cloudflare forwarding only; no Resend DKIM/`send` records; no DMARC; no `www` record | Add the Resend records and DMARC, and add `www` in Vercel (`docs/EMAIL_SETUP.md`) |
| Abuse controls (honeypot, timing, origin, size, rate limit, dedupe) | PASS | Unit + E2E API guards | Configure Upstash for production |
| Safe logs (no PII) | PASS | Unit logger spies (inquiry + application) | — |
| No sensitive analytics | PASS | No third-party scripts; analytics events carry only outcome + role/project-type slugs | Add consent before adding any analytics tool |
| HTTPS / HSTS / security headers | PASS (headers) / NOT TESTED (TLS) | E2E checks CSP, nosniff, X-Frame-Options; HSTS set in production config | Verify on the live domain |
| Secrets not in client bundles | PASS | Keys read only in route handlers via `readIntakeEnv`; client gets booleans and the public email only | — |
| Candidate data storage, access, retention, deletion | FAIL (process not defined) | Data goes only to email (no database). Inbox access policy and retention period are undefined. | Owner: restrict the hiring inbox, set retention, document deletion handling before enabling applications |
| Accessibility: automated WCAG A/AA scan | PASS | axe-core: 0 violations on 8 key pages × 2 devices; Lighthouse a11y 100 on home/careers/contact | — |
| Keyboard operation, focus, status announcements | PASS | E2E: skip link, focused error summary, summary link → field, `role="status"`/`aria-live` regions | — |
| Reduced motion | PASS (by code review + emulation) | CSS `prefers-reduced-motion` disables float/reveal; axe ran with reduced motion | — |
| Manual screen-reader test | NOT TESTED | Automated checks only | NVDA/VoiceOver pass before launch |
| Responsive 375 / 768 / 1280 / 1440 | PASS | E2E overflow checks at all four widths; screenshots reviewed at 375 and 1440 | — |
| Performance (lab) | Measured — below target in lab | Lighthouse 12, mobile emulation on this machine (CPU benchmark index 592, i.e. slow hardware with 4× throttling on top): Performance 57 (home) / 67 (careers) / 63 (contact); CLS 0; LCP 3.5–4.0 s; TBT 1.2–1.8 s, mostly the Next.js framework runtime. 198 KB JS (compressed). | Re-run Lighthouse on typical hardware and collect field Core Web Vitals after deploy; investigate trimming client JS if LCP stays above 2.5 s |
| Lighthouse SEO | 63 (expected) | Penalized only by the intentional `noindex` | Re-check after enabling indexing |
| Publication dates not in the future | PASS | Articles now Oct 28, 2026; unit test enforces U.S. Pacific date | — |
| No contradictory "hiring closed" / "forms don't work" messaging | PASS | E2E: no "No open roles", no "switched on" banner. A failed send says "We couldn't send … from the website" and offers a prefilled email | — |
| Privacy/Terms placeholders | FAIL (expected drafts) | Bracketed items remain; pages labeled Draft | Counsel review (blocker #4) |
| Deployment | NOT TESTED (by policy) | Nothing pushed or deployed; Vercel env not inspectable from here | Owner approval → push branch → preview deploy → re-run this audit on the preview URL |
