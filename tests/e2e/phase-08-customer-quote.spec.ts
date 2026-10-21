import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('customer quote scrubs fragment, keeps session in memory and exposes no online acceptance', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.route('**/api/v1/quote-access/exchange', async (route) => {
    expect((await route.request().postDataJSON()).token).toBe('synthetic-fragment-secret');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session: 'synthetic-memory-session',
        expires_at: '2026-11-04T15:00:00Z',
      }),
    });
  });
  await page.route('**/api/v1/customer/quote', async (route) => {
    expect(route.request().headers()['x-quote-session']).toBe('synthetic-memory-session');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
      body: JSON.stringify({
        quote_number: 'Q-2026-000001',
        revision_number: 1,
        state: 'ISSUED',
        amount: '2500.00',
        currency: 'ZAR',
        tax_mode: 'NOT_APPLICABLE',
        scope_summary: 'Synthetic reviewed board quotation fixture.',
        expires_at: '2026-11-04T15:00:00Z',
      }),
    });
  });

  await page.goto('/quote/view#synthetic-fragment-secret');
  await expect(page).toHaveURL(/\/quote\/view$/);
  await expect(page.getByRole('heading', { name: 'Q-2026-000001 · revision 1' })).toBeVisible();
  await expect(page.getByText('ZAR 2500.00')).toBeVisible();
  await expect(page.getByRole('button', { name: /accept|pay/i })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer');
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
});

test('invalid or revoked access has one generic accessible state', async ({ page }) => {
  await page.route('**/api/v1/quote-access/exchange', (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
  );
  await page.goto('/quote/view#revoked-secret');
  await expect(page).toHaveURL(/\/quote\/view$/);
  await expect(page.getByRole('alert')).toContainText('invalid, expired, superseded or revoked');
  await expect(page.getByRole('button', { name: 'Download reviewed PDF' })).toHaveCount(0);
});
