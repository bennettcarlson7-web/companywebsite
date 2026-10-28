import type { IconName } from "@/types/content";

export const hero = {
  eyebrow: ["Ideas", "Engineering", "Real impact"],
  headline: ["Your Idea.", "Our Engineering."],
  highlight: "Real Results.",
  body: "From your first product idea to the next release, we design, build, and improve software that solves real problems. Tell us what you're imagining — we'll help you find a practical way to launch it.",
};

export const differentiators: { title: string; body: string; icon: IconName }[] = [
  { title: "Product-led engineering", body: "We build for outcomes, not just tickets.", icon: "compass" },
  { title: "Clear communication", body: "Plain language, regular updates, no surprises.", icon: "message" },
  { title: "Senior technical guidance", body: "Experienced judgment on every key decision.", icon: "shield" },
  { title: "Built for growth", body: "Architecture that scales with your business.", icon: "trending" },
];

export const audiences: { title: string; body: string; icon: IconName }[] = [
  {
    title: "Nontechnical founders",
    body: "You have the idea and the domain knowledge. We bring the product and engineering skills to shape it into a first release.",
    icon: "compass",
  },
  {
    title: "Early-stage startups",
    body: "You need to validate quickly without building something you'll have to throw away. We help you launch lean and learn fast.",
    icon: "rocket",
  },
  {
    title: "Small & mid-sized businesses",
    body: "Your operations have outgrown spreadsheets and disconnected tools. We build software that fits how your team works.",
    icon: "layout",
  },
  {
    title: "Growing companies",
    body: "Your roadmap is bigger than your team. We add reliable engineering capacity and senior technical guidance.",
    icon: "users",
  },
];

export const reasons: { title: string; body: string; icon: IconName }[] = [
  {
    title: "We start with the problem",
    body: "Before we talk about frameworks, we make sure we understand your users, your business, and what success looks like.",
    icon: "compass",
  },
  {
    title: "You see progress early and often",
    body: "Working software every one to two weeks, so you can give feedback while it's still easy to change course.",
    icon: "gauge",
  },
  {
    title: "Honest estimates and trade-offs",
    body: "We explain what's realistic for your budget and timeline, and tell you early when something changes.",
    icon: "message",
  },
  {
    title: "Engineering you can build on",
    body: "Clean architecture, automated tests, and documentation, so your product is an asset rather than a liability.",
    icon: "shield",
  },
];

/** Plain-text technology list. Names are trademarks of their owners; no partnership is implied. */
export const technologyGroups: { label: string; items: string[] }[] = [
  { label: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { label: "Mobile", items: ["React Native", "Expo", "Swift", "Kotlin"] },
  { label: "Backend", items: ["Node.js", "Python", "Go", "PostgreSQL"] },
  { label: "Cloud & DevOps", items: ["AWS", "Google Cloud", "Vercel", "Docker", "CI/CD"] },
  { label: "AI & Data", items: ["LLM APIs", "Vector search", "Workflow automation", "Analytics"] },
];
