import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { components, getComponent } from '#lib/api/index.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => components.map((c) => ({ name: c.name }));

export const load: PageLoad = ({ params }) => {
	const component = getComponent(params.name);
	if (!component) error(404, 'No such component');
	return { name: component.name, description: marked.parse(component.description, { async: false }) };
};
