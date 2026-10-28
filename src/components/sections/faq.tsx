import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/types/content";
import { JsonLd, faqJsonLd } from "@/lib/seo";

/** Accessible accordion built on native <details>/<summary>: keyboard and screen-reader friendly, no JS. */
export function FAQAccordion({ faqs, withSchema = false }: { faqs: FAQ[]; withSchema?: boolean }) {
  return (
    <>
      <div className="divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
        {faqs.map((faq) => (
          <details key={faq.question} className="group px-5 sm:px-6">
            <summary className="flex min-h-14 items-center justify-between gap-4 py-4 text-left font-semibold text-navy-900 hover:text-cobalt-700">
              <span>{faq.question}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="pb-5 leading-relaxed text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
      {withSchema && <JsonLd data={faqJsonLd(faqs)} />}
    </>
  );
}
