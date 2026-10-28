import Link from "next/link";
import { cacheLife } from "next/cache";
import { Mail } from "lucide-react";
import { copyrightHolder, siteConfig } from "@/lib/site-config";
import { getServices } from "@/content/services";
import { Container } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Process", href: "/process" },
  { label: "Work", href: "/work" },
  { label: "Insights", href: "/insights" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export async function Footer() {
  const year = await currentYear();
  const socials = [
    { label: "LinkedIn", href: siteConfig.social.linkedin },
    { label: "GitHub", href: siteConfig.social.github },
    { label: "X", href: siteConfig.social.x },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  return (
    <footer className="bg-navy-950 text-slate-300">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo inverse />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">{siteConfig.tagline}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{siteConfig.locationStatement}</p>
            {siteConfig.contact.email && (
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-cobalt-300"
              >
                <Mail aria-hidden="true" className="size-4" />
                {siteConfig.contact.email}
              </a>
            )}
          </div>

          <FooterColumn
            title="Services"
            className="lg:col-span-3"
            links={getServices().map((s) => ({ label: s.shortTitle, href: `/services/${s.slug}` }))}
          />
          <FooterColumn title="Company" className="lg:col-span-2" links={companyLinks} />

          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-white">Start a conversation</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Have an idea or a problem worth solving? Tell us about it — no commitment required.
            </p>
            <Link
              href={siteConfig.cta.primary.href}
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-cobalt-600 px-5 text-sm font-semibold text-white hover:bg-cobalt-500"
            >
              {siteConfig.cta.primary.label}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {copyrightHolder()}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms of Use
              </Link>
            </li>
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="hover:text-white" rel="noopener noreferrer" target="_blank">
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-slate-300 hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
