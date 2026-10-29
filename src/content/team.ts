/**
 * Team members, supplied by the business owner. Names and roles are exact — do not autocorrect.
 *
 * `focus` is role-based editorial microcopy describing what the role covers, not a biography.
 * Never add education, past employers, years of experience, achievements, or skills attributed to a person
 * unless that person has provided and approved them. Add `profileUrl` / `photo` only when real and approved.
 */
export type TeamMember = {
  name: string;
  role: string;
  focus: string;
  group: "leadership" | "engineering";
  /** Verified public profile (e.g. LinkedIn). Rendered only when set. */
  profileUrl: string | null;
  /** Path to an approved real portrait in /public. Initials are shown when `null`. */
  photo: string | null;
};

export const team: TeamMember[] = [
  {
    name: "Antonio Ortiz",
    role: "CEO",
    focus: "Company direction & customer relationships",
    group: "leadership",
    profileUrl: null,
    photo: null,
  },
  {
    name: "Ricky Lee Sprouse",
    role: "CTO",
    focus: "Technology strategy & engineering leadership",
    group: "leadership",
    profileUrl: null,
    photo: null,
  },
  {
    name: "Renz Patdu",
    role: "Senior Software Engineer",
    focus: "Software engineering & product delivery",
    group: "engineering",
    profileUrl: null,
    photo: null,
  },
  {
    name: "Parbin Parajuli",
    role: "Senior Software Engineer",
    focus: "Software engineering & product delivery",
    group: "engineering",
    profileUrl: null,
    photo: null,
  },
  {
    name: "Joseph Zhang",
    role: "Senior Software Engineer",
    focus: "Software engineering & product delivery",
    group: "engineering",
    profileUrl: null,
    photo: null,
  },
];

export function getTeam(): TeamMember[] {
  return team;
}

export function getLeadership(): TeamMember[] {
  return team.filter((m) => m.group === "leadership");
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
