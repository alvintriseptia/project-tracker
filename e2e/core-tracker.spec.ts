import { expect, test } from "@playwright/test";

test.describe("Phase 1 core tracker", () => {
  test("logs, edits, persists, and deletes an activity", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Make today count." }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "ENGLISH Speak or write English for 3 minutes",
      })
      .click();
    await page.getByRole("button", { name: "Complete action" }).click();
    await expect(
      page.getByRole("heading", { name: "Today is non-zero." }),
    ).toBeVisible();
    await expect(page.getByText("2 points · minimum")).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Today is non-zero." }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Edit Speak or write English for 3 minutes",
      })
      .click();
    await page
      .getByRole("textbox", { name: "What did you complete?" })
      .fill("Explain a TypeScript design");
    await page.getByRole("spinbutton", { name: "Bonus points" }).fill("1");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Explain a TypeScript design")).toBeVisible();
    await expect(page.getByText("3 points · minimum")).toBeVisible();

    await page
      .getByRole("button", { name: "Delete Explain a TypeScript design" })
      .click();
    await page.getByRole("button", { name: "Delete activity" }).click();
    await expect(
      page.getByRole("heading", { name: "Make today count." }),
    ).toBeVisible();
  });

  test("customizes, archives, and restores a project", async ({ page }) => {
    await page.goto("/projects/english");
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("spinbutton", { name: "Weekly target" }).fill("7");
    await page.getByRole("button", { name: "Save project" }).click();
    await expect(page.getByText("Weekly target: 7 sessions.")).toBeVisible();

    await page.getByRole("button", { name: "Archive" }).click();
    await page.getByRole("button", { name: "Archive project" }).click();
    await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();
    await page.getByRole("button", { name: "Restore" }).click();
    await expect(page.getByRole("button", { name: "Archive" })).toBeVisible();
  });

  test("downloads a complete JSON backup", async ({ page }) => {
    await page.goto("/settings");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download backup" }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    let json = "";
    for await (const chunk of stream) {
      json += chunk.toString();
    }
    const backup = JSON.parse(json);
    expect(backup.format).toBe("no-zero-backup");
    expect(backup.schemaVersion).toBe(1);
    expect(backup.selection).toEqual({ mode: "full" });
    expect(backup.data.tracks).toHaveLength(6);
    expect(backup.data.settings.id).toBe("app");
  });

  test("reloads and writes while offline", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText("Offline. Local tracking still works.")).toBeVisible();
    await page.getByRole("button", { name: "Quick add" }).click();
    await page
      .getByRole("textbox", { name: "What did you complete?" })
      .fill("Offline action");
    await page.getByRole("button", { name: "Complete action" }).click();
    await expect(page.getByText("Offline action")).toBeVisible();
    await context.setOffline(false);
  });
});
