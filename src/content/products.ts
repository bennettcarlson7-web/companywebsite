/**
 * NextMade's own products, shown on the Work page (/work, with a page each at /work/<slug>) and on the homepage.
 *
 * Source: the owner's product plan (Oct 31, 2026) — three AI MVPs built in order: ClientFlow AI first (starting
 * with inquiry → AI analysis → lead dashboard), then CommercePilot AI, then FieldOps AI.
 *
 * HONESTY RULES (enforced by tests/unit/products.test.ts):
 * - A product is presented as built only when `status` is "beta" or "live". Until then the section is titled
 *   "What We're Building" and each product shows its development status.
 * - `demoUrl` is set only when a working demo exists; the "View Demo" button appears only then.
 * - `screenshots` holds only real screenshots of the running product. Until there are some, the page shows a
 *   design preview drawn in code, clearly labeled as such.
 * - No customers, metrics, results, or testimonials until they are real and approved.
 * - `stack` is the planned technology; update it to what was actually used once built.
 */

export type ProductStatus = "planned" | "up-next" | "in-development" | "beta" | "live";
export type MilestoneStatus = "done" | "in-progress" | "next" | "planned";

export type Product = {
  slug: string;
  name: string;
  /** Short category line, e.g. "Client operations automation". */
  category: string;
  /** One sentence: what it does. */
  summary: string;
  seoDescription: string;
  problem: { title: string; points: string[] };
  solution: { title: string; body: string };
  /** The end-to-end workflow, in order. */
  workflow: { title: string; body: string }[];
  features: { title: string; body: string }[];
  stack: string[];
  milestones: { title: string; body: string; status: MilestoneStatus }[];
  status: ProductStatus;
  demoUrl: string | null;
  /** Real screenshots only, as files in /public (e.g. "/products/clientflow-leads.png"). */
  screenshots: { src: string; alt: string; width: number; height: number }[];
  /** Which in-code design preview to show until real screenshots exist. */
  preview: "clientflow" | "commercepilot" | "fieldops";
};

export const statusLabels: Record<ProductStatus, string> = {
  planned: "Planned",
  "up-next": "Up next",
  "in-development": "In development",
  beta: "Beta",
  live: "Live",
};

export const milestoneLabels: Record<MilestoneStatus, string> = {
  done: "Done",
  "in-progress": "In progress",
  next: "Next",
  planned: "Planned",
};

