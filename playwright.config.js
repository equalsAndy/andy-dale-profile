module.exports = defineConfig({
    testDir: './pr_tests', // Specify Playwright test directory
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