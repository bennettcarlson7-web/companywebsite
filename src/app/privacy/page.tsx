import { copyrightHolder, mailtoHref, operatorName, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, keeps, and protects information from project inquiries, job applications, and emails, and the choices you have.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  const email = siteConfig.contact.email;
  const holder = copyrightHolder();
  const mail = (subject: string) => (
    <a href={mailtoHref(email, subject)} className="font-medium text-cobalt-700 underline">
      our team
    </a>
  );
  return (
    <LegalPage title="Privacy Policy" path="/privacy" policy="privacy">
      <p>
        This policy explains what information {operatorName()} (&ldquo;{siteConfig.name},&rdquo; &ldquo;we,&rdquo;
        &ldquo;us&rdquo;) collects through this website and by email, how we use it, how long we keep it, and the choices
        you have. We aim to collect as little as possible. {holder} is responsible for the information described here.
      </p>

      <h2>Information we collect</h2>
      <p>
        <strong>Project inquiries.</strong> When you submit the project inquiry form, we collect your name, work email,
        and any optional details you choose to share — company, project type, budget range, timeline, and your project
        description.
      </p>
      <p>
        <strong>Job applications.</strong> When you apply for a role, we collect your name, email, the role you&apos;re
        applying for, your phone number, the city and country you live in, your LinkedIn profile link, the résumé file
        you upload, a link to your introduction video, and an optional portfolio or GitHub link. You may also choose to
        share your gender and age range; both are voluntary, &ldquo;Decline to self-identify&rdquo; is always
        available, and these answers are not used to make hiring decisions. Your age range is kept with your
        application record but left out of the copy our reviewers read. Your résumé
        is stored with your application and sent to our hiring inbox by email. If you share a link, the content behind
        it stays under your control; you can revoke access at any time.
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
        <strong>Cookies and analytics.</strong> This website does not use advertising cookies, analytics, or
        third-party tracking scripts. If that changes, we will update this policy first and ask for consent where
        required.
      </p>

      <h2>How we use information, and why</h2>
      <ul>
        <li>
          To respond to project inquiries and discuss potential work — because you asked us to, and to take steps before
          entering into a contract with you.
        </li>
        <li>
          To review job applications, contact candidates, and run our hiring process — to take steps at your request
          before a possible employment contract, and in our legitimate interest in hiring.
        </li>
        <li>
          To send a short confirmation that we received your inquiry or application, when that feature is enabled.
        </li>
        <li>
          To operate, maintain, and secure the website, including preventing spam and abuse — in our legitimate interest
          in keeping the site safe.
        </li>
        <li>To comply with legal obligations.</li>
      </ul>
      <p>
        Project inquiries and job applications are handled separately. Application information is used only for hiring
        and is shared only with the people involved in it. We do not sell or share personal information for
        cross-context behavioral advertising, and we do not use it for automated decisions about you.
      </p>

      <h2>Service providers</h2>
      <p>We use these providers to run the site and handle messages. They process information on our behalf, only as needed to provide their services:</p>
      <ul>
        <li>Vercel — website hosting.</li>
        <li>Upstash — secure storage of submitted inquiries and applications, so nothing is lost if email is delayed.</li>
        <li>Cloudflare — domain name services and routing of email sent to our addresses.</li>
        <li>Resend — sending form submissions to our team and confirmations back to you.</li>
        <li>Google (Gmail) — the mailbox where our team reads and answers email.</li>
      </ul>
      <p>We will update this list before adding a provider that receives personal information.</p>

      <h2>International transfers</h2>
      <p>
        We work with clients and candidates in many countries, and our providers process information in the United
        States and other countries. Where the law of your country requires it, we rely on appropriate safeguards for these
        transfers, such as the standard contractual clauses our providers offer.
      </p>

      <h2>How long we keep information</h2>
      <ul>
        <li>
          <strong>Project inquiries:</strong> up to 24 months after our last contact with you. If you become a client,
          we keep project records for as long as our agreement with you and the law require.
        </li>
        <li>
          <strong>Job applications:</strong> up to 12 months after the role you applied for is filled or closed. If you
          agree, we may keep your application longer to consider you for future roles; you can withdraw that agreement at
          any time.
        </li>
        <li>
          <strong>Technical data:</strong> rate-limiting records are kept for minutes; hosting logs follow our hosting
          provider&apos;s standard retention.
        </li>
      </ul>
      <p>After these periods, we delete or anonymize the information unless the law requires us to keep it.</p>

      <h2>Your choices and rights</h2>
      <p>
        You can ask us to access, correct, delete, or export the personal information you have shared with us, to
        restrict or object to how we use it, or to withdraw a job application at any time. Depending on where you live
        — for example, in the European Economic Area, the United Kingdom, or California — you may have these rights
        under local privacy law, and you can also complain to your local data protection authority. To make a request,
        email {mail(`Privacy request — ${siteConfig.name}`)} and tell us whether it relates to an inquiry or an
        application. We will respond within the time the law requires, and we will not discriminate against you for
        exercising your rights.
      </p>

      <h2>Security</h2>
      <p>
        We use reasonable safeguards — including encrypted connections (HTTPS), restricted access to our inboxes, and
        input validation — to protect information. No method of transmission or storage is completely secure, so please
        don&apos;t send passwords, government ID numbers, or other highly sensitive personal data through our forms.
      </p>

      <h2>Children</h2>
      <p>This website is intended for businesses and job seekers aged 18 and over. We do not knowingly collect information from anyone under 18.</p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We&apos;ll change the &ldquo;Last updated&rdquo; date above, and for
        significant changes we&apos;ll add a notice on this page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or your information? Email {mail(`Privacy question — ${siteConfig.name}`)}.
      </p>
    </LegalPage>
  );
}
