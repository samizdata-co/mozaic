import { expect, test } from '@playwright/test';
import { chartSlugs, watchErrors } from './helpers';

test('home page renders featured charts', async ({ page }) => {
	const errors = watchErrors(page);
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'mozaic' })).toBeVisible();
	await expect(page.locator('.featured .mz-chart')).toHaveCount(3);
	errors.check();
});

test('every gallery page renders its chart without errors', async ({ page }) => {
	test.setTimeout(120_000);
	for (const slug of [...chartSlugs, 'scrolly']) {
		const errors = watchErrors(page);
		await page.goto(`/gallery/${slug}/`);
		await expect(page.locator('.frame .mz-chart').first(), slug).toBeVisible();
		await expect(page.getByText('Chart.svelte'), slug).toBeVisible();
		errors.check();
		page.removeAllListeners('console');
		page.removeAllListeners('pageerror');
	}
});

test('every docs page and API page loads', async ({ page }) => {
	test.setTimeout(120_000);
	const errors = watchErrors(page);
	await page.goto('/docs/getting-started/');
	const docs = await page
		.locator('aside nav a')
		.evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
	expect(docs.length).toBeGreaterThanOrEqual(10);
	for (const href of docs) {
		await page.goto(href);
		await expect(page.locator('article h1')).toBeVisible();
	}
	await page.goto('/api/');
	const api = await page.locator('main dt a').evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
	expect(api.length).toBeGreaterThan(40);
	for (const href of api) {
		await page.goto(href);
		await expect(page.locator('main h1')).toBeVisible();
	}
	errors.check();
});

test('style and language switch every chart and persist', async ({ page }) => {
	await page.goto('/gallery/budget-bars/');
	const figure = page.locator('.frame .mz-chart');
	await page.getByLabel('Style').selectOption('samizdata');
	await page.getByLabel('Language').selectOption('ro');
	await expect(figure).toHaveAttribute('data-mz-style', 'samizdata');
	await expect(figure).toHaveAttribute('lang', 'ro-MD');
	await expect(figure.locator('.mz-source')).toContainText('Sursa');
	await page.reload();
	await expect(page.locator('.frame .mz-chart')).toHaveAttribute('data-mz-style', 'samizdata');
});

test('line chart shows a tooltip on hover', async ({ page }) => {
	await page.goto('/gallery/regional-lines/');
	const area = page.locator('.frame .mz-pointer-area');
	const box = (await area.boundingBox())!;
	await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
	await expect(page.locator('.frame .mz-tooltip')).toBeVisible();
	await expect(page.locator('.frame .hover-dot')).toHaveCount(4);
});

test('scatter chart keeps the hovered point and fades the rest', async ({ page }) => {
	await page.goto('/gallery/scatter/');
	const points = page.locator('.frame .mz-points circle');
	const box = (await points.first().boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await expect(page.locator('.frame .mz-tooltip')).toBeVisible();
	const opacities = await points.evaluateAll((els) => els.map((el) => Number(el.getAttribute('fill-opacity'))));
	expect(Math.max(...opacities)).toBeGreaterThan(0.5);
	expect(opacities.filter((o) => o > 0.5)).toHaveLength(1);
});

test('button group switches stacked columns to shares', async ({ page }) => {
	await page.goto('/gallery/stacked-columns/');
	const share = page.locator('.frame [role="radio"]').nth(1);
	await share.click();
	await expect(share).toHaveAttribute('aria-checked', 'true');
	await expect(page.locator('.frame .mz-axis-y text').last()).toContainText('%');
	await share.press('ArrowLeft');
	await expect(page.locator('.frame [role="radio"]').first()).toBeFocused();
});

test('table sorts and expands', async ({ page }) => {
	await page.goto('/gallery/table/');
	const rows = page.locator('.frame tbody tr');
	await expect(rows).toHaveCount(8);
	await page.locator('.frame .mz-table-more').click();
	await expect(rows).toHaveCount(12);
	await page.locator('.frame thead button', { hasText: 'District' }).click();
	await expect(page.locator('.frame thead th[aria-sort="ascending"]')).toContainText('District');
	await page.locator('.frame .mz-table-search').fill('bălți');
	await expect(rows).toHaveCount(1);
});

test('print preview applies print tokens and hides interactive parts', async ({ page }) => {
	await page.goto('/gallery/stacked-columns/');
	await page.getByLabel('Medium').selectOption('print');
	const figure = page.locator('.frame .mz-chart');
	await expect(figure).toHaveAttribute('data-mz-medium', 'print');
	await expect(figure.locator('[role="radiogroup"]')).toHaveCount(0);
	await expect(figure.locator('.mz-data-table')).toHaveCount(0);
});

test('llms.txt bundles docs, API and examples', async ({ request }) => {
	const response = await request.get('/llms.txt');
	expect(response.ok()).toBe(true);
	const text = await response.text();
	expect(text).toContain('# API reference');
	expect(text).toContain('### Bars (@samizdata/mozaic/marks)');
	expect(text).toContain('## Example: Choropleth map');
});

test('gallery has no horizontal scroll on phones @mobile', async ({ page }) => {
	await page.goto('/gallery/budget-bars/');
	await expect(page.locator('.frame .mz-chart')).toBeVisible();
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
	expect(overflow).toBeLessThanOrEqual(1);
	await expect(page.locator('.frame .mz-chart')).toHaveAttribute('data-mz-breakpoint', 's');
});
