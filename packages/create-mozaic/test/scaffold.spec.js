import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { scaffold, slugify } from '../src/index.js';

const temps = [];
const temp = async () => {
	const dir = await mkdtemp(join(tmpdir(), 'create-mozaic-'));
	temps.push(dir);
	return dir;
};
afterAll(() => Promise.all(temps.map((d) => rm(d, { recursive: true, force: true }))));

/** @param {string} dir @returns {Promise<string[]>} */
async function files(dir) {
	const out = [];
	for (const entry of await readdir(dir, { withFileTypes: true, recursive: true }))
		if (entry.isFile()) out.push(join(entry.parentPath, entry.name));
	return out;
}

describe('slugify', () => {
	it('makes URL-safe names', () => {
		expect(slugify('Bugetul Moldovei 2026!')).toBe('bugetul-moldovei-2026');
		expect(slugify('Ștefan Vodă')).toBe('stefan-voda');
	});
});

describe('scaffold', () => {
	it('copies the template and fills every placeholder', async () => {
		const dir = join(await temp(), 'budget-2026');
		await scaffold({ dir, title: 'Budget 2026', locales: ['ro', 'ru'], mozaic: '^0.2.0' });
		const all = await files(dir);
		expect(all.some((f) => f.endsWith('.gitignore'))).toBe(true);
		expect(all.some((f) => f.endsWith('_gitignore'))).toBe(false);
		for (const file of all) expect(await readFile(file, 'utf8'), file).not.toMatch(/__[A-Z_]+__/);
		const config = await readFile(join(dir, 'mozaic.config.ts'), 'utf8');
		expect(config).toContain("project: 'budget-2026'");
		expect(await readFile(join(dir, 'src/lib/theme.ts'), 'utf8')).toContain(
			"name: 'budget-2026', label: 'Budget 2026'"
		);
		expect(config).toContain("locales: ['ro','ru']");
		const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
		expect(pkg.name).toBe('budget-2026');
		expect(pkg.dependencies.mozaic).toBe('^0.2.0');
		expect(await readFile(join(dir, 'README.md'), 'utf8')).toContain('# Budget 2026');
	});

	it('links local mozaic packages by path', async () => {
		const dir = join(await temp(), 'linked');
		await scaffold({ dir, mozaic: '/opt/mozaic/packages/mozaic' });
		const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
		expect(pkg.dependencies.mozaic).toBe('link:/opt/mozaic/packages/mozaic');
	});

	it('rejects bad options and non-empty folders', async () => {
		const base = await temp();
		await expect(scaffold({ dir: join(base, 'b'), locales: ['fr'] })).rejects.toThrow(/Unknown locale/);
		await writeFile(join(base, 'file.txt'), 'x');
		await expect(scaffold({ dir: base })).rejects.toThrow(/not empty/);
	});
});
