import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseUrl = process.env['TAKURA_PUBLIC_URL'] ?? 'http://127.0.0.1:4000';

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await desktop.goto(`${baseUrl}/request-quote?service=CABINETRY`);
await desktop.screenshot({
  path: 'docs/development/screenshots/ui-08-desktop-enquiry.jpg',
  fullPage: true,
  type: 'jpeg',
  quality: 84,
});

const mobile = await browser.newPage({ viewport: { width: 375, height: 900 } });
await mobile.goto(`${baseUrl}/request-quote?service=BOARD_CUTTING`);
await mobile.getByRole('button', { name: 'Continue' }).click();
await mobile.getByRole('button', { name: 'Continue' }).click();
await mobile.locator('.form-step-heading').scrollIntoViewIfNeeded();
await mobile.screenshot({
  path: 'docs/development/screenshots/ui-08-mobile-contact.jpg',
  type: 'jpeg',
  quality: 84,
});

await browser.close();