export const products: Product[] = [
  {
    slug: "clientflow-ai",
    name: "ClientFlow AI",
    category: "Client operations automation",
    summary: "Automates client inquiries, proposals, onboarding, and project tracking — from first message to delivered project.",
    seoDescription:
      "ClientFlow AI, in development by NextMade: AI-assisted client operations — inquiry analysis, lead pipeline, proposals, onboarding, payments, and project tracking.",
    problem: {
      title: "Client work gets lost between the inbox and the project",
      points: [
        "Inquiries arrive by email and web forms, and good leads wait days for a reply.",
        "Every proposal is rebuilt by hand from old documents.",
        "Onboarding lives in checklists and spreadsheets, so steps get missed.",
        "Clients ask for status updates that someone has to compile manually.",
      ],
    },
    solution: {
      title: "One workspace from first inquiry to delivered project",
      body: "ClientFlow AI captures every inquiry, uses AI to summarize it and highlight budget, timeline, and fit, and puts it on a lead dashboard. From there the team drafts a proposal, onboards the client, collects payment, and tracks the project — with a person approving anything a client will see.",
    },
    workflow: [
      { title: "Capture", body: "Inquiries from web forms and email land in one place." },
      { title: "AI analysis", body: "Each inquiry is summarized and tagged with service, budget, timeline, and fit." },
      { title: "Lead dashboard", body: "A pipeline board shows every lead and what to do next." },
      { title: "Proposal", body: "Draft a proposal from templates and the inquiry details, then review and send." },
      { title: "Onboarding & payment", body: "A guided checklist, agreement, and deposit payment in one flow." },
      { title: "Project tracking", body: "Milestones and client updates, generated from the project's real status." },
    ],
    features: [
      { title: "AI inquiry analysis", body: "Summaries, key details, and a suggested next step for every inquiry." },
      { title: "Lead pipeline", body: "Kanban and table views with stages from new inquiry to won." },
      { title: "Proposal builder", body: "Reusable sections and pricing, drafted from the conversation so far." },
      { title: "Client onboarding", body: "Checklists, documents, and kickoff scheduling in one place." },
      { title: "Payments & invoices", body: "Deposits and invoices with online payment." },
      { title: "Human approval", body: "AI drafts; a person approves every client-facing message." },
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "LLM APIs", "Stripe", "Transactional email"],
    milestones: [
      { title: "Inquiry → AI analysis → lead dashboard", body: "The core workflow, end to end.", status: "in-progress" },
      { title: "Proposals, onboarding & payments", body: "Completing the path from lead to paying client.", status: "next" },
      { title: "Public demo, screenshots & case study", body: "A working demo anyone can try.", status: "planned" },
    ],
    status: "in-development",
    demoUrl: null,
    screenshots: [],
    preview: "clientflow",
  },
  {
    slug: "commercepilot-ai",
    name: "CommercePilot AI",
    category: "AI customer support for e-commerce",
    summary: "Automates e-commerce customer support with AI that understands your store, connected to Shopify.",
    seoDescription:
      "CommercePilot AI, planned by NextMade: AI customer support for Shopify stores — order-aware replies, suggested resolutions, and refund workflows with human approval.",
    problem: {
      title: "Support teams answer the same questions all day",
      points: [
        "“Where is my order?”, returns, and refunds make up most tickets.",
        "Agents switch between the helpdesk and the store admin to find each order.",
        "Response times slip during sales and holidays, when customers care most.",
      ],
    },
    solution: {
      title: "A support inbox that already knows the order",
      body: "CommercePilot AI connects to Shopify, sorts incoming tickets, looks up the customer's order, and drafts an accurate reply based on your policies. Routine questions get fast answers; refunds and sensitive cases go to a person with the context ready.",
    },
    workflow: [
      { title: "Ticket arrives", body: "Email and chat messages land in one inbox." },
      { title: "Classify & look up", body: "AI identifies the request and pulls the order from Shopify." },
      { title: "Draft & suggest", body: "A reply and resolution steps are drafted from your policies." },
      { title: "Approve & resolve", body: "An agent approves, edits, or escalates — refunds always need a person." },
    ],
    features: [
      { title: "Unified support inbox", body: "Every ticket with status, category, and priority." },
      { title: "Shopify order lookup", body: "Order, shipping, and customer details beside each ticket." },
      { title: "AI-drafted replies", body: "Grounded in your policies, with a confidence score." },
      { title: "Suggested resolutions", body: "Step-by-step actions and knowledge-base references." },
      { title: "Refund & return workflows", body: "Guided, with approval before money moves." },
      { title: "Support analytics", body: "Response times and ticket trends by category." },
    ],
    stack: ["Next.js", "TypeScript", "Shopify Admin API", "Webhooks", "PostgreSQL", "LLM APIs", "Vector search"],
    milestones: [
      { title: "Shopify integration & support inbox", body: "Tickets with live order context.", status: "planned" },
      { title: "AI replies & knowledge base", body: "Drafted answers grounded in store policies.", status: "planned" },
      { title: "Public demo", body: "A demo store anyone can try.", status: "planned" },
    ],
    status: "up-next",
    demoUrl: null,
    screenshots: [],
    preview: "commercepilot",
  },
  {
    slug: "fieldops-ai",
    name: "FieldOps AI",
    category: "Smart field operations",
    summary: "Manages field service bookings, scheduling, workers, and invoices — from the office to the job site.",
    seoDescription:
      "FieldOps AI, planned by NextMade: field service management — online booking, AI-assisted scheduling and dispatch, a technician app, and invoicing.",
    problem: {
      title: "Scheduling field work by phone and whiteboard doesn't scale",
      points: [
        "Bookings come in by phone and are copied onto a calendar by hand.",
        "Technicians get double-booked or sent across town between jobs.",
        "Job notes stay on paper, and invoices go out days after the work is done.",
      ],
    },
    solution: {
      title: "Bookings, dispatch, and invoices in one system",
      body: "FieldOps AI takes bookings online, suggests the best technician for each job based on skills, location, and availability, and gives the team a live dispatch board. Technicians see their day on their phone, record the work, and the invoice is ready when the job is done.",
    },
    workflow: [
      { title: "Booking", body: "Customers book online or the office adds the job." },
      { title: "Smart scheduling", body: "AI suggests who should take each job and when." },
      { title: "Dispatch", body: "A live board shows every technician's day." },
      { title: "On the job", body: "Technicians update status, notes, and photos from their phone." },
      { title: "Invoice", body: "Completed work turns into an invoice, ready to pay online." },
    ],
    features: [
      { title: "Online booking", body: "Customers choose a service and an available time." },
      { title: "Dispatch calendar", body: "Drag-and-drop scheduling across your whole team." },
      { title: "AI scheduling suggestions", body: "Assignments based on skills, travel, and availability." },
      { title: "Technician mobile app", body: "Today's jobs, directions, notes, and photos." },
      { title: "Worker management", body: "Skills, shifts, and time off in one place." },
      { title: "Invoicing & payments", body: "Invoices created from completed jobs." },
    ],
    stack: ["Next.js", "React Native", "TypeScript", "PostgreSQL", "Maps & routing APIs", "Stripe", "LLM APIs"],
    milestones: [
      { title: "Booking & dispatch board", body: "Jobs, technicians, and the schedule.", status: "planned" },
      { title: "Technician app & invoicing", body: "From job site to paid invoice.", status: "planned" },
      { title: "Public demo", body: "A working demo anyone can try.", status: "planned" },
    ],
    status: "planned",
    demoUrl: null,
    screenshots: [],
    preview: "fieldops",
  },
];

export function getProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const isReleased = (p: Product) => p.status === "beta" || p.status === "live";

/** "Built by NextMade" only once something is actually usable; until then, "What We're Building". */
export function productsHeading(brand: string): string {
  return products.some(isReleased) ? `Built by ${brand}` : "What We're Building";
}

export const productsIntro = "Real products. Practical engineering. Solutions designed around business problems.";

/** How we build our own products — the same process we use for clients. */
export const productProcess = [
  { title: "Start from a real workflow", body: "Each product begins with one business process that costs teams real time today." },
  { title: "Ship the core first", body: "We build the narrowest version that works end to end, then add to it." },
  { title: "Test AI before trusting it", body: "AI features are measured against real examples before launch, with a person in the loop." },
  { title: "Show the real thing", body: "When it works, we publish a live demo, screenshots, and what we learned." },
];
