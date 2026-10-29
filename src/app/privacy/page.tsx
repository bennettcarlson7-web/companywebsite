import { copyrightHolder, mailtoHref, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata = buildMetadata({
  title: "Privacy Policy (Draft)",
  description: `Draft privacy policy describing what information the ${siteConfig.name} website collects through project inquiries and job applications, and how it is used.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  const email = siteConfig.contact.email;
  const holder = copyrightHolder();
  const mail = (subject: string) => (
    <a href={mailtoHref(email, subject)} className="font-medium text-cobalt-700 underline">
      {email}
    </a>
  );
  return (
    <LegalPage title="Privacy Policy" path="/privacy">
      <p>
        This policy explains what information {holder} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) collects through this website,
        how we use it, and the choices you have. We aim to collect as little as possible.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>Project inquiries.</strong> When you submit the project inquiry form, we collect your name, work email,
        and any optional details you choose to share — company, project type, budget range, timeline, and your project
        description.
      </p>
      <p>
        <strong>Job applications.</strong> When you apply for a role, we collect your name, email, the role you&apos;re
        applying for, your introduction, and any optional links you provide (such as LinkedIn, a portfolio or GitHub
        profile, or a résumé link). We don&apos;t accept file uploads through the website. If you share a link, the
        content behind it stays under your control; you can revoke access at any time.
      </p>
      <p>
        <strong>Emails you send us.</strong> If you email us directly, we receive whatever you include in your message.
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
        <li>To respond to project inquiries and discuss potential work.</li>
        <li>To review job applications, contact candidates, and run our hiring process.</li>
        <li>To operate, maintain, and secure the website, including preventing spam and abuse.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      <p>
        Project inquiries and job applications are handled separately. Application information is used only for hiring
        and is shared only with the people involved in it. We do not sell personal information, and we do not use it
        for targeted advertising.
      </p>

      <h2>Service providers</h2>
      <p>
        We use providers to run the site and deliver form submissions to our team: website hosting and, when enabled,
        Resend for email delivery. For project inquiries only, we may also use HubSpot as a customer relationship
        management (CRM) tool; job applications are never sent to the CRM. Providers process information on our behalf
        and only as needed to provide their services. [Confirm the final list of providers before launch.]
      </p>

      <h2>How long we keep information</h2>
      <p>
        We keep inquiry information for as long as needed to respond and manage any resulting relationship, and
        application information for as long as needed to complete the hiring process for the role, and then delete or
        anonymize it unless you ask us to keep it for future opportunities or the law requires otherwise. [Confirm
        specific retention periods for inquiries and applications before launch.]
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can ask us to access, correct, or delete the personal information you have shared with us — including
        withdrawing a job application at any time. Depending on where you live, you may have additional rights under
        applicable privacy laws. To make a request, email {mail(`Privacy request — ${siteConfig.name}`)} and tell us
        whether it relates to an inquiry or an application. We will not discriminate against you for exercising your
        rights.
      </p>

      <h2>Security</h2>
      <p>
        We use reasonable safeguards — including encrypted connections (HTTPS), restricted access, and input validation
        — to protect information. No method of transmission or storage is completely secure, so please don&apos;t send
        passwords, government ID numbers, or other highly sensitive personal data through our forms.
      </p>

      <h2>Children</h2>
      <p>This website is intended for businesses and job seekers aged 18 and over. We do not knowingly collect information from children under 13.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. We&apos;ll change the &ldquo;Last updated&rdquo; date above when we do.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email {mail(`Privacy question — ${siteConfig.name}`)}. [Add the legal entity name
        and a postal address if required for your jurisdiction.]
      </p>
    </LegalPage>
  );
}
