import Link from "next/link";
import { Briefcase, MapPin, MessagesSquare } from "lucide-react";
import { emailSubjects, mailtoHref, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { isInquiryDeliveryConfigured } from "@/lib/integrations/env";
import { Container, Section } from "@/components/ui/primitives";
import { EmailContact } from "@/components/ui/email-contact";
import { PageHero } from "@/components/sections/page-hero";
import { ScheduleButton } from "@/components/sections/cta-section";
import { ProjectInquiryForm } from "@/components/forms/project-inquiry-form";

export const metadata = buildMetadata({
  title: "Contact Us — Tell Us About Your Project",
  description: `Tell us about your idea or project. Use the form or email ${siteConfig.contact.email}, and we'll reply with questions, thoughts, and a practical next step.`,
  path: "/contact",
});

const nextSteps = [
  { title: "We read every inquiry", body: "A person on our team reviews your message — not an autoresponder." },
  { title: "We reply with questions", body: "Usually a few clarifying questions and an offer of a short intro call." },
  { title: "You get a clear next step", body: "A proposal, a suggested discovery phase, or an honest referral if we're not the right fit." },
];

export default function ContactPage() {
  const { email, schedulingUrl, responseTime } = siteConfig.contact;
  return (
    <>
      <PageHero
        crumbs={[{ label: "Contact", href: "/contact" }]}
        eyebrow="Contact"
        title="Let's build something great together"
        intro="Tell us what you're working on. The more context you share, the more useful our first reply will be — but a few sentences is plenty to start."
        aside={
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-line sm:p-7">
            <h2 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">Email us directly</h2>
            <EmailContact email={email} subject={emailSubjects.inquiry} location="contact-hero" className="mt-2 text-lg" />
            <p className="mt-3 text-sm text-slate-600">{responseTime}</p>
          </div>
        }
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="rounded-[1.75rem] bg-white p-6 shadow-card ring-1 ring-line sm:p-8 lg:col-span-8">
            <h2 className="text-2xl font-semibold tracking-tight">Project inquiry</h2>
            <p className="mt-2 mb-8 text-slate-600">No commitment required. We use your details only to respond to your inquiry — no mailing lists.</p>
            <ProjectInquiryForm deliveryConfigured={isInquiryDeliveryConfigured()} contactEmail={email} />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl bg-mist p-6 ring-1 ring-cobalt-100">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MessagesSquare aria-hidden="true" className="size-5 text-cobalt-600" />
                Prefer to talk first?
              </h2>
              {schedulingUrl ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Pick a time for a short discovery call. We&apos;ll talk through your idea and whether we&apos;re a good fit.
                  </p>
                  <div className="mt-4">
                    <ScheduleButton />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Online booking isn&apos;t available yet.{" "}
                  <a
                    href={mailtoHref(email, emailSubjects.callRequest, "Hi! I'd like to set up a short call about a project. A few times that work for me (with time zone):\n\n")}
                    className="font-semibold text-cobalt-700 underline underline-offset-2"
                  >
                    Email us to request a call
                  </a>{" "}
                  and suggest a few times — we&apos;ll confirm by email.
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <h2 className="text-lg font-semibold">What happens next</h2>
              <ol className="mt-4 space-y-4">
                {nextSteps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-cobalt-50 text-xs font-semibold text-cobalt-700 ring-1 ring-cobalt-100">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{s.title}</p>
                      <p className="text-sm text-slate-600">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <ul className="space-y-3 rounded-2xl bg-white p-6 text-sm text-slate-700 ring-1 ring-line">
              <li className="flex gap-3">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-cobalt-600" />
                {siteConfig.locationStatement}
              </li>
              <li className="flex gap-3">
                <Briefcase aria-hidden="true" className="size-4 shrink-0 text-cobalt-600" />
                <span>
                  Looking for a job? Use our{" "}
                  <Link href="/careers/apply" className="font-semibold text-cobalt-700 underline underline-offset-2">
                    careers application
                  </Link>{" "}
                  instead.
                </span>
              </li>
            </ul>
          </aside>
        </Container>
      </Section>
    </>
  );
}
