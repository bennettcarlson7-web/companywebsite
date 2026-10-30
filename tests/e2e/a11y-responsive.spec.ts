import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const keyPages = ["/", "/work", "/work/clientflow-ai", "/about", "/careers", "/careers/senior-software-engineer-ai-ml", "/careers/apply?role=talent-recruiter", "/contact", "/privacy"];

test.describe("automated accessibility (axe, WCAG 2.0/2.1/2.2 A & AA rules)", () => {
  for (const path of keyPages) {
    test(`${path} has no axe violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      // Ensure scroll-revealed content is in its final, visible state before scanning contrast.
      await page.evaluate(() => document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => (el.dataset.reveal = "shown")));
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(" ")}`);
      expect(summary).toEqual([]);
    });
  }

  test("form errors are reachable by keyboard and announced", async ({ page }) => {
    await page.goto("/careers/apply");
    await page.getByRole("button", { name: "Submit Application" }).focus();
    await page.keyboard.press("Enter");
    const summary = page.getByRole("alert", { name: /please fix/i });
    await expect(summary).toBeFocused();
    await summary.getByRole("link").first().click();
    await expect(page.getByLabel("Role")).toBeFocused();
  });
});

test.describe("responsive layout at 375 / 768 / 1280 / 1440", () => {
  test.skip(({ isMobile }) => isMobile, "runs once, in the desktop project, across explicit widths");

  for (const width of [375, 768, 1280, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/about", "/careers", "/careers/senior-software-engineer-data-engineering", "/careers/apply", "/contact"]) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});
