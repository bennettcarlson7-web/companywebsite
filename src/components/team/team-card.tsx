import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { initialsOf, type TeamMember } from "@/content/team";
import { cn } from "@/lib/utils";

/** Initials avatar. A real, approved portrait replaces it only when `member.photo` is set. */
export function TeamAvatar({ member, size = "lg" }: { member: TeamMember; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "size-16 text-xl" : "size-12 text-base";
  if (member.photo) {
    return (
      <Image
        src={member.photo}
        alt={`Portrait of ${member.name}`}
        width={size === "lg" ? 64 : 48}
        height={size === "lg" ? 64 : 48}
        className={cn("rounded-2xl object-cover", dims)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl font-semibold tracking-wide text-white",
        dims,
        member.group === "leadership"
          ? "bg-gradient-to-br from-navy-800 to-cobalt-700"
          : "bg-gradient-to-br from-cobalt-600 to-cobalt-400",
      )}
    >
      {initialsOf(member.name)}
    </span>
  );
}

export function TeamCard({ member, headingLevel = "h3" }: { member: TeamMember; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const id = `team-${member.name.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <article aria-labelledby={id} className="flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-line shadow-soft">
      <TeamAvatar member={member} />
      <Heading id={id} className="mt-5 text-lg font-semibold">
        {member.name}
      </Heading>
      <p className="mt-0.5 text-sm font-semibold text-cobalt-700">{member.role}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{member.focus}</p>
      {member.profileUrl && (
        <a
          href={member.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cobalt-700 hover:underline"
        >
          Profile
          <ArrowUpRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> for {member.name} (opens in a new tab)</span>
        </a>
      )}
    </article>
  );
}
