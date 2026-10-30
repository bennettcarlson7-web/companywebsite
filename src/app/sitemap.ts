import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getServices } from "@/content/services";
import { getProjects } from "@/content/projects";
import { getProducts } from "@/content/products";
import { getArticles } from "@/content/insights";
import { getOpenJobs } from "@/lib/data/jobs";

const staticRoutes = ["/", "/services", "/work", "/process", "/about", "/insights", "/careers", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getOpenJobs();
  // Without a configured public URL, relative entries are emitted for local inspection only;
  // robots.txt blocks crawling in that state.
  const base = siteConfig.url ?? "";
  const entry = (path: string, lastModified?: string, priority?: number): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path === "/" ? "/" : path}`,
    ...(lastModified ? { lastModified } : {}),
    ...(priority ? { priority } : {}),
  });

  return [
    ...staticRoutes.map((p) => entry(p, undefined, p === "/" ? 1 : p === "/contact" || p === "/services" ? 0.9 : undefined)),
    ...getServices().map((s) => entry(`/services/${s.slug}`, undefined, 0.8)),
    ...getProducts().map((p) => entry(`/work/${p.slug}`, undefined, 0.8)),
    ...getProjects().map((p) => entry(`/work/${p.slug}`)),
    ...getArticles().map((a) => entry(`/insights/${a.slug}`, a.updatedAt ?? a.publishedAt, 0.7)),
    ...jobs.map((j) => entry(`/careers/${j.slug}`, j.updatedAt, 0.6)),
  ];
}
