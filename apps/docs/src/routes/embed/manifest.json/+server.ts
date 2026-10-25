import { json } from '@sveltejs/kit';
import type { EmbedManifest } from 'mozaic/embed';
import { resolveStyle } from 'mozaic/styles';
import { examples } from '#lib/gallery/index.ts';
import { embedLocales, embedStyles } from '#lib/embeds.ts';

export const prerender = true;
export const trailingSlash = 'never';

export function GET() {
	const manifest: EmbedManifest = {
		project: 'mozaic-gallery',
		embeds: examples
			.filter((e) => e.kind !== 'story')
			.flatMap((example) =>
				embedStyles.flatMap((style) =>
					embedLocales.map((locale) => ({
						slug: example.slug,
						style,
						locale,
						title: example.title,
						path: `embed/${example.slug}/${style}/${locale}/`,
						print: Object.fromEntries(
							(example.print ?? []).map((name) => [name, resolveStyle(style).print.widths[name]])
						)
					}))
				)
			)
	};
	return json(manifest);
}
