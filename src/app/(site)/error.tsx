"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export default function ErrorBoundary({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Only the digest is logged: it matches server logs without exposing details.
    const digest = error instanceof Error && "digest" in error ? (error as Error & { digest?: string }).digest : undefined;
    console.error("Page error", digest ?? "");
  }, [error]);

  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="text-sm font-semibold tracking-[0.14em] text-cobalt-700 uppercase">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">This page didn&apos;t load properly</h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-slate-600">
        It&apos;s probably temporary. Try again, or head back to the home page.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={() => retry()} className={buttonClasses({ size: "lg" })}>
          Try Again
        </button>
        <Link href="/" className={buttonClasses({ size: "lg", variant: "secondary" })}>
          Back to Home
        </Link>
      </div>
    </Container>
  );
}
