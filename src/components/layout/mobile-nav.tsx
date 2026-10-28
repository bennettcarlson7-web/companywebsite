"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { buttonClasses } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { isActivePath } from "./nav-links";

/**
 * Mobile menu built on the native <dialog> element: showModal() provides focus containment,
 * Escape-to-close, an inert background, and focus return to the trigger.
 */
export function MobileNav() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Close if the viewport grows past the mobile breakpoint while open.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex size-11 items-center justify-center rounded-xl text-navy-900 hover:bg-cobalt-50"
      >
        <Menu aria-hidden="true" className="size-6" />
        <span className="sr-only">Open menu</span>
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        aria-label="Site menu"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // Click on the backdrop area (the dialog element itself) closes the menu.
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm bg-white p-0 shadow-float backdrop:bg-navy-950/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="inline-flex items-center gap-2.5 text-lg font-bold text-navy-900">
              <LogoMark className="size-7" />
              {siteConfig.name}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-11 items-center justify-center rounded-xl text-navy-900 hover:bg-cobalt-50"
            >
              <X aria-hidden="true" className="size-6" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {siteConfig.nav.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center justify-between rounded-xl px-4 text-base font-medium",
                        active ? "bg-cobalt-50 text-cobalt-700" : "text-navy-900 hover:bg-paper",
                      )}
                    >
                      {item.label}
                      <ArrowRight aria-hidden="true" className="size-4 opacity-50" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-line p-4">
            <Link
              href={siteConfig.cta.primary.href}
              onClick={() => setOpen(false)}
              className={buttonClasses({ size: "lg", className: "w-full" })}
            >
              {siteConfig.cta.primary.label}
            </Link>
            <p className="mt-3 text-center text-sm text-slate-600">{siteConfig.contact.responseTime}</p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
