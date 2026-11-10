import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { parseArgs } from '../src/args.js';
import { serveStatic } from '../src/serve.js';
import { eject, recipeNames, rewriteImports } from '../src/eject.js';
import { findBrowser } from '../src/browser.js';
import { exportEmbeds } from '../src/export.js';

const fixture = fileURLToPath(new URL('./fixture-site', import.meta.url));
const temps = [];
const temp = async () => {
	const dir = await mkdtemp(join(tmpdir(), 'mozaic-cli-'));
	temps.push(dir);
	return dir;
};
afterAll(() => Promise.all(temps.map((d) => rm(d, { recursive: true, force: true }))));

describe('parseArgs', () => {
	it('parses positionals and options', () => {
		expect(parseArgs(['export', 'build', '--out', 'x', '--only=a,b', '--force', '--no-install', '-h'])).toEqual({
			positionals: ['export', 'build'],
			options: { out: 'x', only: 'a,b', force: true, install: false, h: true }
		});
	});
});

describe('serveStatic', () => {
	it('serves files and directory indexes, and refuses to leave the root', async () => {
		const server = await serveStatic(fixture);
		try {
			const page = await fetch(new URL('embed/demo/base/en/', server.url));
			expect(page.status).toBe(200);
			expect(page.headers.get('content-type')).toContain('text/html');
			const json = await fetch(new URL('embed/manifest.json', server.url));
			expect((await json.json()).project).toBe('fixture');
			expect((await fetch(new URL('nope.txt', server.url))).status).toBe(404);
			expect((await fetch(new URL('/%2e%2e/%2e%2e/package.json', server.url))).status).toBeGreaterThanOrEqual(403);
		} finally {
			await server.close();
		}
	});
});

describe('eject', () => {
	it('rewrites internal imports to package imports', () => {
		expect(rewriteImports("import { Plot } from '../core/index.js';\nimport x from './x.js';")).toBe(
			"import { Plot } from '@samizdata/mozaic/core';\nimport x from './x.js';"
		);
	});

	it('copies a recipe and refuses to overwrite without force', async () => {
		const cwd = await temp();
		const file = await eject({ name: 'BarChart', to: 'src/lib/recipes', cwd });
		const source = await readFile(file, 'utf8');
		expect(source).toContain("from '@samizdata/mozaic/frame'");
		expect(source).not.toContain('../core/index.js');
		await expect(eject({ name: 'BarChart', to: 'src/lib/recipes', cwd })).rejects.toThrow(/already exists/);
		await expect(eject({ name: 'Nope', to: 'x', cwd })).rejects.toThrow(/Unknown recipe/);
	});

	it('lists every recipe that recipes/index.ts exports', async () => {
		const index = await readFile(new URL('../../src/lib/recipes/index.ts', import.meta.url), 'utf8');
		const exported = [...index.matchAll(/export \{ default as (\w+) \}/g)].map((m) => m[1]);
		expect(exported.length).toBeGreaterThan(0);
		expect(recipeNames()).toEqual(exported.sort());
	});
});

describe.skipIf(!findBrowser(undefined))('exportEmbeds (needs Chromium)', () => {
	it('writes web and print files for every embed', async () => {
		const out = await temp();
		const files = await exportEmbeds({ dir: fixture, out, formats: new Set(['svg', 'pdf', 'png']), webWidth: 400 });
		const names = files.map((f) => f.slice(out.length + 1));
		expect(names).toEqual(
			expect.arrayContaining([
				'demo/base-en/web.png',
				'demo/base-en/web.svg',
				'demo/base-en/print-column.svg',
				'demo/base-en/print-column.pdf',
				'index.json'
			])
		);
		const png = await readFile(join(out, 'demo/base-en/web.png'));
		expect(png.subarray(1, 4).toString()).toBe('PNG');
		const pdf = await readFile(join(out, 'demo/base-en/print-column.pdf'));
		expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
		expect(await readFile(join(out, 'demo/base-en/web.svg'), 'utf8')).toContain('fixture');
	}, 60000);

	it('fails clearly when --only matches nothing', async () => {
		const out = await temp();
		await mkdir(out, { recursive: true });
		await writeFile(join(out, '.keep'), '');
		await expect(
			exportEmbeds({ dir: fixture, out, only: ['missing'], formats: new Set(['svg']), webWidth: 400 })
		).rejects.toThrow(/No embeds match/);
	});
});
