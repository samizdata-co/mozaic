const files = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
	string,
	string
>;

export interface Doc {
	slug: string;
	title: string;
	/** Group in the sidebar. */
	section: string;
	markdown: string;
}

/** Docs pages from src/content/NN-slug.md, ordered by their number prefix. */
export const docs: Doc[] = Object.entries(files)
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([path, markdown]) => {
		const file = path.split('/').pop()!.replace('.md', '');
		const slug = file.replace(/^\d+-/, '');
		const title = /^#\s+(.+)$/m.exec(markdown)?.[1] ?? slug;
		const section = /^<!--\s*section:\s*(.+?)\s*-->/m.exec(markdown)?.[1] ?? 'Guides';
		return { slug, title, section, markdown };
	});

export function getDoc(slug: string): Doc | undefined {
	return docs.find((d) => d.slug === slug);
}
