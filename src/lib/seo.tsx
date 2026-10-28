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
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
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
