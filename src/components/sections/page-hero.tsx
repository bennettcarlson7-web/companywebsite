import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Container, Eyebrow } from "@/components/ui/primitives";

/** Hero band for interior pages: breadcrumbs, eyebrow, H1, intro, optional actions/aside. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  intro,
  actions,
  aside,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-mist to-white">
      <div aria-hidden="true" className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)] opacity-60" />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        <Breadcrumbs items={crumbs} />
        <div className={aside ? "mt-8 grid items-center gap-10 lg:grid-cols-12" : "mt-8"}>
          <div className={aside ? "lg:col-span-7" : "max-w-3xl"}>
            {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
            <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl">{title}</h1>
            {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{intro}</div>}
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
          </div>
          {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
      </Container>
    </section>
  );
}
