import type { FAQ } from "@/types/content";

/**
 * Job content model and the starting roles. Live roles are managed in the admin area and stored in the database
 * (see src/lib/data/jobs.ts); the roles below are only the initial data.
 *
 * Roles the business owner confirmed we are recruiting for (Oct 2026).
 *
 * CONFIRMED: the three titles, that recruiting is active, and (Oct 29, 2026) the terms in `confirmedFacts`:
 * remote worldwide outside the United States, full-time, USD 2,000 per month. The U.S. is excluded on purpose:
 * this pay is below several U.S. state minimum wages and the federal overtime-exempt salary threshold.
 * PROPOSED (owner review): summaries, responsibilities, signals, and skill tags. These are editorial job
 * descriptions, not statements about current employees.
 * CONFIRMED (Oct 31, 2026): the hiring process and working style in `hiringSteps` / `workingStyle` below.
 * UNKNOWN: work authorization and how workers in each country are engaged (local entity, employer of record, or
 * contractor). Never invent these.
 */
export type Job = {
  slug: string;
  title: string;
  shortTitle: string;
  team: string;
  summary: string;
  overview: string[];
  workOn: string[];
  lookingFor: string[];
  niceToHave: string[];
  skills: string[];
  /** Unconfirmed facts. Fill in only with owner-approved values. */
  facts: {
    location: string | null;
    workplace: string | null;
    employmentType: string | null;
    compensation: string | null;
  };
  /**
   * Google JobPosting structured data is emitted only when every field here is real and `eligible` is true.
   * Never fabricate these values.
   */
  posting: {
    eligible: boolean;
    datePosted: string | null;
    validThrough: string | null;
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | null;
    applicantLocationCountry: string | null;
    remote: boolean | null;
  };
};

/** Owner-confirmed terms (Oct 29, 2026), shared by all current roles. */
const confirmedFacts: Job["facts"] = {
  location: "Remote — worldwide (outside the United States)",
  workplace: "Remote",
  employmentType: "Full-time",
  compensation: "USD 2,000 per month",
};
const notPostable: Job["posting"] = {
  eligible: false,
  datePosted: null,
  validThrough: null,
  employmentType: null,
  applicantLocationCountry: null,
  remote: null,
};

/**
 * Starting data for the job board. Live roles are managed in the admin area (`/admin/roles`) and stored in the
 * database; read them through `src/lib/data/jobs.ts`, not from here.
 */
