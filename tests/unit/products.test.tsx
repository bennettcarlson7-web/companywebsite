import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { getProduct, getProducts, isReleased, productsHeading } from "@/content/products";
import { getProjects } from "@/content/projects";
import { DemoActions, ProductCard } from "@/components/products/product-ui";
import { ProductPreview } from "@/components/products/previews";

describe("products content (honesty rules)", () => {
  it("lists the three products in build order", () => {
    expect(getProducts().map((p) => p.name)).toEqual(["ClientFlow AI", "CommercePilot AI", "FieldOps AI"]);
    expect(getProduct("clientflow-ai")?.milestones[0]?.title).toMatch(/inquiry → AI analysis → lead dashboard/i);
  });

  it("shares /work/<slug> with concept projects without slug collisions", () => {
    const slugs = [...getProducts(), ...getProjects()].map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("says 'What We're Building' until a product is actually usable", () => {
    const anyReleased = getProducts().some(isReleased);
    expect(productsHeading("NextMade")).toBe(anyReleased ? "Built by NextMade" : "What We're Building");
  });

  it("only offers a demo or screenshots for products that are released", () => {
    for (const p of getProducts()) {
      if (!isReleased(p)) {
        expect(p.demoUrl, p.name).toBeNull();
        expect(p.screenshots, p.name).toEqual([]);
        expect(p.milestones.some((m) => m.status === "done" && /demo/i.test(m.title)), p.name).toBe(false);
      }
      if (p.demoUrl) expect(p.demoUrl).toMatch(/^https:\/\//);
    }
  });

  it("makes no customer, result, or metric claims", () => {
    const text = JSON.stringify(getProducts());
    expect(text).not.toMatch(/customers? (love|say)|testimonial|trusted by|\d+% (faster|more|less|fewer)|saved \d/i);
  });
});

describe("product UI", () => {
  it("shows no View Demo button without a demo, and offers early access instead", () => {
    const product = getProduct("clientflow-ai")!;
    render(<DemoActions product={product} />);
    expect(screen.queryByRole("link", { name: /view demo/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get early access/i })).toHaveAttribute("href", expect.stringMatching(/^mailto:.*Early%20access/));
    expect(screen.getByText(/demo coming soon/i)).toBeInTheDocument();
  });

  it("shows View Demo once a product has a working demo", () => {
    const product = { ...getProduct("clientflow-ai")!, status: "live" as const, demoUrl: "https://demo.example.com" };
    render(<DemoActions product={product} />);
    expect(screen.getByRole("link", { name: /view demo/i })).toHaveAttribute("href", "https://demo.example.com");
  });

  it("labels the in-code preview as a design preview, never a screenshot", () => {
    const product = getProduct("commercepilot-ai")!;
    render(<ProductPreview product={product} />);
    expect(screen.getByText(/design preview of CommercePilot AI — the product is in development/i)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a product card with status and a link to its page", () => {
    const product = getProduct("fieldops-ai")!;
    render(<ProductCard product={product} />);
    const card = within(screen.getByRole("article", { name: "FieldOps AI" }));
    expect(card.getByRole("link", { name: "FieldOps AI" })).toHaveAttribute("href", "/work/fieldops-ai");
    expect(card.getByText("Planned")).toBeInTheDocument();
    expect(card.getByText("Design preview")).toBeInTheDocument();
  });
});
