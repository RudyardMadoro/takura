import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseUrl = process.env['TAKURA_PUBLIC_URL'] ?? 'http://localhost:4200';
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

await page.goto(`${baseUrl}/projects`);
await page.screenshot({
  path: 'docs/development/screenshots/ui-05-desktop-projects.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});

await page.goto(`${baseUrl}/projects/compact-home-concept`);
await page.screenshot({
  path: 'docs/development/screenshots/ui-05-desktop-project-detail.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});

await page.setViewportSize({ width: 375, height: 900 });
await page.goto(`${baseUrl}/projects/compact-home-concept`);
await page.screenshot({
  path: 'docs/development/screenshots/ui-05-mobile-project-detail.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});

await browser.close();
