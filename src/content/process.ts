import type { ProcessStep } from "@/types/content";

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery",
    icon: "compass",
    summary: "Understand your goals, users, and constraints.",
    details:
      "We start by listening. Through a few focused conversations we learn who the product is for, what problem it solves, what you already have, and what would make the project a success for you.",
    activities: ["Goal and user interviews", "Review of existing tools, data, or code", "Risks and constraints check"],
    outputs: ["Shared problem statement", "Initial success criteria", "Recommendation on next steps"],
  },
  {
    number: "02",
    title: "Product Strategy & Scope",
    icon: "layers",
    summary: "Define the right first release and how to get there.",
    details:
      "We turn what we've learned into a focused plan: the smallest release that delivers real value, the technical approach, milestones, and an estimate with its assumptions spelled out.",
    activities: ["Feature prioritization", "Technical architecture outline", "Milestone and budget planning"],
    outputs: ["Written scope and roadmap", "Estimate range with assumptions", "Proposal for the build phase"],
  },
  {
    number: "03",
    title: "Design & Prototyping",
    icon: "pen",
    summary: "See and test the product before it's built.",
    details:
      "We design the key user flows and build clickable prototypes, so you can react to something real and we can test it with users before committing engineering time.",
    activities: ["User flows and wireframes", "Visual design and design system", "Prototype testing with real users"],
    outputs: ["Clickable prototype", "Design system and UI specs", "Validated priorities for the build"],
  },
  {
    number: "04",
    title: "Iterative Development",
    icon: "code",
    summary: "Build in short cycles with working software you can try.",
    details:
      "We build in one- to two-week cycles. Every cycle ends with a demo of working software, an update on progress against milestones, and an honest look at anything that's changed.",
    activities: ["Short development cycles", "Code review and automated testing", "Regular demos and written updates"],
    outputs: ["Working software every cycle", "Test coverage and CI/CD pipeline", "Up-to-date documentation"],
  },
  {
    number: "05",
    title: "Launch & Growth",
    icon: "rocket",
    summary: "Release with confidence, then keep improving.",
    details:
      "We plan the launch together, set up monitoring, and stay close in the weeks after release. Then we use real feedback to decide what to improve next — with us or with your own team.",
    activities: ["Launch checklist and staged rollout", "Monitoring and incident response setup", "Post-launch review and roadmap"],
    outputs: ["Production release", "Handover documentation", "Prioritized improvement backlog"],
  },
];
