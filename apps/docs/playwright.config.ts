import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
// Reuse the CLI's browser lookup so local runs work with any cached Chromium.
import { browserCandidates } from '../../packages/mozaic/cli/src/browser.js';

const bundled = (() => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		return require('playwright-core').chromium.executablePath() as string;
	} catch {
		return undefined;
	}
})();
const executablePath = process.env.CI || (bundled && existsSync(bundled)) ? undefined : browserCandidates(undefined)[0];

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'retain-on-failure',
		launchOptions: executablePath ? { executablePath } : {}
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@visual|@mobile/ },
		{ name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
		// Visual baselines are platform-specific: run with `pnpm test:visual`.
		{ name: 'visual', use: { ...devices['Desktop Chrome'] }, grep: /@visual/ }
	],
	webServer: {
		command: 'pnpm preview --port 4173 --strictPort --host 127.0.0.1',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	}
});
