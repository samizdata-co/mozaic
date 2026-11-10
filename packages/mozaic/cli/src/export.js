import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { launchBrowser } from './browser.js';
import { serveStatic } from './serve.js';

const PX_PER_MM = 96 / 25.4;

/** Interactive-only parts that do not belong in a static image. */
const HIDE_IN_IMAGES =
	'.mz-chart-tools, .mz-tooltip, .mz-data-table, .mz-data-download, .mz-button-group, .mz-table-search, .mz-table-more { display: none !important; }';

/**
 * @typedef {{ slug: string, style: string, locale: string, title: string, path: string, print: Record<string, number> }} EmbedEntry
 * @typedef {{ project: string, embeds: EmbedEntry[] }} EmbedManifest
 * @typedef {{ dir: string, out: string, only?: string[], formats: Set<string>, webWidth: number, browser?: string, log?: (line: string) => void }} ExportOptions
 */

/**
 * Wait until the embed page has hydrated, applied the requested medium and loaded its fonts.
 * @param {import('playwright-core').Page} page
 * @param {'web' | 'print'} medium
 */
async function ready(page, medium) {
	await page.waitForFunction(
		(m) => {
			const w = /** @type {any} */ (window);
			const figure = document.querySelector('.mz-chart');
			return Boolean(w.__mozaic?.ready && figure instanceof HTMLElement && figure.dataset.mzMedium === m);
		},
		medium,
		{ timeout: 15000 }
	);
	await page.evaluate(async () => {
		await document.fonts.ready;
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
	});
}

/**
 * @param {import('playwright-core').Page} page
 */
async function figureBox(page) {
	const box = await page.locator('.mz-chart').first().boundingBox();
	if (!box) throw new Error('No .mz-chart on the page.');
	return box;
}

/**
 * Export every embed in a built site's manifest to SVG, PDF and PNG.
 * @param {ExportOptions} options
 * @returns {Promise<string[]>} written file paths
 */
export async function exportEmbeds(options) {
	const { dir, out, only, formats, webWidth, log = () => {} } = options;
	const manifest = /** @type {EmbedManifest} */ (
		JSON.parse(await readFile(join(dir, 'embed', 'manifest.json'), 'utf8'))
	);
	const embeds = manifest.embeds.filter((e) => !only?.length || only.includes(e.slug));
	if (!embeds.length)
		throw new Error(only?.length ? `No embeds match --only ${only.join(',')}.` : 'The manifest lists no embeds.');

	const server = await serveStatic(dir);
	const browser = await launchBrowser(options.browser);
	/** @type {string[]} */
	const written = [];
	/** @type {(file: string, data: string | Buffer) => Promise<void>} */
	const save = async (file, data) => {
		await mkdir(resolve(file, '..'), { recursive: true });
		await writeFile(file, data);
		written.push(file);
		log(`  ${file}`);
	};

	try {
		const context = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: webWidth, height: 800 } });
		const page = await context.newPage();
		/** @type {string[]} */
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));

		for (const embed of embeds) {
			const folder = join(out, embed.slug, `${embed.style}-${embed.locale}`);
			const url = new URL(embed.path, server.url).href;
			log(`${embed.slug} (${embed.style}, ${embed.locale})`);

			if (formats.has('png') || formats.has('svg')) {
				await page.setViewportSize({ width: webWidth, height: 800 });
				await page.goto(url);
				await ready(page, 'web');
				await page.addStyleTag({ content: HIDE_IN_IMAGES });
				if (formats.has('png'))
					await save(join(folder, 'web.png'), await page.locator('.mz-chart').first().screenshot());
				if (formats.has('svg'))
					await save(join(folder, 'web.svg'), await page.evaluate(() => /** @type {any} */ (window).__mozaic.toSvg()));
			}

			for (const [name, mm] of Object.entries(embed.print ?? {})) {
				if (!formats.has('svg') && !formats.has('pdf')) break;
				const width = Math.round(mm * PX_PER_MM);
				await page.setViewportSize({ width: width + 32, height: 800 });
				await page.goto(`${url}?medium=print&width=${width}`);
				await ready(page, 'print');
				if (formats.has('svg'))
					await save(
						join(folder, `print-${name}.svg`),
						await page.evaluate(() => /** @type {any} */ (window).__mozaic.toSvg())
					);
				if (formats.has('pdf')) {
					const box = await figureBox(page);
					await page.emulateMedia({ media: 'screen' });
					const pdf = await page.pdf({
						width: `${Math.ceil(box.width)}px`,
						height: `${Math.ceil(box.height)}px`,
						printBackground: true,
						pageRanges: '1'
					});
					await save(join(folder, `print-${name}.pdf`), pdf);
				}
			}
		}

		if (errors.length) throw new Error(`Page errors during export:\n${errors.join('\n')}`);
		await save(
			join(out, 'index.json'),
			JSON.stringify({ project: manifest.project, files: written.map((f) => f.slice(out.length + 1)) }, null, 2)
		);
		await context.close();
	} finally {
		await browser.close();
		await server.close();
	}
	return written;
}