export const seedJobs: Job[] = [
  {
    slug: "senior-software-engineer-ai-ml",
    title: "Senior Software Engineer — AI/ML",
    shortTitle: "AI/ML Engineer",
    team: "Engineering",
    summary:
      "Help build production software with practical AI and machine learning capabilities. Work across the application lifecycle, from defining the right user problem to making AI-powered features observable, secure, and useful.",
    overview: [
      "Our clients come to us with real problems: support queues that never shrink, documents nobody has time to read, decisions made on gut feel because the data is scattered. Some of those problems are good fits for machine learning or large language models. Many aren't. We need an engineer who can tell the difference and build the ones that are.",
      "You'll take AI features from a rough idea to something people rely on — scoping the problem with clients, choosing the simplest approach that works, building evaluation in from the start, and making sure the system behaves sensibly when the model is wrong.",
    ],
    workOn: [
      "Design and ship AI-powered features inside production web applications and internal tools.",
      "Integrate LLM and ML services where they're the right fit — and recommend simpler approaches where they aren't.",
      "Build AI agents that take actions in business systems through permissioned tools, with human approval where the stakes call for it.",
      "Build evaluation sets and quality checks so we can measure accuracy before launch and catch regressions after.",
      "Add monitoring for quality, latency, and cost, and make failure modes visible to the people using the system.",
      "Handle data and privacy concerns deliberately: what gets sent to which provider, what's retained, and who can see it.",
      "Build and integrate the APIs and services around AI components, not just the model calls.",
      "Work directly with clients and teammates to define problems, review designs, and test changes.",
    ],
    lookingFor: [
      "Substantial experience building and operating production software, owning features end to end.",
      "Strong proficiency in Python or a comparable backend language, plus comfort working across a web stack.",
      "Hands-on experience shipping ML or LLM-powered functionality that real users depended on.",
      "Good habits around automated testing, observability, and incident follow-up.",
      "Sound judgment about AI failure modes — hallucination, drift, bias, prompt injection — and how to design around them.",
      "Clear written communication with both engineers and nontechnical stakeholders.",
    ],
    niceToHave: [
      "Experience with a major cloud platform (AWS, Google Cloud, or Azure).",
      "Retrieval-augmented generation (RAG), vector search, or document-processing pipelines.",
      "Agent frameworks, tool calling, or the Model Context Protocol (MCP).",
      "MLOps practices: model versioning, deployment pipelines, or feature stores.",
      "Client-facing or consulting experience.",
    ],
    skills: ["Python", "LLM applications", "AI agents", "Machine learning", "Evaluation", "APIs", "Observability"],
    facts: confirmedFacts,
    posting: notPostable,
  },
  {
    slug: "senior-software-engineer-data-engineering",
    title: "Senior Software Engineer — Data Engineering",
    shortTitle: "Data Engineer",
    team: "Engineering",
    summary:
      "Design reliable data foundations that make products, reporting, and AI systems trustworthy.",
    overview: [
      "Almost every project we take on depends on data being correct: an operations dashboard that managers trust, an integration that keeps billing and CRM in sync, an AI feature that answers from the right documents. When the data is wrong, everything built on it is wrong too.",
      "You'll design and build the pipelines, models, and checks that keep data accurate and available — and you'll work closely with application and AI engineers so the data layer fits how the product actually uses it.",
    ],
    workOn: [
      "Build ingestion from APIs, databases, files, and event streams into well-structured storage.",
      "Write and maintain SQL and Python transformations that are tested, documented, and easy to change.",
      "Design data models that serve product features, reporting, and AI use cases without duplicating truth.",
      "Prepare curated, documented datasets that AI features can retrieve from safely, with lineage and access rules.",
      "Put data-quality checks, freshness monitoring, and alerting in place so problems surface before users notice.",
      "Integrate business systems such as CRMs, billing, and operations tools, and keep them in sync reliably.",
      "Apply sensible privacy and access controls to sensitive data.",
      "Partner with software and AI engineers on schemas, contracts, and performance.",
    ],
    lookingFor: [
      "Experience building and operating production data systems that other teams depended on.",
      "Strong SQL, including data modeling and query performance tuning.",
      "Proficiency in Python or an equivalent language for pipelines and tooling.",
      "A track record of debugging reliability and performance problems in data workflows.",
      "Care about correctness: testing transformations, documenting assumptions, and communicating data caveats.",
      "Clear communication with engineers and with business stakeholders who use the data.",
    ],
    niceToHave: [
      "Cloud data warehouses such as Snowflake, BigQuery, Redshift, or Postgres at scale.",
      "Orchestration tools such as Airflow, Dagster, or Prefect, or transformation tools such as dbt.",
      "Streaming or event-driven systems such as Kafka or Kinesis.",
      "Supporting analytics or machine learning teams.",
    ],
    skills: ["SQL", "Python", "Data modeling", "Pipelines", "Data quality", "Integrations"],
    facts: confirmedFacts,
    posting: notPostable,
  },
  {
    slug: "talent-recruiter",
    title: "Talent Recruiter",
    shortTitle: "Talent Recruiter",
    team: "Operations",
    summary:
      "Help us identify, engage, and hire thoughtful technologists while creating a respectful candidate experience.",
    overview: [
      "We're a small team, and every hire changes how we work. We need someone who can find experienced engineers, understand what a role actually requires, and run a hiring process that candidates describe as clear and respectful — whether or not they get an offer.",
      "You'll work closely with leadership to shape roles, build pipelines, and keep the process organized and fair.",
    ],
    workOn: [
      "Source experienced software, AI/ML, and data engineers through thoughtful, personalized outreach.",
      "Calibrate roles with leadership: what the work is, what good looks like, and what's truly required.",
      "Run structured screening conversations and share concise, evidence-based summaries.",
      "Keep pipelines organized and candidates informed at every stage.",
      "Coordinate interview scheduling across time zones.",
      "Help build inclusive hiring practices, from job descriptions to interview structure.",
      "Track talent markets for AI, data, and software roles across the U.S., and keep postings compliant with state pay-transparency rules.",
      "Maintain clean, accurate applicant records and handle candidate data with care.",
    ],
    lookingFor: [
      "Experience recruiting technical talent, or equivalent experience in a closely related role.",
      "Excellent written communication — outreach people actually want to reply to.",
      "Comfort with structured assessment: consistent questions, clear criteria, written notes.",
      "Strong relationship-building with candidates and hiring managers.",
      "Organization and follow-through across many conversations at once.",
      "Respect for candidate privacy and confidentiality.",
    ],
    niceToHave: [
      "Familiarity with software engineering roles and terminology.",
      "Experience with an applicant tracking system (ATS).",
      "Experience hiring for an early-stage company.",
    ],
    skills: ["Technical sourcing", "Structured interviews", "Candidate experience", "ATS", "Communication"],
    facts: confirmedFacts,
    posting: notPostable,
  },
];

