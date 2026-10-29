// Checks that the configured email provider accepts our credentials, without sending anything.
// Usage: npm run email:verify   (reads .env.local). Prints only status and error codes — never secrets.
import nodemailer from "nodemailer";

const val = (v) => (v && v.trim() ? v.trim() : undefined);
const env = process.env;
const resendKey = val(env.RESEND_API_KEY);
const smtp = val(env.SMTP_HOST) && val(env.SMTP_USER) && env.SMTP_PASSWORD
  ? { host: val(env.SMTP_HOST), port: Number(env.SMTP_PORT) > 0 ? Number(env.SMTP_PORT) : 465, user: val(env.SMTP_USER), pass: env.SMTP_PASSWORD }
  : null;
const to = {
  inquiries: val(env.BUSINESS_CONTACT_EMAIL) ?? "hello@nextmadelabs.com",
  applications: val(env.HIRING_EMAIL) ?? "careers@nextmadelabs.com",
};

if (resendKey) {
  const res = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${resendKey}` } });
  if (!res.ok) {
    console.error(`✗ Resend rejected the API key (HTTP ${res.status}).`);
    process.exit(1);
  }
  const { data = [] } = await res.json();
  const domain = data.find((d) => d.name === "nextmadelabs.com");
  console.log(`✓ Resend key accepted. nextmadelabs.com status: ${domain ? domain.status : "not added"}`);
  if (!domain || domain.status !== "verified") {
    console.error("✗ Sending will fail until nextmadelabs.com is verified in Resend (docs/EMAIL_SETUP.md).");
    process.exit(1);
  }
} else if (smtp) {
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    requireTLS: smtp.port !== 465,
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: 10_000,
  });
  try {
    await transport.verify();
    console.log(`✓ SMTP login to ${smtp.host} as ${smtp.user} works.`);
  } catch (err) {
    console.error(`✗ SMTP login failed (${err?.code ?? "error"}${err?.responseCode ? ` ${err.responseCode}` : ""}).`);
    if (smtp.host === "smtp.gmail.com") console.error("  Gmail needs an App Password (not your normal password): https://myaccount.google.com/apppasswords");
    process.exit(1);
  }
} else {
  console.error("✗ No email provider configured. Set SMTP_PASSWORD (or RESEND_API_KEY) in .env.local.");
  process.exit(1);
}
console.log(`  Inquiries → ${to.inquiries}\n  Applications → ${to.applications}`);
console.log("  Restart the app (npm run start) so the website picks up the settings.");
