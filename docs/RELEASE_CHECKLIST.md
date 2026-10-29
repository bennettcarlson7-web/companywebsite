# Release checklist — team, careers, two-track intake

Branch `update/team-careers-launch` (local, not pushed). Results are from a local production build
(`npm run build && npm run start`) on Oct 28–29, 2026, with **no email credentials configured**.

Legend: **PASS** = verified by an automated test or a direct check · **FAIL** = verified broken ·
**NOT TESTED** = could not be verified here (reason given).

## Commands

| Command | Result |
| --- | --- |
| `npm run lint` | PASS (0 problems) |
| `npm run typecheck` | PASS |
| `npm run test` (Vitest) | PASS — 8 files, 73 tests |
| `npm run build` | PASS — 39 static pages + `/api/inquiry`, `/api/apply` |
| `npx playwright test` (desktop + Pixel 7) | PASS — 121 passed, 9 skipped by design (viewport-specific) |

## Features

| Item | Result | Evidence |
| --- | --- | --- |
| Five team members, exact names/roles/order, no photos or bios | PASS | `content-integrity.test.ts`, `team-careers-render.test.tsx`, E2E "About shows the five team members" (desktop + mobile) |
| "Team profiles are coming soon" removed | PASS | E2E asserts 0 matches on `/about` |
| Homepage names CEO/CTO, links to `/about`; recruiting note links to `/careers` | PASS | E2E "homepage stays customer-first" |
| Hero phone mockup no longer says "Booking confirmed" | PASS | E2E asserts 0 matches; now labeled "Sample app screen" |
| Careers shows exactly three roles; no "not hiring" text | PASS | Unit + E2E |
| Three job detail pages, prerendered | PASS | Build output; E2E routes |
| Apply link preselects role; back navigation returns to job page | PASS | E2E "careers flow" (all 3 roles) |
| Unknown job slug → 404 | PASS | E2E |
| Business email `rpatdu@mentortech.space` reachable via `mailto:` links ("Email our hiring team", footer) without printing the address in page content | PASS | E2E "business email is a working mailto link" |
| Separate schemas, handlers, endpoints, rate-limit buckets, subjects | PASS | `handle-application.test.ts` (cross-payload rejected; separate buckets); E2E API cross-payload 422 |
| No false success when unconfigured (both forms) | PASS | Unit (component + handler) and E2E: 503 `unconfigured` → "has not been sent" + prefilled email |
| No false success when the provider fails or is unreachable | PASS | Unit: Resend 500/422 and network error → "was not sent" |
| Success shown only after provider accepts (2xx) | PASS (mocked provider) | Unit with mocked Resend 200 |
| `from` = configured sender, `replyTo` = visitor/candidate, `to` = business/hiring inbox | PASS (mocked) | Unit asserts the Resend payload |
| Double-submit protection (submission ID) | PASS | Unit: same ID delivered once; retry reuses the ID |
| Honeypot, fill-time, origin, content-type, size, rate limit | PASS | Unit + E2E API guards |
| Link safety in applications (https only, no credentials, LinkedIn host check) | PASS | `application-validation.test.ts` |
| HTML escaping in notification emails | PASS | Unit |
| Logs contain no personal data | PASS | Unit spies on logger |
| Booking CTA hidden without `BOOKING_URL`; email call-request shown instead | PASS | E2E |
| Articles not future-dated (now Oct 28, 2026) | PASS | Unit date check (U.S. Pacific) + E2E |
| Concepts labeled "Illustrative concept — not a client project" | PASS | E2E counts 3 labels |
| JobPosting structured data withheld (required facts unknown) | PASS | Unit: `jobPostingJsonLd` returns null |
| OG image on pages with custom metadata | PASS (bug found and fixed) | E2E checks `og:image` |
| Security headers (CSP, nosniff, frame DENY) | PASS | E2E |
| axe WCAG A/AA scan: 8 key pages, desktop + mobile | PASS (0 violations) | `a11y-responsive.spec.ts` |
| Keyboard: skip link, error summary focus, summary link → field | PASS | E2E |
| Mobile menu dialog (open, Escape, navigate) | PASS | E2E (Pixel 7) |
| No horizontal overflow at 375 / 768 / 1280 / 1440 | PASS | E2E, 6 key pages per width, plus all 25 routes at 1280 and Pixel 7 |
| Lighthouse (lab, mobile emulation) | Measured — see `FINAL_LAUNCH_AUDIT.md` | A11y 100; Perf 57–67 on a slow test machine |
| SMTP delivery via company mailbox (mocked transport) | PASS | `smtp-delivery.test.ts`: from = mailbox, to = inbox, reply-to = visitor; auth failure → error, logs only the code |
| Email address not printed in main page content | PASS | E2E checks `main` on 8 pages; footer keeps one mailto |
| Domain `nextmadelabs.com`: inquiries → hello@, applications → careers@, sender notifications@ via Resend (preferred over SMTP) | PASS (mocked) | `smtp-delivery.test.ts`, `handle-*.test.ts`, `content-integrity.test.ts` |
| Confirmation emails: only after our copy is delivered; Reply-To hello@/careers@; never echo visitor text; failure doesn't change result | PASS (mocked) | `smtp-delivery.test.ts` "confirmation emails" |
| Two new concept projects labeled "not a client project" | PASS | E2E counts 5 labels; routes return 200 |
| Legal name NextMade; Privacy Policy active (no draft label/placeholders; 24/12-month retention); Terms still Draft | PASS | Unit `content-integrity.test.ts`; E2E "legal and hiring terms" |
| Job terms: remote worldwide outside U.S., full-time, USD 2,000/month on cards, job pages, FAQ | PASS | Unit + E2E |
| **Real email delivered to a company inbox** | **NOT TESTED — NOT VERIFIED, requires credentials** | Mailbox password not available |
| Upstash distributed rate limiting against a live Redis | NOT TESTED — requires credentials | Code path unit-tested only via the interface |
| HubSpot contact creation | NOT TESTED — requires credentials | Mocked only |
| Behavior on the live Vercel deployment | NOT TESTED — not deployed (owner approval required) | Live site still serves `version1.0` |
| Manual screen-reader pass (NVDA/VoiceOver) | NOT TESTED | Automated axe checks only |
