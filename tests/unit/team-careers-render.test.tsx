import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { getTeam } from "@/content/team";
import { seedJobs } from "@/content/jobs";
import { TeamCard } from "@/components/team/team-card";
import { JobCard } from "@/components/careers/job-card";

describe("TeamCard", () => {
  it("renders all five people with exact names and roles, using initials instead of photos", () => {
    render(
      <ul>
        {getTeam().map((m) => (
          <li key={m.name}>
            <TeamCard member={m} />
          </li>
        ))}
      </ul>,
    );
    const expected: [string, string][] = [
      ["Antonio Ortiz", "CEO"],
      ["Ricky Lee Sprouse", "CTO"],
      ["Renz Patdu", "Senior Software Engineer"],
      ["Parbin Parajuli", "Senior Software Engineer"],
      ["Joseph Zhang", "Senior Software Engineer"],
    ];
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(5);
    expected.forEach(([name, role], i) => {
      const card = within(cards[i]!);
      expect(card.getByRole("heading", { name })).toBeInTheDocument();
      expect(card.getByText(role)).toBeInTheDocument();
    });
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});

describe("JobCard", () => {
  it("renders the three roles with View Role and Apply links that preselect the role", () => {
    render(
      <>
        {seedJobs.map((j) => (
          <JobCard key={j.slug} job={j} />
        ))}
      </>,
    );
    for (const job of seedJobs) {
      const card = within(screen.getByRole("article", { name: job.title }));
      expect(card.getByRole("link", { name: `View Role: ${job.title}` })).toHaveAttribute("href", `/careers/${job.slug}`);
      expect(card.getByRole("link", { name: `Apply for ${job.title}` })).toHaveAttribute("href", `/careers/apply?role=${job.slug}`);
      expect(
        card.getByText("Remote — worldwide (outside the United States) · Full-time · USD 2,000 per month"),
      ).toBeInTheDocument();
    }
    expect(screen.queryByText(/no open roles/i)).not.toBeInTheDocument();
  });
});
