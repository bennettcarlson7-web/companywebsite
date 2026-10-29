import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** Use the title as-is instead of applying the "%s | Brand" template. */
  absoluteTitle?: boolean;
};

/** Page-level metadata with canonical URLs (when a public base URL is configured) and social cards. */
export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  absoluteTitle,
}: PageMetaInput): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;
  // Page-level openGraph replaces the parent's, so the shared card image must be listed explicitly.
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: `${siteConfig.name} — ${siteConfig.tagline}` };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: siteConfig.url ? { canonical: path } : undefined,
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: "en_US",
      title: socialTitle,
      description,
      url: siteConfig.url ? path : undefined,
      images: [image],
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image.url],
    },
  };
}

/** Renders JSON-LD safely (escapes `<` so content can't break out of the script tag). */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// Structured data only states facts we actually know. Nothing is emitted that would require
// an absolute URL until NEXT_PUBLIC_SITE_URL is configured.

export function organizationJsonLd() {
  const url = absoluteUrl("/");
  if (!url) return null;
  const sameAs = Object.values(siteConfig.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName ?? siteConfig.name,
    url,
    description: siteConfig.description,
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd() {
  const url = absoluteUrl("/");
  if (!url) return null;
  return { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url };
}

export function breadcrumbJsonLd(items: { label: string; href: string }[]) {
  if (!siteConfig.url) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

export function serviceJsonLd(service: { title: string; seoDescription: string; slug: string }) {
  const url = absoluteUrl(`/services/${service.slug}`);
  if (!url) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seoDescription,
    url,
    serviceType: service.title,
    provider: { "@type": "Organization", name: siteConfig.legalName ?? siteConfig.name, url: absoluteUrl("/") },
  };
}

export function articleJsonLd(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
}) {
  const url = absoluteUrl(`/insights/${article.slug}`);
  if (!url) return null;
  // No `author` person: bylines are not fabricated. The organization is the publisher.
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", name: siteConfig.legalName ?? siteConfig.name, url: absoluteUrl("/") },
  };
}

/** Person entries for the team: only name, job title, and employer brand — nothing we haven't been given. */
export function teamJsonLd(members: { name: string; role: string; profileUrl: string | null }[]) {
  if (!siteConfig.url) return null;
  return {
    "@context": "https://schema.org",
    "@graph": members.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      worksFor: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
      ...(m.profileUrl ? { sameAs: [m.profileUrl] } : {}),
    })),
  };
}

/**
 * Google JobPosting data. Returns null unless the owner has confirmed every required field
 * (date posted, employment type, location requirements). Salary is included only when configured.
 */
export function jobPostingJsonLd(job: {
  slug: string;
  title: string;
  summary: string;
  overview: string[];
  facts: { compensation: string | null };
  posting: {
    eligible: boolean;
    datePosted: string | null;
    validThrough: string | null;
    employmentType: string | null;
    applicantLocationCountry: string | null;
    remote: boolean | null;
  };
}) {
  const p = job.posting;
  const url = absoluteUrl(`/careers/${job.slug}`);
  // On-site roles would also need a verified street address (jobLocation), which we don't store — so only
  // confirmed remote roles qualify for now.
  if (!url || !p.eligible || !p.datePosted || !p.employmentType || !p.applicantLocationCountry || p.remote !== true) return null;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [job.summary, ...job.overview].join("\n\n"),
    datePosted: p.datePosted,
    ...(p.validThrough ? { validThrough: p.validThrough } : {}),
    employmentType: p.employmentType,
    hiringOrganization: { "@type": "Organization", name: siteConfig.legalName ?? siteConfig.name, sameAs: absoluteUrl("/") },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: p.applicantLocationCountry },
    url,
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (!siteConfig.url || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
