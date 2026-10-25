import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import { docs, getDoc } from '#lib/content.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => docs.map((d) => ({ slug: d.slug }));

export const load: PageLoad = ({ params }) => {
	const doc = getDoc(params.slug);
	if (!doc) error(404, 'No such page');
	// Headings get ids so they can be linked to.
	const renderer = new marked.Renderer();
	renderer.heading = function ({ tokens, depth }) {
		const html = this.parser.parseInline(tokens);
		const id = html
			.replace(/<[^>]+>/g, '')
			.toLowerCase()
			.replace(/[^\p{L}\p{N}]+/gu, '-')
			.replace(/^-|-$/g, '');
		return `<h${depth} id="${id}">${html}</h${depth}>\n`;
	};
	// Scrollable code blocks must be reachable by keyboard.
	const code = renderer.code.bind(renderer);
	renderer.code = (token) => code(token).replace('<pre>', '<pre tabindex="0">');
	return { slug: doc.slug, title: doc.title, html: marked.parse(doc.markdown, { renderer, async: false }) };
};
