import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

const viewports = [320, 375, 768, 1024, 1440];
const publicRoutes = [
  '/',
  '/property-transformation',
  '/services',
  '/services/construction',
  '/services/renovations',
  '/services/extensions',
  '/services/conversions',
  '/services/maintenance',
  '/services/property-transformation',
  '/projects',
  '/projects/compact-home-concept',
  '/cabinetry',
  '/about',
  '/contact',
  '/faqs',
  '/privacy',
  '/terms',
];

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

async function expectWcagAa(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
}

test.describe('Phase 03 public experience', () => {
  test('premium home renders imagery, working calls to action and published concepts', async ({
    page,
  }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Thoughtful spaces, shaped around real constraints.' }),
    ).toBeVisible();
    await expect(page.locator('.home-hero img')).toHaveAttribute(
      'alt',
      /Synthetic concept of a contemporary home/,
    );
    await expect(page.getByRole('link', { name: 'Start a project brief' })).toHaveAttribute(
      'href',
      '/request-quote',
    );
    await expect(page.locator('.project-showcase article').first()).toContainText(
      'Owner-development concept',
    );
  });

  test('service discovery and detail routes retain truthful enquiry integration', async ({
    page,
  }) => {
    const indexResponse = await page.goto('/services');
    expect(indexResponse?.status()).toBe(200);
    await expect(page.getByRole('link', { name: /Construction/ })).toHaveAttribute(
      'href',
      '/services/construction',
    );

    const detailResponse = await page.goto('/services/construction');
    expect(detailResponse?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: 'Construction' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Discuss this service' })).toHaveAttribute(
      'href',
      /request-quote\?service=CONSTRUCTION/,
    );
    await expect(page.getByText(/not a construction commitment/i)).toBeVisible();
    await expect(page.locator('.site-header')).toHaveCSS('position', 'sticky');
    await expect(page.locator('.service-detail-hero')).toHaveCSS('position', 'static');
    for (const selector of [
      '.service-detail-hero h1',
      '.service-detail-hero .lead',
      '.service-detail-hero .action',
    ]) {
      const box = await page.locator(selector).boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(24);
    }
    await expectWcagAa(page);
  });

  for (const width of viewports) {
    test(`home reflows without horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expectNoHorizontalOverflow(page);
    });
  }

  test('all supported routes reflow at a 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    for (const route of publicRoutes) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test('200% text and layout zoom reflows without covering focused controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/faqs');
    await page.locator('html').evaluate((element) => {
      element.style.zoom = '200%';
    });
    const summary = page.locator('main summary').first();
    await summary.focus();
    await expect(summary).toBeFocused();
    await expect(summary).toBeInViewport();
    await expectNoHorizontalOverflow(page);
  });

  test('mobile menu and FAQs expose usable screen-reader semantics from the keyboard', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/');
    const menuSummary = page.locator('header summary');
    await menuSummary.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('header details')).toHaveAttribute('open', '');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('header details')).not.toHaveAttribute('open', '');
    await expect(menuSummary).toBeFocused();

    await page.goto('/faqs');
    const question = page.getByText('Is the board catalogue live?', { exact: true });
    await question.focus();
    await page.keyboard.press('Enter');
    await expect(question.locator('xpath=..')).toHaveAttribute('open', '');
    await expect(
      page.getByText('Yes. Published board specifications can be requested as full sheets', {
        exact: false,
      }),
    ).toBeVisible();
    const accessibilityTree = await page.locator('body').ariaSnapshot();
    expect(accessibilityTree).toContain('Frequently asked questions');
    expect(accessibilityTree).toContain('Is the board catalogue live?');
  });

  test('project hydration and gallery keyboard dialog behavior are complete', async ({ page }) => {
    await page.goto('/projects/compact-home-concept');
    await expect(page.getByText('Loading published content…')).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Compact home owner-development concept',
    );
    const opener = page.getByRole('button', { name: 'Open Before concept illustration' });
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Concept illustration' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Image 1 of 3: Before concept')).toBeVisible();
    await dialog.getByRole('button', { name: 'Next image' }).click();
    await expect(dialog.getByText('Image 2 of 3: During concept')).toBeVisible();
    const dialogTree = await dialog.ariaSnapshot();
    expect(dialogTree).toContain('dialog "Concept illustration"');
    expect(dialogTree).toContain('Next image');
    await page.keyboard.press('Tab');
    await expect(page.locator('dialog :focus')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('representative states have no automatically detectable WCAG A/AA findings', async ({
    page,
  }) => {
    await page.goto('/');
    await expectWcagAa(page);
    await page.setViewportSize({ width: 320, height: 900 });
    await page.locator('header summary').click();
    await expectWcagAa(page);
    await page.goto('/faqs');
    await page.locator('main summary').first().click();
    await expectWcagAa(page);
    await page.goto('/projects/compact-home-concept');
    await expect(page.getByText('Loading published content…')).toBeHidden();
    await page.getByRole('button', { name: 'Open Before concept illustration' }).click();
    await expectWcagAa(page);
  });

  test('missing dynamic content has a genuine HTTP 404 and noindex', async ({ page }) => {
    const response = await page.goto('/projects/not-a-published-project');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});
