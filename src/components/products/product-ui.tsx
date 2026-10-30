import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { isReleased, statusLabels, type Product, type ProductStatus } from "@/content/products";
import { mailtoHref, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { ButtonAnchor } from "@/components/ui/button";
import { ProductPreview } from "./previews";

const statusTones: Record<ProductStatus, string> = {
  planned: "bg-paper text-slate-700 ring-line",
  "up-next": "bg-violet-50 text-violet-800 ring-violet-200",
  "in-development": "bg-cobalt-50 text-cobalt-700 ring-cobalt-200",
  beta: "bg-amber-50 text-amber-800 ring-amber-200",
  live: "bg-success-50 text-success-700 ring-success-700/30",
};
const dotTones: Record<ProductStatus, string> = {
  planned: "bg-slate-500",
  "up-next": "bg-violet-600",
  "in-development": "bg-cobalt-600",
  beta: "bg-amber-600",
  live: "bg-success-700",
};

export function StatusBadge({ status, className }: { status: ProductStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", statusTones[status], className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dotTones[status])} />
      <span className="sr-only">Status: </span>
      {statusLabels[status]}
    </span>
  );
}

/** View Demo only when a working demo exists; otherwise say so plainly and offer early access. */
export function DemoActions({ product, size = "lg" }: { product: Product; size?: "md" | "lg" }) {
  if (product.demoUrl) {
    return (
      <ButtonAnchor href={product.demoUrl} size={size} target="_blank" rel="noopener noreferrer">
        View Demo
        <ExternalLink aria-hidden="true" className="size-4" />
        <span className="sr-only"> of {product.name} (opens in a new tab)</span>
      </ButtonAnchor>
    );
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <ButtonAnchor href={mailtoHref(siteConfig.contact.email, `Early access — ${product.name}`)} size={size}>
        Get early access<span className="sr-only"> to {product.name}</span>
      </ButtonAnchor>
      <p className="text-sm text-slate-600">Demo coming soon{isReleased(product) ? "" : " — we'll publish it when it works"}.</p>
    </div>
  );
}

export function ProductCard({ product, headingLevel = "h3" }: { product: Product; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const id = `product-${product.slug}`;
  return (
    <article
      aria-labelledby={id}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line transition-shadow hover:shadow-card"
    >
      <div className="border-b border-line bg-gradient-to-br from-mist to-cobalt-50 p-4">
        <ProductPreview product={product} caption={false} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={product.status} />
          {!product.screenshots.length && <span className="text-xs text-slate-600">Design preview</span>}
        </div>
        <Heading id={id} className="mt-4 text-xl font-semibold">
          <Link href={`/work/${product.slug}`} className="after:absolute after:inset-0 group-hover:text-cobalt-700">
            {product.name}
          </Link>
        </Heading>
        <p className="mt-1 text-sm font-semibold text-cobalt-700">{product.category}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{product.summary}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-700">
          Explore {product.name}
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
