const { test, expect } = require('@playwright/test');

async function openCleanApp(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ShikeLocalFirst?.getStatus().ready && window.ShikeChronosWeb);
  await page.evaluate(async () => {
    if (typeof window.hideOpening === 'function') window.hideOpening();
    if (typeof window.closeReleaseNotes === 'function') window.closeReleaseNotes();
    window.records = [];
    await window.persistRecordsDurably();
    window.renderCurrent();
  });
}

test('time review is first-class, readable, and actionable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openCleanApp(page);

  const source = '我答应老师今天交实习材料，小王说合同今天回复。';
  await page.locator('#quickInput').fill(source);
  await page.locator('#saveBtn').click();
  await expect(page.locator('#temporalInboxBlock .temporal-draft')).toHaveCount(2);
  await page.locator('#temporalInboxBlock .temporal-confirm-all').click();
  await expect.poll(() => page.evaluate(() => window.records.length)).toBe(2);

  await page.locator('[data-page="my"]').click();
  const section = page.locator('#temporalReviewSection');
  await expect(section).toBeVisible();
  await expect(section).toContainText('今天处理');
  await expect(section).toContainText('等待他人');
  await expect(section.locator('.temporal-review-focus')).toBeVisible();
  await expect(section.locator('[data-review="complete"]')).toBeVisible();
  expect(await page.locator('#dataBackupSection #temporalReviewBlock').count()).toBe(0);
  await section.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('consumer-review-375.png') });

  const completeAction = section.locator('[data-review="complete"]');
  await completeAction.focus();
  await expect(completeAction).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.records.filter((record) => record.recordState === 'completed').length)).toBe(1);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('time review follows the selected language', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await openCleanApp(page);
  await page.locator('[data-page="my"]').click();
  await page.locator('#langGroup [data-lang="en"]').click();
  const section = page.locator('#temporalReviewSection');
  await expect(section).toContainText('Time review');
  await expect(section).toContainText('Due today');
  await expect(section).toContainText('Weekly review');
  await expect(section).toContainText('Review data');
  await page.screenshot({ path: testInfo.outputPath('consumer-review-1366.png') });
});
