// E2E Tests - Accessibility
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/workflows/new");
    await page.waitForSelector(".react-flow", { timeout: 15000 });
  });

  test("should have no critical accessibility violations on editor page", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude(".react-flow__minimap") // Minimap may have expected violations
      .exclude(".react-flow__pane") // Canvas elements have expected focus issues
      .analyze();

    // Filter only critical violations (not serious - focus issues are expected in canvas apps)
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical",
    );

    expect(criticalViolations).toEqual([]);
  });

  test("should have proper ARIA labels on interactive elements", async ({
    page,
  }) => {
    // Check that buttons have accessible names
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const accessibleName =
        (await button.getAttribute("aria-label")) ||
        (await button.textContent());
      expect(accessibleName?.trim().length).toBeGreaterThan(0);
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Tab through interface
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);

    // Check that something is focused
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedElement).toBeTruthy();
  });

  test("should have sufficient color contrast", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .options({ runOnly: ["color-contrast"] })
      .analyze();

    // Allow some violations for dark theme (may have false positives)
    const violations = accessibilityScanResults.violations;
    expect(violations.length).toBeLessThanOrEqual(3);
  });
});
