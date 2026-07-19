const { test, expect } = require('@playwright/test');

const viewports = [
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

async function openApp(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (
    window.ShikeVersion
    && window.ShikeLocalFirst
    && window.ShikeLocalFirst.getStatus().ready
  ));
  await page.evaluate(() => {
    if (typeof window.hideOpening === 'function') window.hideOpening();
    if (typeof window.closeReleaseNotes === 'function') window.closeReleaseNotes();
  });
  await expect(page.locator('#page-home')).toBeVisible();
}

async function resetComposer(page) {
  await page.evaluate(async () => {
    window.records = [];
    await window.persistRecordsDurably();
    await window.ShikeAgent.clearHistory();
    window.ShikeComposerState.reset();
    window.saveTimeSpriteCollapsed(false);
    document.getElementById('agentWorkbench').open = true;
  });
  await expect(page.locator('#agentInput')).toBeVisible();
}

async function submitOnce(page, text) {
  const before = await page.evaluate(() => window.records.length);
  await page.locator('#agentInput').fill(text);
  await expect(page.locator('#agentSendBtn')).toBeEnabled();
  await page.locator('#agentSendBtn').dblclick();
  await expect.poll(() => page.evaluate(() => window.records.length)).toBe(before + 1);
  await expect.poll(() => page.evaluate(() => window.ShikeComposerState.getProcessingState()))
    .not.toBe('processing');
  await expect(page.locator('#agentInput')).toHaveValue('');
}

test('runtime starts clean and hidden UI stays hidden', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await openApp(page);
  await expect(page.locator('#agentPlan')).toBeHidden();
  await expect.poll(() => page.locator('#agentPlan').evaluate((element) => getComputedStyle(element).display))
    .toBe('none');
  await expect(page.locator('.nav-item')).toHaveCount(4);
  await expect.poll(() => errors).toEqual([]);
});

test('durable consecutive submissions save once and remain searchable', async ({ page }) => {
  await openApp(page);
  await resetComposer(page);
  await expect(page.locator('#agentSendBtn')).toBeDisabled();

  await submitOnce(page, '今天还有作业要做，帮我登记');
  await submitOnce(page, '帮我记一下买牛奶');
  await submitOnce(page, '明天下午三点交报告');

  const result = await page.evaluate(async () => {
    const indexed = await window.ShikeIndexedDb.getAll('records');
    return {
      memoryCount: window.records.length,
      indexedCount: indexed.length,
      report: window.records.find((record) => /交报告/.test(record.title)),
    };
  });
  expect(result.memoryCount).toBe(3);
  expect(result.indexedCount).toBe(3);
  expect(result.report.timeText || result.report.time).toBe('15:00');

  await page.locator('[data-page="all"]').click();
  await page.locator('#allSearchInput').fill('作业');
  await expect(page.locator('#allList')).toContainText('作业');
  await page.locator('[data-page="calendar"]').click();
  await expect(page.locator('#page-calendar .cal-dot')).not.toHaveCount(0);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ShikeLocalFirst && window.ShikeLocalFirst.getStatus().ready);
  await expect.poll(() => page.evaluate(() => window.records.length)).toBe(3);
});

test('legacy records migrate and encrypted backup rejects a wrong password', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('shike_records_v1', JSON.stringify([{
      id: 'legacy-playwright-record',
      title: '旧数据升级验证',
      type: 'note',
      dateKey: '2026-07-12',
      createdAt: 1700000000000,
    }]));
  });
  await openApp(page);

  const result = await page.evaluate(async () => {
    const local = window.records.find((item) => item.id === 'legacy-playwright-record');
    const indexed = await window.ShikeIndexedDb.getAll('records');
    const encrypted = await window.ShikeEncryptedBackup.encryptBackup(
      [{ id: 'backup-playwright', title: '备份验证' }],
      'correct-password',
    );
    let wrongPasswordError = '';
    try {
      await window.ShikeEncryptedBackup.decryptBackup(encrypted, 'wrong-password');
    } catch (error) {
      wrongPasswordError = error.message;
    }
    return {
      local,
      indexed: indexed.find((item) => item.id === 'legacy-playwright-record'),
      wrongPasswordError,
    };
  });
  expect(result.local.recordKind).toBeTruthy();
  expect(result.local.updatedAt).toBeTruthy();
  expect(result.indexed).toBeTruthy();
  expect(result.wrongPasswordError).toBe('DECRYPT_FAILED');
});

test('nine product viewports have no horizontal overflow', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await openApp(page);
    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      composerVisible: !!document.querySelector('#quickInput')?.getClientRects().length,
      navigationVisible: !!document.querySelector('.nav')?.getClientRects().length,
    }));
    expect(layout.scrollWidth, `${viewport.width}px overflow`).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.composerVisible, `${viewport.width}px composer`).toBe(true);
    expect(layout.navigationVisible, `${viewport.width}px navigation`).toBe(true);
  }
});
