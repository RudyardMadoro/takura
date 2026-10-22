import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const baseUrl = process.env['TAKURA_PUBLIC_URL'] ?? 'http://localhost:4200';

await page.goto(`${baseUrl}/services`);
await page.screenshot({
  path: 'docs/development/screenshots/ui-04-desktop-services.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});

await page.goto(`${baseUrl}/services/construction`);
await page.screenshot({
  path: 'docs/development/screenshots/ui-04-desktop-construction.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});

await page.setViewportSize({ width: 375, height: 900 });
await page.goto(`${baseUrl}/services/renovations`);
await page.screenshot({
  path: 'docs/development/screenshots/ui-04-mobile-renovations.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});

await browser.close();
