import { existsSync, readdirSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const SYSTEM_BROWSERS = [
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser',
	'/usr/bin/google-chrome',
	'/usr/bin/google-chrome-stable',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Chromium.app/Contents/MacOS/Chromium',
	'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
];

/** Chromium builds already downloaded by any Playwright version, newest first. */
function playwrightCacheBrowsers() {
	const os = platform();
	const cache =
		process.env.PLAYWRIGHT_BROWSERS_PATH ??
		(os === 'darwin'
			? join(homedir(), 'Library', 'Caches', 'ms-playwright')
			: os === 'win32'
				? join(process.env.LOCALAPPDATA ?? '', 'ms-playwright')
				: join(homedir(), '.cache', 'ms-playwright'));
	const executable =
		os === 'darwin'
			? ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium']
			: os === 'win32'
				? ['chrome-win', 'chrome.exe']
				: ['chrome-linux64', 'chrome'];
	try {
		return readdirSync(cache)
			.filter((name) => /^chromium-\d+$/.test(name))
			.sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
			.map((name) => join(cache, name, ...executable));
	} catch {
		return [];
	}
}

/**
 * Chromium executables to try, in order: `--browser`, $MOZAIC_BROWSER,
 * Playwright's expected download, any other cached Playwright Chromium, then
 * common system locations.
 * @param {string | undefined} explicit
 * @returns {string[]}
 */
export function browserCandidates(explicit) {
	/** @type {(string | undefined)[]} */
	const candidates = [explicit, process.env.MOZAIC_BROWSER];
	try {
		candidates.push(chromium.executablePath());
	} catch {
		// Playwright's own browser is not installed.
	}
	candidates.push(...playwrightCacheBrowsers(), ...SYSTEM_BROWSERS);
	return [...new Set(candidates.filter((path) => path !== undefined && existsSync(path)))].map(String);
}

/**
 * @param {string | undefined} explicit
 * @returns {string | undefined}
 */
export function findBrowser(explicit) {
	return browserCandidates(explicit)[0];
}

/**
 * Launch the first candidate that starts. An explicit `--browser` is the only
 * candidate tried when given.
 * @param {string | undefined} explicit
 */
export async function launchBrowser(explicit) {
	const candidates = explicit ? [explicit] : browserCandidates(undefined);
	if (!candidates.length) {
		throw new Error(
			'No Chromium found. Install one with `pnpm dlx playwright install chromium`, or pass --browser /path/to/chrome.'
		);
	}
	/** @type {string[]} */
	const failures = [];
	for (const executablePath of candidates) {
		try {
			return await chromium.launch({ executablePath, headless: true });
		} catch (error) {
			failures.push(`${executablePath}: ${String(error instanceof Error ? error.message : error).split('\n')[0]}`);
		}
	}
	throw new Error(
		`Could not start Chromium. Tried:\n${failures.join('\n')}\nInstall one with \`pnpm dlx playwright install chromium\` or pass --browser.`
	);
}
