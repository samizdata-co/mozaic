import { error } from '@sveltejs/kit';
import { examples, getExample } from '#lib/gallery/index.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => examples.map((e) => ({ slug: e.slug }));

export const load: PageLoad = ({ params }) => {
	if (!getExample(params.slug)) error(404, 'No such example');
	return { slug: params.slug };
};
