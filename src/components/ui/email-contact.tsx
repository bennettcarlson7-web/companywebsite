"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** The business email as a real mailto: link plus a copy button with an announced confirmation. */
export function EmailContact({
  email,
  subject,
  location,
  tone = "light",
  className,
}: {
  email: string;
  subject?: string;
  location: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied("copied");
      track({ name: "email_copied", props: { location } });
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 2500);
  }

  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <a
        href={href}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold break-all underline-offset-4 hover:underline",
          dark ? "text-white" : "text-cobalt-700",
        )}
      >
        <Mail aria-hidden="true" className="size-4 shrink-0" />
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold ring-1 transition-colors",
          dark ? "text-slate-200 ring-white/20 hover:bg-white/10" : "text-slate-700 ring-line hover:bg-cobalt-50",
        )}
      >
        {copied === "copied" ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
        {copied === "copied" ? "Copied" : "Copy"}
        <span className="sr-only"> email address</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied === "copied" ? "Email address copied to clipboard." : copied === "failed" ? "Couldn't copy. Please select the address and copy it manually." : ""}
      </span>
    </div>
  );
}
