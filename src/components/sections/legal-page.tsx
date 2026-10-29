import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";
import { formatArticleDate } from "@/content/insights/format";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container, Notice } from "@/components/ui/primitives";

export function LegalPage({
  title,
  path,
  policy,
  children,
}: {
  title: string;
  path: string;
  policy: keyof Pick<typeof siteConfig.legal, "privacy" | "terms">;
  children: ReactNode;
}) {
  const { draft: policiesAreDrafts, lastUpdated } = siteConfig.legal[policy];
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ label: title, href: path }]} />
        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
          {policiesAreDrafts && <span className="ml-3 align-middle text-base font-semibold text-warning-800">(Draft)</span>}
        </h1>
        <p className="mt-4 text-sm text-slate-600">
          Last updated <time dateTime={lastUpdated}>{formatArticleDate(lastUpdated)}</time>
        </p>
        {policiesAreDrafts && (
          <div className="mt-6">
            <Notice tone="draft" title="Draft — not yet reviewed by legal counsel">
              This page is a working draft provided for transparency while {siteConfig.name} prepares to launch. It is
              not legal advice and may change before it is finalized. Bracketed items mark details that still need to be
              confirmed.
            </Notice>
          </div>
        )}
        <div className="legal mt-10 space-y-4 text-[1.0625rem] leading-[1.8] text-slate-700 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-navy-900 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          {children}
        </div>
      </div>
    </Container>
  );
}
