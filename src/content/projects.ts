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
    slug: "ai-intake-follow-up-agent",
    title: "AI Agent for Client Intake & Follow-Up",
    category: "AI agents & automation",
    kind: "concept",
    visual: "assistant",
    tags: ["AI Agent", "Automation", "CRM Integration"],
    summary:
      "A concept for an AI agent that qualifies new inquiries, drafts replies, and books follow-ups — with a person approving every message.",
    seoDescription:
      "Illustrative concept: an AI agent that triages inbound client inquiries, drafts personalized follow-ups, and updates the CRM, with human approval and audit logs.",
    scenario:
      "Imagine a growing professional services firm — a clinic group, a real estate brokerage, or a regional law practice — that gets inquiries from web forms, email, and phone messages. Good leads wait days for a reply because staff triage everything by hand, and details get lost between the inbox and the CRM.",
    challenge: [
      "Inquiries arrive in several channels and are triaged by hand, so response times vary from hours to days.",
      "Staff retype the same details into the CRM and calendar, and follow-ups slip.",
      "The firm wants AI help but can't risk an automated message that is wrong, off-brand, or shares private data.",
    ],
    approach: [
      {
        title: "Automate one workflow end to end",
        body: "Start with a single, measurable path — new inquiry to booked consultation — before adding channels or tasks.",
      },
      {
        title: "Human in the loop by design",
        body: "The agent drafts and proposes; a person approves anything sent to a client. Autonomy is widened only where evaluation shows it's safe.",
      },
      {
        title: "Tools, not free rein",
        body: "Give the agent a small set of permissioned actions (read inquiry, look up CRM record, propose time slots) with every call logged.",
      },
    ],
    solution: [
      "An agent that classifies each inquiry, extracts key details, and flags urgent or sensitive requests for a person.",
      "Draft replies in the firm's tone, queued for one-click approval or edit.",
      "CRM and calendar updates through their APIs, with retries and an audit trail of every action.",
      "An evaluation set of real (anonymized) inquiries to measure accuracy before and after each change.",
    ],
    features: ["Inquiry triage", "Approval queue", "CRM & calendar sync", "Action audit log", "Quality evaluations"],
    technologies: ["TypeScript", "Python", "LLM APIs", "Tool calling", "PostgreSQL", "CRM APIs"],
    considerations: [
      "Regulated industries (health, legal, finance) need strict limits on what data reaches the model and what the agent may say.",
      "Clear disclosure when a message was drafted with AI, and an easy path to a person.",
      "Model cost and latency are monitored per workflow, not just per month.",
    ],
    relatedServices: ["ai-solutions-automation", "system-integration-modernization"],
  },
  {
    slug: "ai-ready-data-platform",
    title: "AI-Ready Data Platform for an Operations-Heavy Business",
    category: "Data engineering",
    kind: "concept",
    visual: "dashboard",
    tags: ["Data Engineering", "Pipelines", "Analytics"],
    summary:
      "A concept for turning scattered operational data into one trusted, governed source for reporting and AI.",
    seoDescription:
      "Illustrative concept: a governed data platform that consolidates operational, finance, and sensor data into reliable pipelines for analytics and AI use cases.",
    scenario:
      "Imagine a mid-sized company with field operations — energy services, logistics, or manufacturing — whose data lives in an ERP, spreadsheets, a maintenance system, and equipment telemetry. Leadership wants forecasting and AI assistants, but every report starts with a week of manual data cleanup.",
    challenge: [
      "The same metric has different values in different reports, so nobody trusts the numbers.",
      "Data is exported by hand from several systems, and pipelines break silently.",
      "AI projects stall because the underlying data is incomplete, undocumented, or not permissioned.",
    ],
    approach: [
      {
        title: "Define the metrics that matter",
        body: "Agree on a short list of business definitions with the people who use them before moving any data.",
      },
      {
        title: "Reliable pipelines first",
        body: "Automate ingestion with tests, freshness checks, and alerts so problems surface before reports do.",
      },
      {
        title: "Governance built in",
        body: "Document datasets, track lineage, and apply access rules once, so analytics and AI use the same trusted source.",
      },
    ],
    solution: [
      "Automated ingestion from the ERP, maintenance system, spreadsheets, and telemetry into a central warehouse.",
      "Tested, versioned transformations that produce documented business metrics.",
      "Dashboards built on those shared definitions, plus curated datasets ready for forecasting and AI retrieval.",
      "Monitoring for data freshness, volume anomalies, and pipeline failures.",
    ],
    features: ["Automated ingestion", "Tested transformations", "Data catalog & lineage", "Freshness alerts", "Role-based access"],
    technologies: ["Python", "SQL", "dbt", "Cloud data warehouse", "Orchestration", "Streaming ingestion"],
    considerations: [
      "Start with the metrics leadership already argues about — that's where trust pays off fastest.",
      "Sensitive financial and personnel data needs access controls before it reaches any AI tool.",
      "Warehouse and compute costs should be monitored from day one.",
    ],
    relatedServices: ["system-integration-modernization", "ai-solutions-automation"],
  },
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
