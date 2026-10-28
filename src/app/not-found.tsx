import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const suggestions = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mist to-white">
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <Container className="relative py-24 text-center sm:py-32">
        <p className="text-sm font-semibold tracking-[0.14em] text-cobalt-700 uppercase">404 error</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
          The link may be outdated, or the page may have moved. Here are a few good places to pick things back up.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg" arrow>
            Back to Home
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="secondary">
            Contact Us
          </ButtonLink>
        </div>
        <nav aria-label="Suggested pages" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium">
            {suggestions.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-cobalt-700 hover:underline">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
