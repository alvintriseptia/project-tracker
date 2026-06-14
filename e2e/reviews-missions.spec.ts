import { expect, test } from "@playwright/test";

test.describe("Phase 2 reviews and missions", () => {
  test("creates, filters, archives, and restores an artifact with activity", async ({ page }) => {
    await page.goto("/artifacts/new/custom");
    await page.getByRole("textbox", { name: "Title" }).fill("Phase 2 evidence");
    await page.getByRole("combobox", { name: "Project" }).selectOption("english");
    await page.getByRole("textbox", { name: "Content" }).fill("Built artifacts and missions");
    await page.getByRole("checkbox", { name: /Also count as an activity/ }).check();
    await page.getByRole("button", { name: "Create artifact" }).click();
    await expect(page.getByRole("heading", { name: "Phase 2 evidence" })).toBeVisible();
    await page.getByRole("button", { name: "Archive" }).click();
    await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();
    await page.getByRole("button", { name: "Restore" }).click();
    await expect(page.getByText("Artifact restored.")).toBeVisible();

    await page.goto("/artifacts");
    await page.getByRole("textbox", { name: "Search artifacts" }).fill("Phase 2");
    await expect(page.getByRole("heading", { name: "Phase 2 evidence" })).toBeVisible();
    await page.getByRole("combobox", { name: "Project" }).selectOption("english");
    await page.getByLabel("From").fill("2026-06-01");
    await expect(page.getByRole("heading", { name: "Phase 2 evidence" })).toBeVisible();

    await page.goto("/artifacts/new/custom");
    await page.getByRole("textbox", { name: "Title" }).fill("Linked evidence");
    await page.getByRole("checkbox", { name: /Phase 2 evidence/ }).check();
    await page.getByRole("button", { name: "Create artifact" }).click();
    await expect(page.getByRole("heading", { name: "Linked evidence" })).toBeVisible();
    await page.goto("/");
    await expect(page.getByText("Phase 2 evidence")).toBeVisible();
  });

  test("saves current week as draft and completes a prior week", async ({ page }) => {
    await page.goto("/reviews/weekly");
    await page.getByRole("textbox", { name: "What went well?" }).fill("Shipped the review flow");
    await expect(page.getByRole("button", { name: "Complete review" })).toBeDisabled();
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Weekly review draft saved.", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Previous week" }).click();
    await page.getByRole("textbox", { name: "What went well?" }).fill("Built the foundation");
    await expect(page.getByRole("button", { name: "Complete review" })).toBeEnabled();
    await page.getByRole("button", { name: "Complete review" }).click();
    await expect(page.getByText("Weekly review completed.", { exact: true })).toBeVisible();
  });

  test("updates mission progress and saves a linked monthly review", async ({ page }) => {
    await page.goto("/artifacts/new/custom");
    await page.getByRole("textbox", { name: "Title" }).fill("Mission target");
    await page.getByRole("button", { name: "Create artifact" }).click();
    await expect(page.getByRole("heading", { name: "Mission target" })).toBeVisible();

    await page.goto("/missions/2026-06");
    await page.getByRole("checkbox", { name: "App initialized" }).click();
    await page.getByRole("textbox", { name: "Theme" }).fill("Ship the foundation");
    const firstChecklistItem = page.getByRole("textbox", { name: "Checklist item 1" });
    await firstChecklistItem.fill("Application initialized");
    await firstChecklistItem.press("Tab");
    await page.getByRole("button", { name: "Move Application initialized down" }).click();
    const missionTarget = page.getByRole("checkbox", { name: /Mission target/ });
    await missionTarget.click();
    await expect(missionTarget).toBeChecked();
    await expect(page.getByText("17%")).toBeVisible();
    await page.getByRole("button", { name: "Write monthly review" }).click();
    await page.getByRole("textbox", { name: "Major progress" }).fill("Built the system");
    await page.getByRole("textbox", { name: "Main lesson" }).fill("Keep slices small");
    await page.getByRole("combobox", { name: "Strongest project" }).selectOption("english");
    await page.getByRole("combobox", { name: "Weakest project" }).selectOption("korean");
    await page.getByRole("combobox", { name: "Best artifact" }).selectOption({ label: "Mission target" });
    await page.getByRole("button", { name: "Save review" }).click();
    await expect(page.getByRole("button", { name: "Edit monthly review" })).toBeVisible();
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("unfinished checklist items");
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "Complete mission" }).click();
    await expect(page.getByRole("button", { name: "Complete mission" })).toBeVisible();
  });

  test("shows calendar states and adds activity for a selected day", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.getByRole("button", { name: /2026-06-14/ })).toBeVisible();
    await page.getByRole("button", { name: /2026-06-14/ }).click();
    await page.getByRole("button", { name: "Add activity for this date" }).click();
    await page.getByRole("textbox", { name: "What did you complete?" }).fill("Backfilled reflection");
    await page.getByRole("button", { name: "Complete action" }).click();
    await expect(page.getByRole("button", { name: /2026-06-14, active/ })).toBeVisible();
  });

  test("creates an artifact and updates a mission offline", async ({ page, context }) => {
    await page.goto("/artifacts");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    await page.goto("/artifacts/new/custom");
    await page.getByRole("textbox", { name: "Title" }).fill("Offline evidence");
    await page.getByRole("button", { name: "Create artifact" }).click();
    await expect(page.getByRole("heading", { name: "Offline evidence" })).toBeVisible();
    await page.goto("/missions/2026-06");
    await page.getByRole("checkbox", { name: "App initialized" }).click();
    await expect(page.getByText("17%")).toBeVisible();
    await context.setOffline(false);
  });
});
