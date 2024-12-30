// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './pr_tests', // Specify the directory where tests will be stored
  timeout: 30 * 1000, // Maximum time a single test can run
  retries: 1, // Retry failed tests once
  use: {
    headless: true, // Run tests in headless mode
    baseURL: 'http://localhost:3003', // Replace with your app's base URL
    screenshot: 'on', // Capture screenshots on test failure
    trace: 'on', // Record traces for failed tests
  },
});