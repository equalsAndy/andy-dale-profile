const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './pr_tests',
  testMatch: ['**/*.e2e.js'], // Match files with .e2e.js extension
  timeout: 30 * 1000,
  retries: 1,
  use: {
    headless: true,
    baseURL: 'http://localhost:3003',
    screenshot: 'on',
    trace: 'on',
  },
});