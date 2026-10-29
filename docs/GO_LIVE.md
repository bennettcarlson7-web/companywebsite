# Go live: the last owner steps

The code is finished and deployed from `main`. What's left needs your Vercel and Cloudflare logins. Each step says how
to check that it worked.

Live check done on Oct 29, 2026: https://nextmadelabs.com serves the latest version over HTTPS from Vercel. The forms
can't store or email submissions yet (no storage or email settings on Vercel), and `www` doesn't resolve.

## 1. Make the forms work (one-click submit) — about 2 minutes

1. Vercel → your project → **Storage** → **Create Database** → **Upstash for Redis** (free plan) → connect it to the
   project for **Production** (and Preview if you like).
   Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically, and the site reads them as-is.
   (If you create the database on upstash.com instead, add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` by hand.)
2. Vercel → **Deployments** → latest → **⋯ → Redeploy**. Environment variables only apply to new deployments.
3. **Check the setup first:** open https://nextmadelabs.com/api/intake-status. You want `"ready":true`,
   `"storage":"upstash"`, and `deployment.commit` equal to the latest commit on `main`. If you see `"storage":"none"`,
   the variables aren't reaching Production. Check that they're scoped to **Production** and that you redeployed
   *after* adding them. Vercel's Function logs also show an `"outcome":"unconfigured"` error with a setup hint.
4. **Check the form:** submit an application at https://nextmadelabs.com/careers/apply. You should see "We received your
   application". On your computer, copy the two KV values into `.env.local` and run `npm run submissions` to read it.

Upstash also gives the live site real, shared spam rate limiting.

## 2. Get an email for each submission (optional, recommended)

1. On the team Google account: turn on 2-Step Verification → https://myaccount.google.com/apppasswords → create
   "NextMade website".
2. Vercel → **Settings → Environment Variables** (Production):
   `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=<team Gmail>`, `SMTP_PASSWORD=<app password>` (Sensitive),
   `BUSINESS_CONTACT_EMAIL=<team Gmail>`, `HIRING_EMAIL=<team Gmail>`.
3. Redeploy. **Check:** a test application arrives in Gmail with the subject `[NextMade Careers] … — Application`.

## 3. www.nextmadelabs.com

1. Vercel → **Settings → Domains** → add `www.nextmadelabs.com` and choose to redirect it to `nextmadelabs.com`.
2. Cloudflare → nextmadelabs.com → **DNS** → add the record Vercel shows (usually `CNAME www → cname.vercel-dns.com`)
   with proxy **off** (grey cloud).
3. **Check:** https://www.nextmadelabs.com opens and lands on https://nextmadelabs.com.

## 4. hello@ and careers@ addresses

Cloudflare → **Email → Email Routing**: add the team Gmail as a verified destination, then route `hello@` and `careers@`
to it (details in `docs/EMAIL_SETUP.md`). **Check:** an email to each address arrives in Gmail.

## 5. When you're ready to be found on Google

Vercel → Environment Variables → `NEXT_PUBLIC_ALLOW_INDEXING=true` (Production only) → redeploy. Until then,
`robots.txt` keeps search engines away. That's deliberate while the Terms are still a draft.

## Still open (decisions, not setup)
- Terms of Use: choose the governing-law state; legal review.
- How international full-time hires are engaged (local entity, employer of record, or contractor).
- See `docs/OWNER_DECISIONS.md` for the full list.
