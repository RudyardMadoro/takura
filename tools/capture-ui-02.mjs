import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://127.0.0.1:4000');
await page.screenshot({
  path: 'docs/development/screenshots/ui-02-desktop-home.png',
  fullPage: true,
});
await page.setViewportSize({ width: 375, height: 900 });
await page.goto('http://127.0.0.1:4000');
await page.locator('header summary').click();
await page.screenshot({
  path: 'docs/development/screenshots/ui-02-mobile-menu.png',
  fullPage: true,
});
await browser.close();
