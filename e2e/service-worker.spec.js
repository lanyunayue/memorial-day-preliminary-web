const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const source = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
const cacheMatch = source.match(/CACHE_NAME\s*=\s*['"]([^'"]+)/);
if (!cacheMatch) throw new Error('Service Worker cache name is missing');
const currentCache = cacheMatch[1];

async function loadAndEnter(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ShikeVersion && window.ShikeLocalFirst?.getStatus().ready);
  await page.evaluate(() => {
    if (typeof window.hideOpening === 'function') window.hideOpening();
    if (typeof window.closeReleaseNotes === 'function') window.closeReleaseNotes();
  });
}

test('service worker removes stale cache and launches offline', async ({ context, page }) => {
  await loadAndEnter(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.evaluate(async () => {
    await caches.open('shike-playwright-obsolete-cache');
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => caches.keys())).toContain(currentCache);
  await expect.poll(() => page.evaluate(() => caches.keys())).not.toContain('shike-playwright-obsolete-cache');

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.ShikeVersion?.version)).toMatch(/^v\d+/);
  await context.setOffline(false);
});
