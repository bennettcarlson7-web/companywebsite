import type { MDXComponents } from "mdx/types";
import Link from "next/link";

// Editorial styles for article content. Headings start at h2 (the page owns the h1).
const components: MDXComponents = {
  h2: (props) => <h2 className="mt-12 mb-4 scroll-mt-28 text-2xl font-semibold tracking-tight sm:text-[1.7rem]" {...props} />,
  h3: (props) => <h3 className="mt-8 mb-3 text-xl font-semibold" {...props} />,
  p: (props) => <p className="my-5 text-[1.0625rem] leading-[1.8] text-slate-700" {...props} />,
  ul: (props) => <ul className="my-5 list-disc space-y-2 pl-6 text-[1.0625rem] leading-[1.75] text-slate-700 marker:text-cobalt-500" {...props} />,
  ol: (props) => <ol className="my-5 list-decimal space-y-2 pl-6 text-[1.0625rem] leading-[1.75] text-slate-700 marker:font-semibold marker:text-cobalt-600" {...props} />,
  li: (props) => <li className="pl-1" {...props} />,
  strong: (props) => <strong className="font-semibold text-navy-900" {...props} />,
  a: ({ href = "", ...props }) =>
    href.startsWith("/") ? (
      <Link href={href} className="font-medium text-cobalt-700 underline underline-offset-4 hover:text-cobalt-800" {...props} />
    ) : (
      <a href={href} rel="noopener noreferrer" className="font-medium text-cobalt-700 underline underline-offset-4 hover:text-cobalt-800" {...props} />
    ),
  blockquote: (props) => <blockquote className="my-6 border-l-4 border-cobalt-200 pl-5 text-slate-700 italic" {...props} />,
  table: (props) => (
    <div className="my-8 overflow-x-auto rounded-xl ring-1 ring-line">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-paper" {...props} />,
  th: (props) => <th scope="col" className="border-b border-line px-4 py-3 font-semibold text-navy-900" {...props} />,
  td: (props) => <td className="border-b border-line px-4 py-3 align-top text-slate-700" {...props} />,
  hr: () => <hr className="my-10 border-line" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