/** Owner-confirmed defaults offered when posting a new role in the admin. */
export const defaultJobFacts = confirmedFacts;
export const defaultJobPosting = notPostable;

/** True when a role's location says it isn't open to candidates in the United States. */
export const excludesUS = (job: Pick<Job, "facts">) => /outside the United States/i.test(job.facts.location ?? "");

export function applyHref(slug?: string): string {
  return slug ? `/careers/apply?role=${encodeURIComponent(slug)}` : "/careers/apply";
}

/** Shown wherever an unconfirmed job fact would go. */
export const UNCONFIRMED_DETAIL = "Shared during the hiring process";

export const engineeringValues = [
  { title: "Thoughtful product decisions", body: "We start with the problem and the people who have it, then choose the simplest approach that works." },
  { title: "Ownership", body: "Engineers own features from scoping through monitoring in production — not just the ticket in front of them." },
  { title: "Code quality that lasts", body: "Readable code, real tests, and documentation, because someone (often us) will change this later." },
  { title: "Pragmatic AI", body: "We use AI where it measurably helps, evaluate it honestly, and design for the times it's wrong." },
  { title: "Reliable data", body: "Correct, well-modeled data is the foundation for every dashboard, integration, and model we build." },
  { title: "Clear communication", body: "We write things down, share context generously, and raise risks early." },
];

/**
 * Careers page copy, supplied by the business owner (Oct 31, 2026; no team-size number): remote and flexible working with
 * required U.S.-hours overlap, and the hiring process (apply → one interview with a live exercise → decision).
 */
export const careersPerks = [
  {
    title: "Small Team, Meaningful Impact",
    body: "As a small team, your ideas and contributions don't get lost in layers of management.",
  },
  {
    title: "Flexibility That Works",
    body: "We work remotely with flexible schedules and shared collaboration time during U.S. working hours.",
  },
  {
    title: "Take Ownership",
    body: "We value people who think independently, communicate openly, and take responsibility for the work they do.",
  },
  {
    title: "Grow With Us",
    body: "As our team grows, we want people who are excited to learn, contribute new ideas, and help shape what we build next.",
  },
];

export const workingStyle = [
  { title: "Fully Remote", body: "Work from anywhere" },
  { title: "Flexible Hours", body: "Manage your own schedule" },
  { title: "U.S. Overlap", body: "Collaborate during U.S. working hours" },
];

export const hiringSteps = [
  { title: "Apply", body: "Find a role that fits your experience and submit your application." },
  {
    title: "One Interview",
    body: "A friendly conversation about your background and problem-solving approach, plus a practical live exercise relevant to the role.",
  },
  { title: "Next Steps", body: "We'll review the results and communicate our decision." },
];

export const candidateFaqs: FAQ[] = [
  {
    question: "What do the roles pay, and who can apply?",
    answer:
      "Pay and location eligibility are set for each role and shown on its card and role page — for example, whether it's open to candidates in your country. Our roles are remote and full-time unless the role page says otherwise.",
  },
  {
    question: "What are the working hours?",
    answer:
      "Schedules are flexible, with required overlap during U.S. working hours so the team can collaborate. We'll talk through how that fits your time zone during the interview.",
  },
  {
    question: "How is the contract set up?",
    answer:
      "How the engagement is set up in your country is discussed during the hiring process, and all terms are confirmed in writing before any offer. If anything is a deal-breaker for you, mention it in your application.",
  },
  {
    question: "What does the hiring process look like?",
    answer:
      "You apply, then we hold one interview: a conversation about your background, experience, and approach to problems, plus a practical live exercise relevant to the role. After that, we review the results and tell you our decision. No endless interview rounds.",
  },
  {
    question: "What does the application involve?",
    answer:
      "A short form: your name, email, phone, location, LinkedIn profile, the role, and your résumé (PDF or Word, up to 3 MB). You can also add a link to a 1–2 minute introduction video, a portfolio or GitHub link, and, if you wish, voluntarily share your gender and age range. No cover letter required.",
  },
  {
    question: "Will I hear back?",
    answer:
      "A person on our team reads every application. If your experience fits the role, we'll invite you to the interview. We aim to reply to everyone, but we can't promise a timeline.",
  },
  {
    question: "Can I apply if I don't meet every listed qualification?",
    answer:
      "Yes. The lists describe what we think the work needs, not a checklist. If you have relevant experience and the work interests you, tell us why.",
  },
  {
    question: "How is my information used?",
    answer:
      "Only to evaluate your application and contact you about it. You can ask us to delete it at any time — see the Privacy Policy for details.",
  },
];
