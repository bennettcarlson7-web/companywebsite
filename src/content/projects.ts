import type { Project } from "@/types/content";

/**
 * Portfolio entries.
 *
 * These are CONCEPT projects: illustrative examples of the kind of work we do, not client
 * engagements. They intentionally contain no client names, outcomes, metrics, or testimonials.
 * When real, client-approved work is available, add it with `kind: "case-study"` and only
 * include facts the client has verified and approved for publication.
 */
export const projects: Project[] = [
  {
    slug: "operations-dashboard",
    title: "Operations Dashboard for a Field Services Business",
    category: "Internal platform",
    kind: "concept",
    visual: "dashboard",
    tags: ["Web App", "Dashboard", "Integrations"],
    summary:
      "A concept for replacing spreadsheets and status calls with one live view of jobs, crews, and invoices.",
    seoDescription:
      "Illustrative concept: an operations dashboard that brings scheduling, job status, and invoicing for a field services business into one web application.",
    scenario:
      "Imagine a regional field services company — think HVAC, landscaping, or facilities maintenance — with a few dozen technicians. Jobs are scheduled in one tool, tracked in a shared spreadsheet, and invoiced in accounting software. Managers spend their mornings on the phone figuring out where things stand.",
    challenge: [
      "Job status is scattered across a scheduling tool, a spreadsheet, and text messages.",
      "Invoices are created by hand from completed jobs, so billing lags and errors creep in.",
      "Managers have no reliable view of crew capacity for the week ahead.",
    ],
    approach: [
      {
        title: "Map the day",
        body: "Shadow dispatchers and managers to document how a job moves from request to paid invoice, and where it stalls.",
      },
      {
        title: "Integrate before replacing",
        body: "Keep the tools people already use where they work well, and connect them through APIs rather than forcing a big switch.",
      },
      {
        title: "Ship the core view first",
        body: "Launch a single live job board for managers, then layer in capacity planning and invoicing automation.",
      },
    ],
    solution: [
      "A web dashboard showing every active job, its crew, status, and blockers in real time.",
      "Two-way sync with the scheduling tool and accounting software, with alerts when a sync fails.",
      "Automatic draft invoices created from completed jobs for a manager to review and send.",
      "A weekly capacity view to spot overbooked crews before it becomes a problem.",
    ],
    features: ["Live job board", "Crew capacity planning", "Draft invoice automation", "Role-based access", "Audit trail"],
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "AWS"],
    considerations: [
      "Integration reliability matters more than features — every sync needs retries and alerts.",
      "Technicians need a simple mobile-friendly view; managers need density. Design both deliberately.",
      "Draft invoices should always be reviewed by a person before sending.",
    ],
    relatedServices: ["custom-software-development", "system-integration-modernization"],
  },
  {
    slug: "mobile-booking-platform",
    title: "Mobile Booking Platform for Independent Studios",
    category: "Consumer mobile app",
    kind: "concept",
    visual: "booking",
    tags: ["Mobile App", "Payments", "Scheduling"],
    summary:
      "A concept for a cross-platform app that lets clients discover classes, book, and pay in a few taps.",
    seoDescription:
      "Illustrative concept: a cross-platform mobile booking app with class discovery, scheduling, and payments for independent fitness and wellness studios.",
    scenario:
      "Imagine a group of independent fitness and wellness studios. Each one uses a different mix of booking widgets and payment links, and clients find the experience clunky on their phones. The studios want a simple, branded app without enterprise-level costs.",
    challenge: [
      "Booking takes too many steps on mobile and clients abandon midway.",
      "Studio owners juggle schedules, waitlists, and payments in separate tools.",
      "Each studio needs its own branding without maintaining a separate app.",
    ],
    approach: [
      {
        title: "Design the three-tap booking",
        body: "Prototype and test the shortest path from opening the app to a confirmed, paid booking.",
      },
      {
        title: "One codebase, many brands",
        body: "Use a cross-platform framework with theming so each studio gets its own look from a shared core.",
      },
      {
        title: "Lean on proven services",
        body: "Use an established payment processor and notification service rather than building those from scratch.",
      },
    ],
    solution: [
      "iOS and Android apps with class discovery, booking, waitlists, and reminders.",
      "Secure checkout through an established payment provider; no card data stored by the app.",
      "A web admin for studio owners to manage schedules, capacity, and instructors.",
      "Per-studio theming and configuration from a single codebase.",
    ],
    features: ["Class discovery & filters", "Booking & waitlists", "Secure payments", "Push reminders", "Studio admin portal"],
    technologies: ["React Native", "Expo", "TypeScript", "Node.js", "PostgreSQL", "Stripe API"],
    considerations: [
      "App store review timelines and privacy disclosures need to be planned into the launch.",
      "Payment and refund policies must be clear in the UI and consistent with each studio's terms.",
      "Accessibility on small screens — touch targets, contrast, dynamic text — is a requirement, not a polish item.",
    ],
    relatedServices: ["web-mobile-applications", "custom-software-development"],
  },
  {
    slug: "ai-knowledge-assistant",
    title: "AI-Assisted Internal Knowledge Assistant",
    category: "AI & automation",
    kind: "concept",
    visual: "assistant",
    tags: ["AI", "Search", "Internal Tool"],
    summary:
      "A concept for helping employees find answers in company documents — with sources cited and access respected.",
    seoDescription:
      "Illustrative concept: an AI-assisted internal knowledge assistant that answers employee questions from company documents with cited sources and permission-aware access.",
    scenario:
      "Imagine a growing professional services firm with years of policies, process guides, and project notes spread across shared drives and wikis. New hires ask the same questions repeatedly, and experienced staff lose time answering them.",
    challenge: [
      "Answers exist, but they're buried across folders, wikis, and outdated documents.",
      "Some documents are confidential and must only be visible to certain teams.",
      "Leadership is interested in AI but concerned about wrong answers and data exposure.",
    ],
    approach: [
      {
        title: "Start with a narrow, high-value scope",
        body: "Begin with HR and operations policies — frequently asked, low-risk, and easy to evaluate.",
      },
      {
        title: "Ground every answer in sources",
        body: "Retrieve relevant passages first and show citations, so people can verify answers in one click.",
      },
      {
        title: "Measure before expanding",
        body: "Build an evaluation set of real questions with expected answers and track quality before adding new content.",
      },
    ],
    solution: [
      "A chat-style assistant inside the tools employees already use.",
      "Answers generated only from approved documents, each with linked citations.",
      "Permission-aware retrieval so people only see content they're allowed to access.",
      "Feedback buttons and an admin view to spot gaps and outdated documents.",
    ],
    features: ["Cited answers", "Permission-aware search", "Feedback loop", "Usage & cost monitoring", "Content freshness alerts"],
    technologies: ["Python", "TypeScript", "LLM APIs", "Vector search", "PostgreSQL", "SSO integration"],
    considerations: [
      "Clear messaging that the assistant can be wrong, with an easy path to a human.",
      "Data handling must follow the firm's policies and the AI provider's business terms.",
      "Ongoing evaluation is part of the product, not a one-time launch task.",
    ],
    relatedServices: ["ai-solutions-automation", "system-integration-modernization"],
  },
];

export function getProjects(): Project[] {
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
