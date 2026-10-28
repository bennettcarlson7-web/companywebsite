import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Abstract "N" mark: two offset strokes suggesting forward motion. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <defs>
        <linearGradient id="nm-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f6bf3" />
          <stop offset="1" stopColor="#0d46c7" />
        </linearGradient>
      </defs>
      <path d="M14 12.5 25 25V7" fill="none" stroke="#8fb2ff" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 25V7l11.5 12.5" fill="none" stroke="url(#nm-mark)" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <LogoMark />
      <span className={cn("text-xl font-bold tracking-tight", inverse ? "text-white" : "text-navy-900")}>{siteConfig.name}</span>
    </Link>
  );
}
