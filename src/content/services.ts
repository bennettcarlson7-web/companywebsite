import type { Service } from "@/types/content";

export const services: Service[] = [
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    shortTitle: "Custom Software",
    icon: "code",
    summary:
      "Purpose-built software for the way your business actually works — from a first MVP to internal tools your team relies on every day.",
    intro:
      "Off-the-shelf tools get you started, but at some point the workarounds cost more than they save. We design and build software around your real workflows, with clean architecture you can keep growing.",
    seoTitle: "Custom Software Development for Startups & Growing Businesses",
    seoDescription:
      "Custom software development from discovery to launch: MVPs, internal tools, customer portals, and business platforms built with maintainable, modern engineering.",
    idealFor: [
      "Founders turning a validated idea into a first product",
      "Teams outgrowing spreadsheets and disconnected SaaS tools",
      "Businesses that need a customer portal or internal platform",
    ],
    problems: [
      {
        title: "Your process lives in spreadsheets",
        body: "Critical work depends on copied cells, email threads, and one person who knows how it all fits together.",
      },
      {
        title: "Generic tools don't fit",
        body: "You pay for several products that each do 70% of what you need, and your team fills the gaps by hand.",
      },
      {
        title: "You have an idea but no technical team",
        body: "You know the problem well, but you need a partner who can shape it into a product and build it responsibly.",
      },
    ],
    benefits: [
      {
        title: "Built around your workflow",
        body: "We map how work actually flows before writing code, so the software removes steps instead of adding them.",
      },
      {
        title: "Scoped to launch, designed to grow",
        body: "We focus the first release on what matters most, while choosing an architecture that won't box you in later.",
      },
      {
        title: "Code you own and can hand off",
        body: "Readable code, documentation, and automated tests mean any competent team can pick it up — including yours.",
      },
    ],
    deliverables: [
      "Product scope and prioritized feature roadmap",
      "Clickable prototype of key user flows",
      "Production web application with admin tooling",
      "Automated tests and continuous deployment pipeline",
      "Technical documentation and handover session",
    ],
    process: [
      {
        title: "Discovery",
        body: "Workshops to understand users, workflows, constraints, and what success looks like.",
      },
      {
        title: "Scope & architecture",
        body: "A focused first-release scope, technical approach, milestones, and a written estimate.",
      },
      {
        title: "Iterative build",
        body: "Short cycles with working software you can try every one to two weeks.",
      },
      {
        title: "Launch & support",
        body: "Production rollout, monitoring, and a plan for what to improve next.",
      },
    ],
    technologies: ["TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL", "AWS", "Google Cloud"],
    faqs: [
      {
        question: "How do you estimate a custom software project?",
        answer:
          "After discovery we break the scope into features, estimate each one, and share a range along with the assumptions behind it. We'd rather give you an honest range than a precise number that falls apart later.",
      },
      {
        question: "Can you work with an existing codebase?",
        answer:
          "Yes. We start with a short technical review so we understand what's there, what's risky, and what's worth keeping before recommending changes.",
      },
      {
        question: "What happens after launch?",
        answer:
          "Most products keep evolving. We can continue with ongoing development and support, or hand the product over to your team with documentation and a walkthrough.",
      },
    ],
  },
  {
    slug: "web-mobile-applications",
    title: "Web & Mobile Applications",
    shortTitle: "Web & Mobile Apps",
    icon: "smartphone",
    summary:
      "Fast, accessible web apps and cross-platform mobile apps that feel good to use and are built to scale with your users.",
    intro:
      "People judge a product in seconds. We combine thoughtful UX with solid engineering to build web and mobile apps that load quickly, work on every screen, and are straightforward to maintain.",
    seoTitle: "Web & Mobile App Development — Product Design to Launch",
    seoDescription:
      "Web and mobile app development for startups and businesses: UX design, responsive web apps, cross-platform iOS and Android apps, and app store launch support.",
    idealFor: [
      "Startups launching a customer-facing product",
      "Businesses adding a mobile experience for customers or field teams",
      "Teams replacing a slow or outdated web application",
    ],
    problems: [
      {
        title: "Your current app feels slow or dated",
        body: "Users drop off before they reach the value, and every change to the old codebase takes longer than it should.",
      },
      {
        title: "You need web and mobile without two teams",
        body: "Building separate native apps doubles cost. You need a pragmatic cross-platform approach.",
      },
      {
        title: "Design and engineering aren't talking",
        body: "Mockups look great but don't survive contact with real data, edge cases, or small screens.",
      },
    ],
    benefits: [
      {
        title: "UX grounded in real use",
        body: "We prototype key flows early and test them with real people before committing to the build.",
      },
      {
        title: "Performance and accessibility by default",
        body: "We target Core Web Vitals and WCAG 2.2 AA from the start — not as a last-minute audit.",
      },
      {
        title: "One codebase where it makes sense",
        body: "Shared logic across web, iOS, and Android when it reduces cost without compromising the experience.",
      },
    ],
    deliverables: [
      "UX flows, wireframes, and a design system",
      "Responsive web application",
      "iOS and Android apps (cross-platform or native, as appropriate)",
      "API and backend services",
      "App store submission support and release checklist",
    ],
    process: [
      {
        title: "Product & UX discovery",
        body: "Clarify users, core journeys, and the smallest experience that delivers real value.",
      },
      {
        title: "Design & prototype",
        body: "Interactive prototypes and a reusable component library that engineering builds from directly.",
      },
      {
        title: "Build & test",
        body: "Iterative development with test builds on real devices throughout.",
      },
      {
        title: "Release & iterate",
        body: "Staged rollout, analytics you've approved, and a backlog shaped by real feedback.",
      },
    ],
    technologies: ["React", "Next.js", "React Native", "Expo", "Swift", "Kotlin", "Node.js", "PostgreSQL"],
    faqs: [
      {
        question: "Should we build native or cross-platform?",
        answer:
          "It depends on your app. Cross-platform frameworks like React Native work well for most business and consumer apps. Native is worth it for heavy device integration or demanding graphics. We'll recommend one with clear reasons.",
      },
      {
        question: "Do you help with App Store and Google Play submission?",
        answer:
          "Yes. We prepare builds, store listings guidance, privacy disclosures, and review checklists, and we work through any review feedback with you.",
      },
      {
        question: "Can you design the app too, or only build it?",
        answer:
          "Both. We can design from scratch, or build from your existing designs and help adapt them where real data or technical constraints require it.",
      },
    ],
  },
  {
    slug: "ai-solutions-automation",
    title: "AI Solutions & Workflow Automation",
    shortTitle: "AI & Automation",
    icon: "sparkles",
    summary:
      "Practical AI and automation that removes repetitive work and helps your team make better decisions — with guardrails and measurable goals.",
    intro:
      "AI is useful when it's aimed at a specific, measurable problem. We help you find the workflows where automation or AI genuinely helps, build them carefully, and keep humans in control where it matters.",
    seoTitle: "AI Solutions & Workflow Automation for Businesses",
    seoDescription:
      "Practical AI and workflow automation: document processing, internal knowledge assistants, AI features in your product, and process automation with clear guardrails.",
    idealFor: [
      "Teams buried in repetitive data entry, triage, or document review",
      "Products that could benefit from an AI-assisted feature",
      "Organizations exploring AI but unsure where to start",
    ],
    problems: [
      {
        title: "Lots of AI hype, unclear value",
        body: "You're hearing about AI everywhere but don't know which use cases are worth the investment.",
      },
      {
        title: "Skilled people doing repetitive work",
        body: "Your team spends hours copying data between systems, sorting requests, or summarizing documents.",
      },
      {
        title: "Concerns about accuracy and data",
        body: "You worry about wrong answers, sensitive data leaving your control, or costs that are hard to predict.",
      },
    ],
    benefits: [
      {
        title: "Use cases tied to outcomes",
        body: "We start by defining what 'better' means — time saved, errors reduced, faster responses — and measure against it.",
      },
      {
        title: "Guardrails built in",
        body: "Human review steps, evaluation sets, access controls, and logging appropriate to the risk of each workflow.",
      },
      {
        title: "Right tool for the job",
        body: "Sometimes the answer is a large language model; often it's a simple rule or integration. We'll tell you which.",
      },
    ],
    deliverables: [
      "AI opportunity assessment and prioritized use-case list",
      "Proof of concept with an evaluation against real examples",
      "Production workflow automation or AI feature",
      "Prompt, model, and data-handling documentation",
      "Monitoring for quality, usage, and cost",
    ],
    process: [
      {
        title: "Assess",
        body: "Review workflows, data sources, and risks to find high-value, low-regret opportunities.",
      },
      {
        title: "Prototype & evaluate",
        body: "Build a focused proof of concept and test it against real (appropriately handled) examples.",
      },
      {
        title: "Productionize",
        body: "Harden the workflow with access control, error handling, human review, and monitoring.",
      },
      {
        title: "Improve",
        body: "Track quality and cost over time and refine as models, data, and needs change.",
      },
    ],
    technologies: ["OpenAI API", "Anthropic API", "Python", "TypeScript", "Vector databases", "n8n", "Zapier", "AWS"],
    faqs: [
      {
        question: "Will our data be used to train AI models?",
        answer:
          "We design around your data policies. Many AI providers offer business terms that exclude API data from training; we'll review the options with you and document how data flows through any system we build.",
      },
      {
        question: "How do you deal with AI giving wrong answers?",
        answer:
          "We evaluate on real examples before launch, limit the AI to tasks where errors are recoverable, ground answers in your own sources where possible, and add human review for higher-stakes steps.",
      },
      {
        question: "Do we need a lot of data to get started?",
        answer:
          "Usually not. Many useful automations work with modern models and a modest set of good examples. The assessment will show what's realistic with what you have.",
      },
    ],
  },
  {
    slug: "system-integration-modernization",
    title: "System Integration & Modernization",
    shortTitle: "Integration & Modernization",
    icon: "plug",
    summary:
      "Connect the tools you already use, migrate off fragile legacy systems, and modernize your stack without stopping the business.",
    intro:
      "Most businesses run on a mix of systems that don't talk to each other. We connect them with reliable integrations and modernize aging software step by step, so you reduce risk instead of betting everything on a big-bang rewrite.",
    seoTitle: "System Integration, API Development & Legacy Modernization",
    seoDescription:
      "System integration and modernization: API development, data syncing between business tools, cloud migration, and incremental legacy system modernization.",
    idealFor: [
      "Teams re-keying the same data into multiple systems",
      "Businesses running on aging software that's hard to change",
      "Companies planning a move to the cloud",
    ],
    problems: [
      {
        title: "Data lives in silos",
        body: "Your CRM, billing, operations, and reporting tools disagree with each other, and reconciling them is manual.",
      },
      {
        title: "Legacy software is a risk",
        body: "An old system still runs critical work, but few people understand it and every change feels dangerous.",
      },
      {
        title: "Integrations keep breaking",
        body: "Point-to-point scripts fail quietly, and you find out when a customer or report is wrong.",
      },
    ],
    benefits: [
      {
        title: "One reliable source of truth",
        body: "Integrations with clear ownership, retries, and alerts, so data stays consistent across systems.",
      },
      {
        title: "Incremental, low-risk modernization",
        body: "We replace systems piece by piece behind stable interfaces, keeping the business running throughout.",
      },
      {
        title: "Visibility when things go wrong",
        body: "Logging, monitoring, and runbooks so problems are caught early and fixed quickly.",
      },
    ],
    deliverables: [
      "Systems and data-flow map of your current landscape",
      "Integration architecture and API design",
      "Production integrations with monitoring and alerting",
      "Phased modernization or migration plan",
      "Runbooks and operational documentation",
    ],
    process: [
      {
        title: "Map",
        body: "Document current systems, data flows, owners, and pain points.",
      },
      {
        title: "Plan",
        body: "Design target architecture and a phased plan that keeps risk manageable.",
      },
      {
        title: "Integrate & migrate",
        body: "Build integrations and migrate in stages, validating data at each step.",
      },
      {
        title: "Operate",
        body: "Hand over monitoring, alerts, and runbooks — or keep supporting them for you.",
      },
    ],
    technologies: ["REST & GraphQL APIs", "Webhooks", "Node.js", "Python", ".NET", "PostgreSQL", "AWS", "Azure"],
    faqs: [
      {
        question: "Do we have to replace our legacy system all at once?",
        answer:
          "Rarely. We usually recommend an incremental approach: wrap the old system with stable APIs, move functionality over in slices, and retire the old pieces once the new ones are proven.",
      },
      {
        question: "Can you integrate with tools that don't have a great API?",
        answer:
          "Often, yes — through file exports, database access, webhooks, or vendor partner APIs. We'll assess the options and their reliability trade-offs up front.",
      },
      {
        question: "How do you avoid downtime during migrations?",
        answer:
          "We plan migrations with rehearsals, data validation, rollback steps, and scheduled cutover windows that fit your business.",
      },
    ],
  },
  {
    slug: "dedicated-engineering-teams",
    title: "Dedicated Engineering Teams",
    shortTitle: "Dedicated Teams",
    icon: "users",
    summary:
      "Add reliable engineering capacity to your roadmap — product-minded developers who work inside your process and communicate clearly.",
    intro:
      "Sometimes you don't need a whole project — you need more capable hands on the work you already have. We provide engineering capacity that integrates with your team, follows your standards, and keeps you informed.",
    seoTitle: "Dedicated Engineering Teams & Staff Augmentation",
    seoDescription:
      "Dedicated engineering teams for startups and growing companies: product-minded developers who join your workflow, with clear communication and flexible engagement.",
    idealFor: [
      "Startups with a roadmap bigger than their current team",
      "Companies that need specialized skills for a period of time",
      "Founders who need a technical lead while they hire",
    ],
    problems: [
      {
        title: "Your roadmap outpaces your team",
        body: "Important features keep slipping because the people you have are already at capacity.",
      },
      {
        title: "Hiring takes months",
        body: "You need progress now, while you build a permanent team at a sustainable pace.",
      },
      {
        title: "Past outsourcing was painful",
        body: "You've experienced vague updates, missed expectations, or code you had to rewrite.",
      },
    ],
    benefits: [
      {
        title: "Works inside your process",
        body: "Your tools, your rituals, your code standards — with the option to bring better practices where useful.",
      },
      {
        title: "Clear, regular communication",
        body: "Written updates, visible progress, and early warnings about risks instead of surprises.",
      },
      {
        title: "Flexible engagement",
        body: "Scale involvement up or down as your needs change, with reasonable notice periods agreed in the contract.",
      },
    ],
    deliverables: [
      "Engineers matched to your stack and stage",
      "Onboarding plan and working agreement",
      "Regular progress reports and demos",
      "Code reviews, tests, and documentation to your standards",
      "Knowledge transfer when the engagement winds down",
    ],
    process: [
      {
        title: "Define needs",
        body: "Clarify the skills, seniority, time zone overlap, and outcomes you need.",
      },
      {
        title: "Match & onboard",
        body: "Introduce engineers, agree on a working rhythm, and get access set up securely.",
      },
      {
        title: "Deliver",
        body: "Engineers work in your sprints with regular check-ins on quality and progress.",
      },
      {
        title: "Review & adjust",
        body: "Periodic reviews to confirm the engagement is working and adjust as you grow.",
      },
    ],
    technologies: ["TypeScript", "React", "Node.js", "Python", "Go", "React Native", "AWS", "CI/CD"],
    faqs: [
      {
        question: "How is this different from hiring freelancers?",
        answer:
          "You get engineers with consistent standards and a studio accountable for quality and continuity, rather than managing individual contractors yourself.",
      },
      {
        question: "What time zones do your engineers work in?",
        answer:
          "We plan engagements around meaningful overlap with U.S. business hours. We'll confirm the specific working hours for your engagement before it starts.",
      },
      {
        question: "Can a dedicated team turn into a full project engagement?",
        answer:
          "Yes. Some clients start with capacity on an existing roadmap and later hand us ownership of a larger initiative, or the other way around.",
      },
    ],
  },
];

export function getServices(): Service[] {
  return services;
}

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export const engagementModels = [
  {
    title: "Fixed-scope project",
    body: "A defined first release with agreed milestones. Best when the scope is clear after discovery.",
    bestFor: "MVPs, defined features, integrations",
  },
  {
    title: "Ongoing product partnership",
    body: "A steady team working through a prioritized roadmap, reviewed together every cycle.",
    bestFor: "Evolving products, post-launch growth",
  },
  {
    title: "Dedicated engineering capacity",
    body: "Engineers who join your team and process, scaling up or down with reasonable notice.",
    bestFor: "Roadmaps that outpace your team",
  },
  {
    title: "Discovery & technical advisory",
    body: "A short, focused engagement to shape scope, review architecture, or plan modernization.",
    bestFor: "Early ideas, second opinions, planning",
  },
];
