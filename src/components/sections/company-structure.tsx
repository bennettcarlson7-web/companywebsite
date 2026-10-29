import { ArrowDown, Briefcase, Building2, Code, Globe, Users } from "lucide-react";
import { company, siteConfig } from "@/lib/site-config";

const units = [
  { title: "Clients", body: "Project inquiries, proposals, and delivery for the businesses we build for.", Icon: Briefcase },
  { title: "Engineering", body: "The senior team that designs, builds, and supports client software.", Icon: Code },
  { title: "Recruitment", body: "Hiring for our open roles, from first application to offer.", Icon: Users },
];

/**
 * Who stands behind the brand: the legal entity → the NextMade brand → what it does.
 * Renders nothing when brand and legal entity are the same.
 */
export function CompanyStructure() {
  const legal = siteConfig.legalName;
  if (!legal || legal === siteConfig.name) return null;

  return (
    <figure aria-label={`${siteConfig.name} company structure`} className="rounded-[1.75rem] bg-white p-6 ring-1 ring-line sm:p-8">
      <div className="text-center">
        <Building2 aria-hidden="true" className="mx-auto size-7 text-navy-900" />
        <p className="mt-3 text-lg font-semibold text-navy-900">{legal}</p>
        <p className="mt-1 text-sm text-slate-600">Legal and contracting entity</p>
      </div>

      <ArrowDown aria-hidden="true" className="mx-auto my-4 size-5 text-slate-400" />

      <div className="rounded-2xl bg-mist p-6 text-center ring-1 ring-cobalt-100">
        <Globe aria-hidden="true" className="mx-auto size-7 text-cobalt-700" />
        <p className="mt-3 text-lg font-semibold text-navy-900">{siteConfig.name}</p>
        <p className="mt-1 text-sm text-slate-600">Customer-facing technology brand · {company.domain}</p>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {units.map(({ title, body, Icon }) => (
          <li key={title} className="rounded-2xl p-4 text-center ring-1 ring-line">
            <Icon aria-hidden="true" className="mx-auto size-6 text-cobalt-700" />
            <p className="mt-2 font-semibold text-navy-900">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
          </li>
        ))}
      </ul>

      <figcaption className="mt-6 text-sm leading-relaxed text-slate-600">
        {siteConfig.name} is a brand of {legal}. Proposals, contracts, and invoices for client work are issued by {legal}.
      </figcaption>
    </figure>
  );
}
