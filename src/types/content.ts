import type { ComponentType } from "react";

export type IconName =
  | "code"
  | "smartphone"
  | "sparkles"
  | "plug"
  | "users"
  | "layout"
  | "compass"
  | "pen"
  | "rocket"
  | "trending"
  | "shield"
  | "message"
  | "layers"
  | "gauge";

export type FAQ = {
  question: string;
  answer: string;
};

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  icon: IconName;
  /** One sentence for cards. */
  summary: string;
  /** Short paragraph for the detail page hero. */
  intro: string;
  seoTitle: string;
  seoDescription: string;
  idealFor: string[];
  problems: { title: string; body: string }[];
  benefits: { title: string; body: string }[];
  deliverables: string[];
  process: { title: string; body: string }[];
  technologies: string[];
  faqs: FAQ[];
};

export type ProjectVisualVariant = "dashboard" | "booking" | "assistant";

export type Project = {
  slug: string;
  title: string;
  category: string;
  /** Every entry is a concept until replaced with verified, approved client work. */
  kind: "concept" | "case-study";
  visual: ProjectVisualVariant;
  tags: string[];
  summary: string;
  seoDescription: string;
  scenario: string;
  challenge: string[];
  approach: { title: string; body: string }[];
  solution: string[];
  features: string[];
  technologies: string[];
  considerations: string[];
  relatedServices: string[];
};

export type ProcessStep = {
  number: string;
  title: string;
  summary: string;
  details: string;
  activities: string[];
  outputs: string[];
  icon: IconName;
};

export type ArticleMeta = {
  title: string;
  description: string;
  /** ISO date, e.g. "2026-10-20". */
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingMinutes: number;
  tags: string[];
};

export type Article = ArticleMeta & {
  slug: string;
  Content: ComponentType;
};
