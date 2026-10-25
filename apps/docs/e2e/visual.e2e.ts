import { expect, test } from '@playwright/test';

// Pixel baselines for a few embeds in each style. Fonts differ between
// systems, so baselines are stored per platform; update with
// `pnpm test:visual --update-snapshots`.
const cases = ['budget-bars', 'regional-lines', 'raion-map', 'stacked-columns', 'small-multiples'];

for (const slug of cases)
	for (const style of ['samizdata', 'zdg'])
		test(`${slug} (${style}) looks the same @visual`, async ({ page }) => {
			await page.setViewportSize({ width: 680, height: 900 });
			await page.goto(`/embed/${slug}/${style}/en/`);
			await page.evaluate(() => document.fonts.ready);
			await expect(page.locator('.mz-chart')).toHaveScreenshot(`${slug}-${style}.png`, { maxDiffPixelRatio: 0.01 });
		});
