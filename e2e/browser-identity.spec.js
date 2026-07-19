const { test, expect } = require('@playwright/test');

const expectedEngines = {
  chromium: 'chromium',
  edge: 'chromium',
  firefox: 'firefox',
  webkit: 'webkit',
};

test('launches the browser engine declared by the project', async ({ browserName, page }, testInfo) => {
  const projectName = testInfo.project.name;
  expect(browserName).toBe(expectedEngines[projectName]);

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  const userAgent = await page.evaluate(() => navigator.userAgent);

  if (projectName === 'edge') {
    expect(userAgent).toMatch(/Edg\//);
  } else if (projectName === 'chromium') {
    expect(userAgent).toMatch(/Chrome\//);
    expect(userAgent).not.toMatch(/Edg\//);
  } else if (projectName === 'firefox') {
    expect(userAgent).toMatch(/Firefox\//);
  } else {
    expect(userAgent).toMatch(/AppleWebKit\//);
    expect(userAgent).not.toMatch(/Chrome\//);
  }

  await expect.poll(() => page.evaluate(() => window.ShikeLocalFirst?.getStatus().ready)).toBe(true);
});
