# Email setup for nextmadelabs.com

What the website does with email, what's already in place, and the owner steps left. Checked against public DNS on
Oct 29, 2026.

## How mail flows

```
Client / candidate ──(writes to)──► hello@ / careers@nextmadelabs.com ──► Cloudflare Email Routing ──► team mailbox
Website form ──► /api/inquiry, /api/apply ──► Resend (as notifications@nextmadelabs.com) ──► hello@ / careers@ ──► team mailbox
                                           └─► optional "we received it" email ──► client / candidate (Reply goes to hello@ / careers@)
Team replies to a client ──► needs a "send as hello@" mailbox (step 4)
```

| Address | Purpose | Shown on the site |
| --- | --- | --- |
| `hello@nextmadelabs.com` | Client inquiries; Reply-To on client confirmations | Footer, "email us" links |
| `careers@nextmadelabs.com` | Applications and candidate questions; Reply-To on candidate confirmations | Careers "Email our hiring team" links |
| `notifications@nextmadelabs.com` | Sender of website emails (no one needs to read it) | Never |

## What DNS shows today

| Record | Value | Meaning |
| --- | --- | --- |
| NS | `simone` / `piers.ns.cloudflare.com` | DNS is managed in Cloudflare |
| A (apex) | `216.198.79.65`, `64.29.17.65` | Points at Vercel |
| MX | `route1/2/3.mx.cloudflare.net` | Cloudflare Email Routing receives mail |
| TXT (SPF) | `v=spf1 include:_spf.mx.cloudflare.net ~all` | Only Cloudflare's forwarding is authorized |
| TXT | `zoho-verification=…` | A Zoho Mail setup was started but isn't active (MX isn't Zoho) |
| `_dmarc` | none | No DMARC policy yet |
| `www` | none | `www.nextmadelabs.com` doesn't resolve |
| Resend DKIM / `send` | none | Website sending isn't verified yet |

Cloudflare Email Routing only **receives and forwards**. It can't send, so the website needs Resend (or another
sender) and the team needs a way to reply as `hello@` (step 4).

## Owner steps

### 1. Create the routes (Cloudflare → nextmadelabs.com → Email → Email Routing → Routing rules)
- `hello@nextmadelabs.com` → your team mailbox.
- `careers@nextmadelabs.com` → the mailbox of whoever handles hiring. Keep it restricted: candidate data.
- `notifications@nextmadelabs.com` → your team mailbox, or drop. Bounces and auto-replies may arrive here.
- Make sure each destination address shows **Verified**.
- Test: from a personal email, write to `hello@` and `careers@` and confirm both arrive.

### 2. Verify the domain for sending (Resend)
1. Create a Resend account → **Domains → Add domain** → `nextmadelabs.com`.
2. Resend lists DNS records. Add them in **Cloudflare → DNS**, exactly as shown, with proxy **off** (DNS only).
   They are typically:
   - `TXT resend._domainkey` → the DKIM key Resend shows
   - `MX send` → `feedback-smtp.<region>.amazonses.com` (priority 10)
   - `TXT send` → `v=spf1 include:amazonses.com ~all`

   These live on the `send` subdomain and the DKIM selector. They **don't touch** the apex MX/SPF records that Cloudflare
   Email Routing uses, so receiving keeps working.
3. Click **Verify** in Resend and wait for "Verified".
4. Create an API key with **Sending access** only, restricted to `nextmadelabs.com`.

### 3. Add a DMARC record (Cloudflare → DNS)
`TXT _dmarc` → `v=DMARC1; p=none; rua=mailto:hello@nextmadelabs.com`

Start with `p=none` (monitor only). After a few weeks of clean reports, move to `p=quarantine`. Gmail and Yahoo expect
DMARC for business senders.

### 4. Let the team reply as hello@ (choose one)
- **Gmail "Send mail as"** (keeps Cloudflare routing): Gmail → Settings → Accounts → *Send mail as* → add
  `hello@nextmadelabs.com`, SMTP server `smtp.resend.com`, port 465, username `resend`, password = a Resend API key
  (a separate key from the website's is best). Gmail sends a confirmation code to `hello@`, which Cloudflare forwards back to you.
- **A full mailbox** (Zoho Mail, Google Workspace, Microsoft 365): gives real `hello@` / `careers@` inboxes. You'd
  replace the Cloudflare MX/SPF records with the provider's, and turn off Email Routing. The existing Zoho
  verification record suggests this was being considered.

### 5. Configure the website
Locally in `.env.local`, and in **Vercel → Project → Settings → Environment Variables** (Production; mark secrets
Sensitive):

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | The website key from step 2 |
| `SEND_CONFIRMATION_EMAILS` | `true` once steps 1–3 are done |
| (optional) `EMAIL_FROM` | Defaults to `Nextmade <notifications@nextmadelabs.com>` |
| (optional) `BUSINESS_CONTACT_EMAIL`, `HIRING_EMAIL` | Default to `hello@` and `careers@` |

Then redeploy, and test both forms:
1. The project inquiry arrives at `hello@`, from `notifications@`. Reply goes to the visitor.
2. The application arrives at `careers@`, with the role in the subject.
3. If confirmations are on, the test address gets "We received your…", and replying goes to `hello@` / `careers@`.
4. Check the message headers: `dkim=pass`, `spf=pass`, `dmarc=pass`. Also check it isn't in spam.

**Fallback without Resend:** set `SMTP_HOST`/`SMTP_USER`/`SMTP_PASSWORD` for an existing mailbox, e.g. Namecheap
Private Email for `rpatdu@mentortech.space`. Notifications still reach `hello@` / `careers@`, but they're sent from that
mailbox's address. Leave confirmations off in that mode, because the client would see a non-company sender.

### 6. www and Vercel
- Add `nextmadelabs.com` and `www.nextmadelabs.com` under **Vercel → Project → Domains**.
- Add the `www` record Vercel shows (usually `CNAME www → cname.vercel-dns.com`, DNS only).
- Redirect `www` to the apex. The site's canonical URL is `https://nextmadelabs.com`.

## Safety properties (enforced in code and tests)
- A form shows "sent" only after the provider accepts the message. Otherwise visitors get an honest fallback.
- Visitors and candidates are only ever **Reply-To**, never the sender.
- Confirmations go out only after our own copy was delivered. They never repeat what the visitor typed (no spam relay),
  and a failed confirmation doesn't change the visitor's result.
- Logs record outcomes and provider error codes only, never names, emails, or message content.
