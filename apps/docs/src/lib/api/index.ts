import { parseComponent, type ComponentDoc } from './parse';

const sources = import.meta.glob('../../../../../packages/mozaic/src/lib/*/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** Module order and one-line summaries for the API index. */
export const modules: { name: string; summary: string }[] = [
	{ name: 'frame', summary: 'The chart frame: title, subtitle, notes, source, logo, data table.' },
	{ name: 'core', summary: 'Plot area, layers, small multiples and the plot context.' },
	{ name: 'marks', summary: 'Shapes drawn from data.' },
	{ name: 'guides', summary: 'Axes, gridlines and legends.' },
	{ name: 'annotations', summary: 'Callouts, labels, reference lines and bands.' },
	{ name: 'interactive', summary: 'Tooltips, pointer tracking, toggles and scrollytelling.' },
	{ name: 'table', summary: 'Data tables and sparklines.' },
	{ name: 'embed', summary: 'Embed pages: auto-resize and export hooks.' },
	{ name: 'recipes', summary: 'Ready-made charts you can use or eject.' }
];

export const components: ComponentDoc[] = Object.entries(sources)
	.map(([path, source]) => {
		const parts = path.split('/');
		return parseComponent(parts[parts.length - 1].replace('.svelte', ''), parts[parts.length - 2], source);
	})
	.filter((c) => modules.some((m) => m.name === c.module))
	.sort((a, b) => a.name.localeCompare(b.name));

export function getComponent(name: string): ComponentDoc | undefined {
	return components.find((c) => c.name === name);
}
