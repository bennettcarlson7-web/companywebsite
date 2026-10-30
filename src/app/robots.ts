import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  // Indexing is opt-in: requires both a public URL and NEXT_PUBLIC_ALLOW_INDEXING=true.
  if (!siteConfig.allowIndexing || !siteConfig.url) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    sitemap: absoluteUrl("/sitemap.xml") ?? undefined,
    host: siteConfig.url,
  };
}
