# Update plan — team, recruiting, two-track intake, launch readiness

Baseline: commit `69d2ac3` (tag `version1.0`), which is what https://companywebsite-smoky.vercel.app serves
(verified Oct 28, 2026 U.S. time: demo-mode contact form, "Team profiles are coming soon", "No open roles",
articles dated Oct 29, robots `Disallow: /`). Work happens on local branch `update/team-careers-launch`; nothing
is pushed or deployed without owner approval (pushing `main` would trigger the Vercel deployment).

Not inspectable from here: Vercel project settings and environment variables, DNS, the mentortech.space mail
domain, and any Resend account.

## Reused (not rewritten)

Design tokens, Header/MobileNav/Footer, PageHero, Section/SectionHeader/Badge/Notice, ButtonLink, CTA section, FAQ
accordion, the inquiry pipeline (origin check, size cap, rate limiting, honeypot, fill-time check), the Resend
adapter, the ContactForm UI, SEO helpers, and the Vitest/Playwright setup.

## Changes

| Area | Files |
| --- | --- |
| Company facts (email, brand, stage) | `src/lib/site-config.ts` (single source; `company` export) |
| Team data | `src/content/team.ts` (new), `src/components/team/team-card.tsx` (new) |
| Jobs data | `src/content/jobs.ts` (new), `src/components/careers/job-card.tsx` (new) |
| Pages | `/about`, `/careers` (rewritten content), `/careers/[slug]` (new), `/careers/apply` (new), `/`, `/contact`, `/privacy`, `/terms` |
| Intake | Shared guard `src/lib/integrations/submission-guard.ts`; `email.ts` adapter; separate `project-inquiry` and `job-application` schemas, handlers, and routes (`/api/inquiry`, `/api/apply`) |
| Forms | `ContactForm` (project) kept; new `CandidateApplicationForm` |
| Content dates | Articles and legal "last updated" corrected to Oct 28, 2026, plus a test that blocks future-dated content |
| Docs | `docs/OWNER_DECISIONS.md`, `docs/RELEASE_CHECKLIST.md`, `docs/FINAL_LAUNCH_AUDIT.md`, README, `.env.example` |

## Unconfirmed business details (documented defaults, never shown as fact)

Legal entity name and its relationship to mentortech.space; team portraits and profile links; job location,
employment type, compensation, work authorization, and the hiring process; approved response time; booking URL;
verified sending domain; retention periods; governing law.
