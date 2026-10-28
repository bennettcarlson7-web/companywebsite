import Link from "next/link";
import { copyrightHolder, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata = buildMetadata({
  title: "Privacy Policy (Draft)",
  description: `Draft privacy policy describing what information the ${siteConfig.name} website collects and how it is used.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  const email = siteConfig.contact.email;
  const holder = copyrightHolder();
  return (
    <LegalPage title="Privacy Policy" path="/privacy">
      <p>
        This policy explains what information {holder} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) collects through this website,
        how we use it, and the choices you have. We aim to collect as little as possible.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>Information you give us.</strong> When you submit the project inquiry form, we collect your name, work
        email, and any optional details you choose to share — company, project type, budget range, timeline, and your
        project description. If you email us directly, we receive whatever you include in your message.
      </p>
      <p>
        <strong>Technical information.</strong> Like most websites, our hosting provider automatically processes
        technical data such as IP addresses, browser type, and request logs to deliver and secure the site. We use IP
        addresses temporarily to limit abusive form submissions.
      </p>
      <p>
        <strong>Cookies and analytics.</strong> This website does not currently use advertising cookies, analytics, or
        third-party tracking scripts. If that changes, we will update this policy and ask for consent where required.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>To respond to your inquiry and discuss a potential project.</li>
        <li>To operate, maintain, and secure the website, including preventing spam and abuse.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <p>We do not sell your personal information, and we do not use it for targeted advertising.</p>

      <h2>Service providers</h2>
      <p>
        We use trusted providers to run the site and handle inquiries, such as website hosting, transactional email
        delivery, and — if enabled — a customer relationship management (CRM) tool. They process information on our
        behalf and only as needed to provide their services. [Confirm and list providers before launch.]
      </p>

      <h2>How long we keep information</h2>
      <p>
        We keep inquiry information for as long as needed to respond and manage any resulting relationship, and then
        delete or anonymize it. [Confirm a specific retention period before launch.]
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can ask us to access, correct, or delete the personal information you have shared with us. Depending on
        where you live, you may have additional rights under applicable privacy laws. To make a request,{" "}
        {email ? (
          <>
            email us at <a href={`mailto:${email}`} className="font-medium text-cobalt-700 underline">{email}</a>
          </>
        ) : (
          <>
            contact us through our <Link href="/contact" className="font-medium text-cobalt-700 underline">contact page</Link>
          </>
        )}
        . We will not discriminate against you for exercising your rights.
      </p>

      <h2>Security</h2>
      <p>
        We use reasonable safeguards — including encrypted connections (HTTPS), restricted access, and input validation
        — to protect information. No method of transmission or storage is completely secure, so please don&apos;t send
        passwords or highly sensitive personal data through the inquiry form.
      </p>

      <h2>Children</h2>
      <p>This website is intended for businesses and is not directed to children under 13. We do not knowingly collect their information.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. We&apos;ll change the &ldquo;Last updated&rdquo; date above when we do.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? {email ? <>Email <a href={`mailto:${email}`} className="font-medium text-cobalt-700 underline">{email}</a>.</> : <>Reach us through the <Link href="/contact" className="font-medium text-cobalt-700 underline">contact page</Link>.</>}{" "}
        [Add a postal address if required for your jurisdiction.]
      </p>
    </LegalPage>
  );
}
