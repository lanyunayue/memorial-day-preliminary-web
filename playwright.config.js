const path = require('path');

const localEdge = process.platform === 'win32' && !process.env.CI;

module.exports = {
  testDir: './e2e',
  outputDir: './test-results/playwright',
  timeout: 60000,
  expect: { timeout: 12000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/playwright-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:8090',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 12000,
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: localEdge ? 'edge' : 'chromium',
      use: localEdge
        ? { browserName: 'chromium', channel: 'msedge' }
        : { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'node scripts/serve-static.js',
    cwd: path.resolve(__dirname),
    url: 'http://127.0.0.1:8090/index.html',
    reuseExistingServer: false,
    timeout: 30000,
  },
};
