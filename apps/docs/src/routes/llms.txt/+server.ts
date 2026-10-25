import { components } from '#lib/api/index.ts';
import { docs } from '#lib/content.ts';
import { examples } from '#lib/gallery/index.ts';

export const prerender = true;
export const trailingSlash = 'never';

/** Everything an AI model needs to write mozaic charts, as one plain-text file. */
export function GET() {
	const api = components
		.map((c) => {
			const props = c.props
				.map(
					(p) =>
						`  - ${p.name}${p.optional ? '?' : ''}: ${p.type}${p.default ? ` = ${p.default}` : ''}${p.description ? ` — ${p.description}` : ''}`
				)
				.join('\n');
			return `### ${c.name} (mozaic/${c.module})\n${c.description}\n${props}`;
		})
		.join('\n\n');
	const gallery = examples
		.map((e) => `## Example: ${e.title}\n${e.description}\n\n\`\`\`svelte\n${e.source}\n\`\`\``)
		.join('\n\n');
	const body = `# mozaic\n\n> Svelte 5 + d3 chart library with house styles, embeds and print export.\n\n${docs.map((d) => d.markdown).join('\n\n')}\n\n# API reference\n\n${api}\n\n# Gallery\n\n${gallery}\n`;
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
