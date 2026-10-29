import { describe, expect, it } from "vitest";
import { getTeam, initialsOf } from "@/content/team";
import { getJobs, UNCONFIRMED_DETAIL } from "@/content/jobs";
import { getProjects } from "@/content/projects";
import { articleMeta, todayInUsPacific } from "@/content/insights/meta";
import { company, siteConfig } from "@/lib/site-config";
import { jobPostingJsonLd } from "@/lib/seo";

describe("owner-supplied facts", () => {
  it("lists the five team members with exact names and roles, in order", () => {
    expect(getTeam().map((m) => [m.name, m.role])).toEqual([
      ["Antonio Ortiz", "CEO"],
      ["Ricky Lee Sprouse", "CTO"],
      ["Renz Patdu", "Senior Software Engineer"],
      ["Parbin Parajuli", "Senior Software Engineer"],
      ["Joseph Zhang", "Senior Software Engineer"],
    ]);
  });

  it("does not attach unverified photos or profile links to team members", () => {
    for (const m of getTeam()) {
      expect(m.photo).toBeNull();
      expect(m.profileUrl).toBeNull();
    }
    expect(initialsOf("Ricky Lee Sprouse")).toBe("RS");
  });

  it("lists exactly the three recruiting priorities", () => {
    expect(getJobs().map((j) => j.title)).toEqual([
      "Senior Software Engineer — AI/ML",
      "Senior Software Engineer — Data Engineering",
      "Talent Recruiter",
    ]);
    expect(getJobs().map((j) => j.slug)).toEqual([
      "senior-software-engineer-ai-ml",
      "senior-software-engineer-data-engineering",
      "talent-recruiter",
    ]);
  });

  it("shows exactly the owner-confirmed job terms, excluding the U.S.", () => {
    for (const job of getJobs()) {
      expect(job.facts).toEqual({
        location: "Remote — worldwide (outside the United States)",
        workplace: "Remote",
        employmentType: "Full-time",
        compensation: "USD 2,000 per month",
      });
      expect(job.posting.eligible).toBe(false);
      expect(jobPostingJsonLd(job)).toBeNull();
    }
    expect(UNCONFIRMED_DETAIL).toBe("Shared during the hiring process");
  });

  it("uses the confirmed legal name and an active (non-draft) Privacy Policy", () => {
    expect(company.legalName).toBe("NextMade");
    expect(siteConfig.name).toBe("NextMade");
    expect(siteConfig.legal.privacy.draft).toBe(false);
  });

  it("uses the company domain and the owner-chosen client and hiring inboxes", () => {
    expect(company.domain).toBe("nextmadelabs.com");
    expect(siteConfig.url).toBe("https://nextmadelabs.com");
    expect(siteConfig.contact.email).toBe("hello@nextmadelabs.com");
    expect(siteConfig.contact.careersEmail).toBe("careers@nextmadelabs.com");
  });
});

describe("content integrity", () => {
  it("has no future-dated articles or policy dates (U.S. Pacific calendar)", () => {
    const today = todayInUsPacific();
    for (const a of articleMeta) {
      expect(a.publishedAt <= today, `${a.slug} is dated ${a.publishedAt}, after ${today}`).toBe(true);
      if (a.updatedAt) expect(a.updatedAt <= today).toBe(true);
    }
    expect(siteConfig.legal.privacy.lastUpdated <= today).toBe(true);
    expect(siteConfig.legal.terms.lastUpdated <= today).toBe(true);
  });

  it("computes the U.S. Pacific date across the date line", () => {
    // 2026-10-29 06:00 in Manila is still 2026-10-28 in California.
    expect(todayInUsPacific(new Date("2026-10-28T22:00:00Z"))).toBe("2026-10-28");
  });

  it("keeps every portfolio entry labeled as a concept until verified case studies exist", () => {
    for (const p of getProjects()) expect(p.kind).toBe("concept");
  });
});
