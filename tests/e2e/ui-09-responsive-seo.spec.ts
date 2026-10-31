import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/services/property-transformation',
  '/services/construction',
  '/projects',
  '/cabinetry',
  '/boards',
];

test('representative public pages remain contained across responsive widths', async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
        `${route} overflowed at ${width}px`,
      ).toBe(true);
    }
  }
});

test('property transformation hero uses the desktop viewport below the site chrome', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/services/property-transformation');

    const headerBottom = await page
      .locator('.site-header')
      .evaluate((element) => element.getBoundingClientRect().bottom);
    const heroBox = await page.locator('.service-detail-hero').boundingBox();
    expect(heroBox?.y).toBeCloseTo(headerBottom, 0);
    expect((heroBox?.y ?? 0) + (heroBox?.height ?? 0)).toBeLessThanOrEqual(viewport.height + 1);

    const headingLines = await page.locator('.service-detail-hero h1').evaluate((element) => {
      const style = getComputedStyle(element);
      return Math.round(
        element.getBoundingClientRect().height / Number.parseFloat(style.lineHeight),
      );
    });
    expect(headingLines).toBeLessThanOrEqual(2);
    await expect(page.locator('.service-detail-hero .lead')).toBeInViewport();
    await expect(page.locator('.service-detail-hero .action')).toBeInViewport();
    await expect(page.locator('.service-visual img')).toBeInViewport();
  }
});

test('mobile navigation has usable targets and returns focus on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  const trigger = page.getByText('Menu', { exact: true });
  await trigger.click();
  const links = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link');
  for (const box of await links.evaluateAll((items) =>
    items.map((item) => item.getBoundingClientRect().height),
  )) {
    expect(box).toBeGreaterThanOrEqual(44);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu')).not.toHaveAttribute('open', '');
  await expect(page.locator('.menu summary')).toBeFocused();
});

test('SSR metadata and reduced-motion behavior remain valid', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page).toHaveTitle(/Property transformation.+Takura Muzenda Property Transformation/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /Property transformation/,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /example\.invalid\/?$/,
  );

  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);

  await page.goto('/');
  expect(
    await page
      .locator('.reveal')
      .first()
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration)),
  ).toBeLessThanOrEqual(0.001);
});
