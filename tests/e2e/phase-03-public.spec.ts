import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

const viewports = [320, 375, 768, 1024, 1440];
const publicRoutes = [
  '/',
  '/property-transformation',
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

  test('home hero uses the established full-bleed service-page layout', async ({ page }) => {
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const heroBox = await page.locator('.home-hero').boundingBox();
      expect(heroBox?.x, `hero should meet the left viewport edge at ${width}px`).toBe(0);
      expect(heroBox?.width, `hero should span the viewport at ${width}px`).toBe(width);
      await expectNoHorizontalOverflow(page);
    }
  });

  test('Takura Muzenda branding uses responsive vector marks and metadata', async ({ page }) => {
    await page.goto('/');
    const compact = page.locator('.brand-logo-compact');
    const footerLogo = page.locator('.footer-brand img');
    await expect(compact).toBeVisible();
    await expect(compact).toHaveAttribute('src', '/brand/takura-muzenda-compact.svg');
    await expect(footerLogo).toHaveAttribute('src', '/brand/takura-muzenda-full-light.svg');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      'href',
      '/brand/takura-muzenda-mark.svg',
    );
    await expect(page.locator('meta[name="application-name"]')).toHaveAttribute(
      'content',
      'Takura Muzenda Property Transformation',
    );
    expect(
      await compact.evaluate((image: HTMLImageElement) => [
        image.naturalWidth,
        image.naturalHeight,
      ]),
    ).toEqual([540, 128]);

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(compact).toBeHidden();
    await expect(page.locator('.brand-logo-mark')).toBeVisible();
  });

  test('service discovery and detail routes retain truthful enquiry integration', async ({
    page,
  }) => {
    const indexResponse = await page.goto('/');
    expect(indexResponse?.status()).toBe(200);
    await expect(
      page.getByRole('link', { name: /Property transformation/, exact: false }).first(),
    ).toHaveAttribute('href', '/services/property-transformation');
    await expect(page.getByRole('link', { name: /Cabinetry & custom interiors/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Board supply & cutting/ })).toBeVisible();
    await expect(page.locator('.service-index-grid > a')).toHaveCount(4);

    const detailResponse = await page.goto('/services/property-transformation');
    expect(detailResponse?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Property transformation' }),
    ).toBeVisible();
    for (const capability of [
      'Construction',
      'Renovations',
      'Extensions',
      'Property conversions',
      'Maintenance',
      'Interiors',
    ]) {
      await expect(page.getByRole('heading', { level: 3, name: capability })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Discuss this service' })).toHaveAttribute(
      'href',
      /request-quote\?service=PROPERTY_TRANSFORMATION/,
    );
    await expect(page.getByRole('link', { name: 'Request construction' })).toHaveAttribute(
      'href',
      /request-quote\?service=CONSTRUCTION/,
    );
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

  test('legacy property route permanently redirects and preserves query parameters', async ({
    request,
  }) => {
    const response = await request.get('/property-transformation?source=legacy', {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toBe('/services/property-transformation?source=legacy');
  });

  test('retired services overview permanently redirects home and preserves query parameters', async ({
    request,
  }) => {
    const response = await request.get('/services?source=legacy', { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toBe('/?source=legacy');
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
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll, `${route} must not overflow horizontally`).toBeLessThanOrEqual(
        dimensions.client,
      );
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
    await expect(page.getByText('Gauteng concept area')).toBeVisible();
    await expect(page.getByText(/not a client commission, completed project/i)).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Other published concepts.' })).toBeVisible();
    await expect(page.locator('.related-projects article')).toHaveCount(2);
  });

  test('project portfolio exposes published concepts without unsupported claims', async ({
    page,
  }) => {
    const response = await page.goto('/projects');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Property ideas presented with their status made clear',
    );
    await expect(page.locator('.portfolio-grid article')).toHaveCount(3);
    await expect(page.getByText('Owner-development concept', { exact: true })).toHaveCount(3);
    await expect(page.locator('.portfolio-grid')).not.toContainText(/price|available for sale/i);
    await expectWcagAa(page);
  });

  test('cabinetry showcase uses published copy and an accessible enquiry gallery', async ({
    page,
  }) => {
    const response = await page.goto('/cabinetry');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Joinery shaped around the room',
    );
    await expect(page.locator('.cabinetry-offer-grid article')).toHaveCount(5);
    await expect(page.getByRole('link', { name: 'Start a cabinetry brief' })).toHaveAttribute(
      'href',
      /request-quote\?service=CABINETRY/,
    );
    const opener = page.getByRole('button', { name: 'Open Kitchen composition study' });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'Concept illustration' });
    await expect(dialog).toContainText('Image 1 of 3: Kitchen composition study');
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
    await expectWcagAa(page);
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
