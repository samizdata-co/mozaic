import { json } from '@sveltejs/kit';
import type { EmbedManifest } from 'mozaic/embed';
import { resolveStyle } from 'mozaic/styles';
import { charts } from '../../../charts';
import { config } from '../../../../mozaic.config';

export const prerender = true;
export const trailingSlash = 'never';

/** Lists every embed page for `mozaic export`. */
export function GET() {
	const theme = resolveStyle(config.style);
	const manifest: EmbedManifest = {
		project: config.project,
		embeds: charts.flatMap((chart) =>
			config.locales.map((locale) => ({
				slug: chart.slug,
				style: config.style,
				locale,
				title: chart.title(locale),
				path: `embed/${chart.slug}/${locale}/`,
				print: Object.fromEntries(chart.print.map((name) => [name, theme.print.widths[name]]))
			}))
		)
	};
	return json(manifest);
}
