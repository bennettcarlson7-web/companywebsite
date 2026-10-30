import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOpenJobs } from "@/lib/data/jobs";
import { emailSubjects, getCareersEmail, mailtoHref, siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";
import { Container, Section } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CandidateApplicationForm } from "@/components/forms/candidate-application-form";
import { countries } from "@/lib/countries";

export const metadata = {
  ...buildMetadata({
    title: "Apply — Careers",
    description: `Apply to join ${siteConfig.name}. Upload your résumé and, if you like, share a short introduction video.`,
    path: "/careers/apply",
  }),
  // A form page has no search value of its own; the job pages are what should be indexed.
  robots: { index: false, follow: true },
};

export default async function ApplyPage() {
  const jobs = await getOpenJobs();
  const roles = jobs.map((j) => ({ slug: j.slug, title: j.title }));
  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-mist to-white">
        <Container className="py-12 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Careers", href: "/careers" },
              { label: "Apply", href: "/careers/apply" },
            ]}
          />
          <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Apply to join {siteConfig.name}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            This is our careers application — separate from project inquiries. It takes a few minutes: tell us who you
            are, upload your résumé, and, if you like, share a short introduction video.
          </p>
        </Container>
      </section>

      <Section className="pt-10 sm:pt-12">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="rounded-[1.75rem] bg-white p-6 shadow-card ring-1 ring-line sm:p-8 lg:col-span-8">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Your application</h2>
            <CandidateApplicationForm hiringEmail={getCareersEmail()} countries={countries} roles={roles} />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl bg-mist p-6 ring-1 ring-cobalt-100">
              <h2 className="text-lg font-semibold">Open roles</h2>
              <ul className="mt-3 space-y-2">
                {jobs.map((j) => (
                  <li key={j.slug}>
                    <Link href={`/careers/${j.slug}`} className="text-sm font-medium text-cobalt-700 hover:underline">
                      {j.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <h2 className="text-lg font-semibold">How we handle your information</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                <li>Used only to review your application and contact you about it.</li>
                <li>Seen only by the people involved in hiring.</li>
                <li>Your résumé goes straight to our hiring team and is kept no longer than our retention policy allows.</li>
                <li>
                  Ask us to delete it any time. See the{" "}
                  <Link href="/privacy" className="font-medium text-cobalt-700 underline">
                    Privacy Policy
                  </Link>
                  .
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <h2 className="text-lg font-semibold">Questions first?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                <a
                  href={mailtoHref(getCareersEmail(), emailSubjects.careersQuestion)}
                  className="font-semibold text-cobalt-700 underline underline-offset-2"
                >
                  Email our hiring team
                </a>{" "}
                — we&apos;re happy to answer before you apply.
              </p>
            </div>
            <Link href="/careers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-700 hover:underline">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to all roles
            </Link>
          </aside>
        </Container>
      </Section>
    </>
  );
}
