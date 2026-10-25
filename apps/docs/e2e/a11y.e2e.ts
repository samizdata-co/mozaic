import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
	'/',
	'/gallery/',
	'/gallery/budget-bars/',
	'/gallery/table/',
	'/gallery/raion-map/',
	'/docs/getting-started/',
	'/api/',
	'/api/Bars/',
	'/embed/regional-lines/zdg/ro/'
];

for (const path of pages) {
	test(`no serious accessibility violations on ${path}`, async ({ page }) => {
		await page.goto(path);
		await page.locator('.mz-chart, main').first().waitFor();
		const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
		const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
		expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target}`)).toEqual([]);
	});
}
