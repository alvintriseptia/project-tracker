import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of [
  "/",
  "/projects",
  "/projects/english",
  "/calendar",
  "/reviews/weekly",
  "/missions",
  "/missions/2026-06",
  "/artifacts",
  "/artifacts/new/custom",
  "/settings",
]) {
  test(`has no serious accessibility violations on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      ),
    ).toEqual([]);
  });
}

test("mobile navigation remains available", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.getByRole("link", { name: "Projects" }).last().click();
  await expect(
    page.getByRole("heading", { name: "Build consistency across the work" }),
  ).toBeVisible();
});
