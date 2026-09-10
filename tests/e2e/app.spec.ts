import { expect, test } from "@playwright/test";

test("opens the medication creation flow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Stock, thoughtfully organized.",
      level: 1,
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Add medication" }).click();
  await expect(
    page.getByRole("dialog", { name: "Add medication" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(
    page.getByRole("dialog", { name: "Add medication" }),
  ).toBeHidden();
});

test("saves inventory as JSON backup and hides Export CSV", async ({
  page,
}) => {
  await page.goto("/");

  // Verify Export CSV is not in the visible UI
  await expect(page.getByRole("button", { name: "Export CSV" })).toBeHidden();

  // Trigger Backup download via Save backup
  const downloadJsonPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save backup" }).click();
  const jsonDownload = await downloadJsonPromise;
  expect(jsonDownload.suggestedFilename()).toMatch(
    /medication-inventory-backup-.*\.json/,
  );
  await expect(page.getByText("Backup file downloaded.")).toBeVisible();
});

test("restores inventory from backup file after confirmation", async ({
  page,
}) => {
  await page.goto("/");

  const backupData = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    medications: [
      {
        id: "e2e-med-1",
        name: "E2E Restored Amoxicillin",
        batch: "E2E-BATCH-100",
        manufacturer: "E2E Pharma",
        quantity: 42,
        minimumStock: 10,
        expirationDate: "2027-12-31",
      },
    ],
  };

  // Upload backup file
  await page.setInputFiles("input[type='file']", {
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backupData)),
  });

  // Confirmation modal appears
  await expect(
    page.getByRole("dialog", { name: "Restore backup?" }),
  ).toBeVisible();

  // Confirm restore
  await page.getByRole("button", { name: "Restore inventory" }).click();

  // Modal closes and restored medication appears in table
  await expect(
    page.getByRole("dialog", { name: "Restore backup?" }),
  ).toBeHidden();
  await expect(page.getByText("E2E Restored Amoxicillin")).toBeVisible();
  await expect(
    page.getByText("Inventory restored successfully (1 medication)."),
  ).toBeVisible();
});
