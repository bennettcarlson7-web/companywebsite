# Admin area

Private pages at **https://nextmadelabs.com/admin** for managing candidates and job postings. The admin area is
not linked from the public site and is never indexed by search engines.

## Signing in

1. Go to `/admin` and enter your admin email.
2. You'll receive a 6-digit code by email (valid for 10 minutes, usable once).
3. Enter the code. You stay signed in for 8 hours on that browser; **Sign out** ends it immediately.

There is no password to remember or leak. Five wrong codes lock that code; repeated requests are rate-limited.

### Who can sign in

| Setting (Vercel → Settings → Environment Variables) | Effect |
|---|---|
| `ADMIN_EMAILS` | Comma-separated list of admin email addresses. Optional. |
| *(if `ADMIN_EMAILS` is not set)* | The hiring inbox `HIRING_EMAIL` is the admin. |
| `ADMIN_SESSION_SECRET` | Optional signing key (32+ random characters). If not set, one is derived from the Upstash token Vercel already provides. |

Removing an address from `ADMIN_EMAILS` (and redeploying) revokes that person's access immediately, even if they
were signed in. Sign-in also needs email sending (the Gmail SMTP settings) to deliver codes.

## Candidates (`/admin/candidates`)

- Every application from the careers form, newest first, with counts per status.
- Filter by role or status; search by name, email, or location.
- Open a candidate to see all details, download the résumé, open the LinkedIn profile and introduction video,
  set a **status** (New → Reviewing → Interview → Offer → Hired / Not selected) and write **private notes**.
- **Delete application** permanently removes the application, résumé, and notes — use it when a candidate asks for
  their data to be deleted (as the Privacy Policy promises).
- Applications, résumés, and notes expire automatically after about 13 months (retention policy).

## Roles (`/admin/roles`)

- **Post a new role**: fill in the title, summary, terms, and description. Text areas take one item per line
  (paragraphs are separated by a blank line). Untick *Publish now* to save it withdrawn and publish later.
- **Edit**: change any wording. The page address (`/careers/<slug>`) never changes, so shared links keep working.
- **Withdraw**: the role disappears from the careers list and the application form, and new applications for it are
  refused. Its page stays online with a “no longer accepting applications” notice (and is hidden from search).
- **Re-open**: puts it back.

Changes appear on the public careers pages within seconds (no redeploy needed).

## How it works (for developers)

- Data lives in the same Upstash Redis database as applications (`jobs:v1`, `submission:*`,
  `submission-summary:*`, `candidate-review:*`). Locally and in tests it's `<SUBMISSIONS_DIR>/local-redis.json`.
- Sessions: HMAC-signed, HttpOnly, `SameSite=Lax` cookie scoped to `/admin`, 8-hour expiry. Every admin page,
  Server Action, and the résumé download re-verify the session on the server.
- Public careers pages read jobs through a cached function tagged `jobs`; admin changes call `updateTag("jobs")`.
- Code: `src/app/admin/*`, `src/lib/admin/*`, `src/lib/data/*`. Tests: `tests/unit/admin.test.ts`,
  `tests/e2e/admin.spec.ts`.
