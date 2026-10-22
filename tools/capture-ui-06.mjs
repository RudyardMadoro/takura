import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseUrl = process.env['TAKURA_PUBLIC_URL'] ?? 'http://localhost:4200';
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

await page.goto(`${baseUrl}/cabinetry`);
await page.locator('.cabinetry-hero img').evaluate((image) => image.decode());
await page.screenshot({
  path: 'docs/development/screenshots/ui-06-desktop-cabinetry.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});

await page.setViewportSize({ width: 375, height: 900 });
await page.goto(`${baseUrl}/cabinetry`);
await page.locator('.cabinetry-hero img').evaluate((image) => image.decode());
await page.screenshot({
  path: 'docs/development/screenshots/ui-06-mobile-cabinetry.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});

await browser.close();
