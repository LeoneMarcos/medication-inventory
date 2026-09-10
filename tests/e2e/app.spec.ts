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
