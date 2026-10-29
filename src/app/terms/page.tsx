import Link from "next/link";
import { copyrightHolder, mailtoHref, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata = buildMetadata({
  title: "Terms of Use (Draft)",
  description: `Draft terms of use for the ${siteConfig.name} website.`,
  path: "/terms",
});

export default function TermsPage() {
  const holder = copyrightHolder();
  const law = siteConfig.legal.governingLaw;
  return (
    <LegalPage title="Terms of Use" path="/terms">
      <p>
        These terms govern your use of this website, operated by {holder}. By using the site, you agree to these terms.
        They cover the website only; any client engagement is governed by a separate written agreement.
      </p>

      <h2>Using this website</h2>
      <p>
        You may browse and share content from this site for personal or internal business purposes. Please don&apos;t
        misuse the site — for example, by attempting to disrupt it, gain unauthorized access, submit spam, or scrape it
        in a way that places an unreasonable load on our systems.
      </p>

      <h2>Content and intellectual property</h2>
      <p>
        Unless otherwise noted, the text, design, graphics, and code of this website belong to {holder} and are protected
        by applicable intellectual property laws. Product names and technologies mentioned on the site are trademarks of
        their respective owners; mentioning them does not imply affiliation or endorsement.
      </p>

      <h2>Illustrative examples</h2>
      <p>
        Projects labeled &ldquo;Concept&rdquo; or &ldquo;Illustrative&rdquo; are examples created to demonstrate our
        approach. They do not describe real clients or delivered results.
      </p>

      <h2>No professional advice</h2>
      <p>
        Articles and other content on this site are for general information only. They are not legal, financial, or
        other professional advice, and you should consult qualified advisors about your specific situation.
      </p>

      <h2>Inquiries and proposals</h2>
      <p>
        Submitting an inquiry does not create a client relationship or obligate either party. Any services we provide
        will be described in a separate written agreement, which controls over anything on this website.
      </p>

      <h2>Job listings and applications</h2>
      <p>
        Role descriptions on our careers pages describe the work as we currently see it and may change. Listing a role
        or submitting an application does not create an offer, an employment or contractor relationship, or any
        obligation to interview or hire. Terms such as location, employment type, and compensation are confirmed in
        writing during the hiring process.
      </p>

      <h2>Third-party links</h2>
      <p>This site may link to other websites. We aren&apos;t responsible for their content or practices.</p>

      <h2>Disclaimers and limitation of liability</h2>
      <p>
        This website is provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest extent permitted by
        law, {holder} is not liable for any indirect, incidental, or consequential damages arising from your use of the
        website. [Have counsel review this section for your jurisdiction.]
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of {law ? `the State of ${law}` : "[State to be confirmed]"}, without regard
        to conflict-of-law rules.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time. The &ldquo;Last updated&rdquo; date above shows when they last changed.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={mailtoHref(siteConfig.contact.email, `Terms question — ${siteConfig.name}`)} className="font-medium text-cobalt-700 underline">
          {siteConfig.contact.email}
        </a>{" "}
        or use the{" "}
        <Link href="/contact" className="font-medium text-cobalt-700 underline">
          contact page
        </Link>
        .
      </p>
    </LegalPage>
  );
}
