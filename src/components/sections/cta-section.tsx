import { CalendarDays } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";

export function ScheduleButton({ variant = "secondary" }: { variant?: "secondary" | "inverse" }) {
  const url = siteConfig.contact.schedulingUrl;
  if (url) {
    return (
      <ButtonAnchor href={url} variant={variant} size="lg" target="_blank" rel="noopener noreferrer">
        <CalendarDays aria-hidden="true" className="size-4" />
        {siteConfig.cta.schedule}
        <span className="sr-only"> (opens in a new tab)</span>
      </ButtonAnchor>
    );
  }
  // No live scheduler configured: route to the inquiry form rather than implying one exists.
  return (
    <ButtonLink href="/contact" variant={variant} size="lg">
      <CalendarDays aria-hidden="true" className="size-4" />
      Request a Discovery Call
    </ButtonLink>
  );
}

export function CTASection({
  title = "Have an idea? Let's talk about it.",
  body = "Tell us what you're working on. We'll listen, ask good questions, and suggest a practical next step — whether or not we end up working together.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section aria-labelledby="cta-heading" className="bg-white py-16 sm:py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cobalt-700 via-cobalt-600 to-cobalt-500 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-30 mix-blend-overlay" />
            <div aria-hidden="true" className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10 blur-2xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 id="cta-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-cobalt-50 sm:text-lg">{body}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink href={siteConfig.cta.primary.href} variant="inverse" size="lg" arrow>
                  {siteConfig.cta.primary.label}
                </ButtonLink>
                {siteConfig.contact.schedulingUrl && <ScheduleButton variant="inverse" />}
              </div>
              <p className="mt-5 text-sm text-cobalt-100">{siteConfig.contact.responseTime}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
