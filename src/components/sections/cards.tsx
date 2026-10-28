import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Article, ProcessStep, Project, Service } from "@/types/content";
import { formatArticleDate } from "@/content/insights";
import { IconTile } from "@/components/ui/icon";
import { Badge, ConceptBadge } from "@/components/ui/primitives";
import { ProjectVisual } from "@/components/visuals/project-visual";
import { ArticleVisual } from "@/components/visuals/article-visual";
import { cn } from "@/lib/utils";

const cardBase =
  "group relative flex h-full flex-col rounded-2xl bg-white ring-1 ring-line shadow-soft transition-[box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-card focus-within:shadow-card";

/** Makes the whole card clickable through the heading link (keeps one tab stop per card). */
const stretchedLink = "after:absolute after:inset-0 after:rounded-2xl after:content-['']";

export function ServiceCard({ service, headingLevel = "h3" }: { service: Service; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className={cn(cardBase, "p-6")}>
      <IconTile name={service.icon} />
      <Heading className="mt-5 text-lg font-semibold leading-snug">
        <Link href={`/services/${service.slug}`} className={cn(stretchedLink, "focus-visible:outline-none")}>
          {service.title}
        </Link>
      </Heading>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">{service.summary}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-700">
        Learn more
        <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </article>
  );
}

export function ProjectCard({ project, headingLevel = "h3" }: { project: Project; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className={cn(cardBase, "overflow-hidden")}>
      <ProjectVisual variant={project.visual} className="border-b border-line" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          {project.kind === "concept" ? <ConceptBadge /> : <Badge tone="blue">Case study</Badge>}
        </div>
        <Heading className="mt-3 text-lg font-semibold leading-snug">
          <Link href={`/work/${project.slug}`} className={cn(stretchedLink, "focus-visible:outline-none")}>
            {project.title}
          </Link>
        </Heading>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Project tags">
          {project.tags.map((t) => (
            <li key={t}>
              <Badge>{t}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function ArticleCard({ article, headingLevel = "h3" }: { article: Article; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className={cn(cardBase, "overflow-hidden")}>
      <ArticleVisual category={article.category} />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold tracking-wide text-cobalt-700 uppercase">{article.category}</p>
        <Heading className="mt-2 text-lg font-semibold leading-snug">
          <Link href={`/insights/${article.slug}`} className={cn(stretchedLink, "focus-visible:outline-none")}>
            {article.title}
          </Link>
        </Heading>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{article.description}</p>
        <p className="mt-5 flex items-center gap-3 text-xs text-slate-600">
          <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" className="size-3.5" />
            {article.readingMinutes} min read
          </span>
        </p>
      </div>
    </article>
  );
}

export function ProcessStepCard({ step, compact = false }: { step: ProcessStep; compact?: boolean }) {
  return (
    <li className="relative flex gap-4 lg:flex-col">
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-cobalt-700 ring-1 ring-cobalt-200 shadow-soft">
        {step.number}
      </span>
      <div>
        <h3 className="text-base font-semibold">{step.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{compact ? step.summary : step.details}</p>
      </div>
    </li>
  );
}
