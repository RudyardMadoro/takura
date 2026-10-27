import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('published board can be selected and submitted as two full sheets', async ({ page }) => {
  await page.goto('/boards');
  await expect(page.getByRole('heading', { name: 'Standalone board supply' })).toBeVisible();
  await expect(page.getByText('Sourced on request', { exact: false }).first()).toBeVisible();
  await page.getByRole('link', { name: /White melamine board/ }).click();
  await expect(page.getByText('2440 × 1220 mm', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Request full sheets' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/Quantity in full sheets or part count/).fill('2');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Full name').fill('Synthetic Browser Customer');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('browser@example.com');
  await page.getByLabel('Town or suburb').fill('Demo Suburb');
  await page
    .getByLabel('Describe the overall request')
    .fill('Please quote two synthetic full board sheets.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/acknowledge the current/).check();
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible();
  await expect(page.getByText(/ENQ-2026-/)).toBeVisible();
});

test('catalogue and wizard have no automated WCAG A/AA violations at mobile width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const path of ['/boards', '/hardware', '/request-quote']) {
    await page.goto(path);
    // Measure the settled visual state rather than the intentional entrance opacity transition.
    await page.waitForTimeout(2_000);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
});
