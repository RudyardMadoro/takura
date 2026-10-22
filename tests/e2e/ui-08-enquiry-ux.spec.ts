import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('contextual enquiry keeps required validation and keyboard focus clear', async ({ page }) => {
  await page.goto('/request-quote?service=CABINETRY');
  await expect(page.getByLabel('Current enquiry context')).toContainText('Cabinetry');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Tell us what the work involves' })).toBeFocused();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Contact and supporting files' })).toBeFocused();

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review before submitting' })).not.toBeVisible();

  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
});

test('enquiry form remains contained at a narrow mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/request-quote?service=PROPERTY_TRANSFORMATION');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
