import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against a live stack (not CI-scaffolded here).
 * Set PLAYWRIGHT_BASE_URL to your preview/dev origin.
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
        trace: 'on-first-retry',
        ...devices['Desktop Chrome'],
    },
});
