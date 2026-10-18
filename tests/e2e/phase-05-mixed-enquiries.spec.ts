import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('mixed property, cabinetry and board request keeps one reference', async ({ page }) => {
  await page.goto('/request-quote?service=PROPERTY_TRANSFORMATION');
  await page.getByLabel('Cabinetry').check();
  await page.getByLabel('Board sales').check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('I understand plumbing').check();
  await page.getByLabel(/Or describe material/).fill('Synthetic raw plywood full sheet');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Full name').fill('Synthetic Mixed Browser Customer');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('mixed@example.invalid');
  await page.getByLabel('Town or suburb').fill('Demo Suburb');
  await page
    .getByLabel('Describe the overall request')
    .fill('Synthetic mixed property, supply-only cabinetry and board request.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/acknowledge the current/).check();
  await page.getByRole('button', { name: 'Submit request' }).click();

  await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible();
  await expect(page.getByText(/ENQ-2026-/)).toBeVisible();
});

test('wizard remains usable at mobile width and 200 percent zoom', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/request-quote?service=BOARD_CUTTING');
  const continueButton = page.getByRole('button', { name: 'Continue' });
  await continueButton.focus();
  await page.keyboard.press('Enter');
  await page.evaluate(() => {
    document.documentElement.style.zoom = '200%';
  });

  await expect(page.getByLabel('Input mode')).toHaveValue('NEED_HELP');
  await expect(
    page.getByLabel('Input mode').locator('option', { hasText: 'ATTACHMENT' }),
  ).toHaveAttribute('disabled', '');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
});

test('removing populated service details requires confirmation', async ({ page }) => {
  await page.goto('/request-quote?service=CABINETRY');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Material or finish (optional)').fill('Synthetic timber finish');
  await page.getByRole('button', { name: 'Back' }).click();

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByLabel('Cabinetry').click();
  await expect(page.getByLabel('Cabinetry')).toBeChecked();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByLabel('Cabinetry').click();
  await expect(page.getByLabel('Cabinetry')).not.toBeChecked();
});

test('transient submission failure preserves entered contact data and focuses errors', async ({
  page,
}) => {
  await page.route('**/api/v1/enquiries', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'TEMPORARY_FAILURE', message: 'Please retry.' }),
    }),
  );
  await page.goto('/request-quote');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/Or describe material/).fill('Synthetic raw board specification');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Full name').fill('Synthetic Preserved Customer');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('preserved@example.invalid');
  await page.getByLabel('Town or suburb').fill('Demo Suburb');
  await page
    .getByLabel('Describe the overall request')
    .fill('Synthetic request used to verify transient error preservation.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel(/acknowledge the current/).check();
  await page.getByRole('button', { name: 'Submit request' }).click();

  const summary = page.getByRole('alert');
  await expect(summary).toContainText('Please retry.');
  await expect(summary).toBeFocused();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Synthetic Preserved Customer');
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue(
    'preserved@example.invalid',
  );
});
