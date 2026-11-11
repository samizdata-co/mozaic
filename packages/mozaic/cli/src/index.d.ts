import type { Browser } from 'playwright-core';

/** Chromium executables to try, in order: `explicit`, $MOZAIC_BROWSER, Playwright's, the system's. */
export function browserCandidates(explicit?: string): string[];
/** The first Chromium found, or `undefined`. */
export function findBrowser(explicit?: string): string | undefined;
/** Launch the first Chromium that starts; with `explicit`, only that one. */
export function launchBrowser(explicit?: string): Promise<Browser>;
/** Serve a static folder on 127.0.0.1 at a random port; directories get their index.html. */
export function serveStatic(dir: string): Promise<{ url: string; close: () => Promise<void> }>;
