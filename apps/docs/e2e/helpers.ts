import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

interface Manifest {
	embeds: { slug: string; style: string; locale: string; path: string }[];
}

/** The built site's embed manifest: the source of truth for slugs and embed paths. */
export const manifest: Manifest = JSON.parse(
	readFileSync(new URL('../build/embed/manifest.json', import.meta.url), 'utf8')
);
export const chartSlugs = [...new Set(manifest.embeds.map((e) => e.slug))];

/** Collect console errors and page errors; call `check()` at the end of the test. */
export function watchErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});
	page.on('pageerror', (err) => errors.push(err.message));
	return { check: () => expect(errors, errors.join('\n')).toEqual([]) };
}
