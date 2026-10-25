import { expect, test } from '@playwright/test';
import { manifest, watchErrors } from './helpers';

test('every embed page renders without errors', async ({ page }) => {
	test.setTimeout(180_000);
	const errors = watchErrors(page);
	for (const embed of manifest.embeds) {
		await page.goto(`/${embed.path}`);
		const figure = page.locator('.mz-chart').first();
		await expect(figure, embed.path).toHaveAttribute('data-mz-style', embed.style);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	}
	errors.check();
});

test('embeds show the chart before JavaScript runs', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/embed/raion-map/zdg/ro/');
	await expect(page.locator('.mz-geo path').first()).toBeAttached();
	expect(await page.locator('.mz-geo path').count()).toBeGreaterThan(30);
	await context.close();
});

test('embed.js resizes the host iframe to the chart height', async ({ page, baseURL }) => {
	await page.goto('/embed.js');
	await page.setContent(`<!doctype html><body style="margin:0">
		<iframe id="a" src="${baseURL}/embed/budget-bars/zdg/ro/" height="100" style="width:600px;border:0" scrolling="no"></iframe>
		<iframe id="b" src="${baseURL}/embed/regional-lines/samizdata/en/" height="100" style="width:360px;border:0" scrolling="no"></iframe>
		<script src="${baseURL}/embed.js"></script></body>`);
	for (const id of ['a', 'b']) {
		await expect
			.poll(async () => page.locator(`#${id}`).evaluate((f) => f.getBoundingClientRect().height), { timeout: 15_000 })
			.toBeGreaterThan(300);
	}
	// The iframe height matches the document inside it (no scrollbars, no gap).
	const frame = page.frameLocator('#a');
	const inner = await frame.locator('.mz-embed').evaluate((el) => Math.ceil(el.getBoundingClientRect().height));
	const outer = await page.locator('#a').evaluate((f) => Math.round(f.getBoundingClientRect().height));
	expect(Math.abs(inner - outer)).toBeLessThanOrEqual(1);
});

test('print query parameters switch the embed to print', async ({ page }) => {
	await page.goto('/embed/budget-bars/zdg/ro/?medium=print&width=208');
	const figure = page.locator('.mz-chart');
	await expect(figure).toHaveAttribute('data-mz-medium', 'print');
	expect(Math.round((await figure.boundingBox())!.width)).toBe(208);
	const svg = await page.evaluate(() => (window as unknown as { __mozaic: { toSvg: () => string } }).__mozaic.toSvg());
	expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="208"/);
	expect(svg).toContain('Cheltuielile');
	expect(svg).not.toContain('var(--');
});

test('the manifest lists every chart in every style and language', async ({ request }) => {
	const response = await request.get('/embed/manifest.json');
	const data = await response.json();
	expect(data.embeds.length).toBe(manifest.embeds.length);
	expect(data.embeds[0].print).toEqual({ column: 55, double: 115 });
});
