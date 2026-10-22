import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const baseUrl = process.env['TAKURA_PUBLIC_URL'] ?? 'http://127.0.0.1:4000';

for (const [name, width, height, route] of [
  ['mobile-home', 375, 900, '/'],
  ['tablet-services', 768, 1024, '/services'],
  ['desktop-projects', 1440, 1000, '/projects'],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${baseUrl}${route}`);
  await page.screenshot({
    path: `docs/development/screenshots/ui-09-${name}.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 82,
  });
  await page.close();
}

await browser.close();
