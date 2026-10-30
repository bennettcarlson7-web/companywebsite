import type { ReactNode } from "react";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { Header, SkipLink } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/** Public website chrome. The admin area (`/admin`) has its own layout and never renders this. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
    </>
  );
}
