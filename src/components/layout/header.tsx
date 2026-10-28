import { siteConfig } from "@/lib/site-config";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import { DesktopNav } from "./nav-links";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <Container className="flex h-[4.25rem] items-center justify-between gap-4">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <ButtonLink href={siteConfig.cta.header.href}>{siteConfig.cta.header.label}</ButtonLink>
          </span>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-lg bg-cobalt-600 px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to main content
    </a>
  );
}
