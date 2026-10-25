import { error } from '@sveltejs/kit';
import type { LocaleCode } from 'mozaic/locale';
import { styles, type StyleName } from 'mozaic/styles';
import { examples, getExample } from '#lib/gallery/index.ts';
import { embedLocales, embedStyles } from '#lib/embeds.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () =>
	examples
		.filter((e) => e.kind !== 'story')
		.flatMap((e) => embedStyles.flatMap((style) => embedLocales.map((locale) => ({ slug: e.slug, style, locale }))));

export const load: PageLoad = ({ params }) => {
	const example = getExample(params.slug);
	if (
		!example ||
		example.kind === 'story' ||
		!(params.style in styles) ||
		!embedLocales.includes(params.locale as LocaleCode)
	)
		error(404, 'No such embed');
	return { slug: example.slug, style: params.style as StyleName, locale: params.locale as LocaleCode };
};
