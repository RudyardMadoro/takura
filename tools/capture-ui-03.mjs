import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://127.0.0.1:4000');
await page.locator('.cabinetry-feature img').scrollIntoViewIfNeeded();
await page.locator('.cabinetry-feature img').evaluate((image) => image.decode());
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({
  path: 'docs/development/screenshots/ui-03-desktop-home.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});
await page.setViewportSize({ width: 375, height: 900 });
await page.goto('http://127.0.0.1:4000');
await page.locator('.cabinetry-feature img').scrollIntoViewIfNeeded();
await page.locator('.cabinetry-feature img').evaluate((image) => image.decode());
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({
  path: 'docs/development/screenshots/ui-03-mobile-home.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 82,
});
await browser.close();
