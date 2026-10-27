import { expect, test } from '@playwright/test';

test('hero video plays continuously without carousel navigation', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('.hero-video-background');
  await expect(video).toHaveAttribute('muted', '');
  await expect(video).toHaveAttribute('loop', '');
  await expect(video.locator('source[type="video/webm"]')).toHaveCount(1);
  await expect(video.locator('source[type="video/mp4"]')).toHaveCount(1);
  await expect.poll(() => video.evaluate((element) => !element.paused)).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => video.evaluate((element) => element.paused)).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => video.evaluate((element) => !element.paused)).toBe(true);
  await expect(page.locator('.hero-carousel-indicators, .hero-carousel-arrow')).toHaveCount(0);
});
