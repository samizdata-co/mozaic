import { describe, expect, it } from 'vitest';
import { parseComponent, parseDefaults, parseMembers } from './parse';

const source = `<!--
@component
Draws things.

More detail.
-->
<script lang="ts" generics="T">
	interface Props {
		/** The rows. */
		data: T[];
		/**
		 * Accessor
		 * for x.
		 */
		x: (d: T, i: number) => number;
		fill?: Accessor<T, string>;
		groups?: { value: string; label: string }[];
		children?: Snippet<[PlotContext]>;
	}

	let { data, x, fill = 'red', groups = [], value = $bindable(), class: className = '', children }: Props = $props();
</script>`;

describe('parseComponent', () => {
	const doc = parseComponent('Thing', 'marks', source);

	it('reads description and generics', () => {
		expect(doc.description).toBe('Draws things.\n\nMore detail.');
		expect(doc.generics).toBe('T');
	});

	it('reads props with types, optionality and JSDoc', () => {
		expect(doc.props.map((p) => p.name)).toEqual(['data', 'x', 'fill', 'groups', 'children']);
		expect(doc.props[0]).toMatchObject({ type: 'T[]', optional: false, description: 'The rows.' });
		expect(doc.props[1]).toMatchObject({ type: '(d: T, i: number) => number', description: 'Accessor for x.' });
		expect(doc.props[3].type).toBe('{ value: string; label: string }[]');
		expect(doc.props[4].type).toBe('Snippet<[PlotContext]>');
	});

	it('attaches defaults', () => {
		expect(doc.props.find((p) => p.name === 'fill')?.default).toBe("'red'");
		expect(doc.props.find((p) => p.name === 'groups')?.default).toBe('[]');
	});

	it('handles inline prop types', () => {
		const inline = parseComponent(
			'Html',
			'core',
			`<script lang="ts">\n\tlet { class: className = '', children }: { class?: string; children?: Snippet } = $props();\n</script>`
		);
		expect(inline.props.map((p) => [p.name, p.type, p.default])).toEqual([
			['class', 'string', "''"],
			['children', 'Snippet', undefined]
		]);
	});
});

describe('comments', () => {
	it('ignores apostrophes and brackets inside doc comments', () => {
		const doc = parseComponent(
			'C',
			'frame',
			`<script lang="ts">\n\tinterface Props {\n\t\t/** Defaults to the style's locale (see \`x\`). */\n\t\tlocale?: string;\n\t\twidth?: number;\n\t}\n\tlet { locale, width: fixedWidth }: Props = $props();\n</script>`
		);
		expect(doc.props.map((p) => p.name)).toEqual(['locale', 'width']);
		expect(doc.props[0].description).toBe("Defaults to the style's locale (see `x`).");
	});
});

describe('helpers', () => {
	it('parses members separated by newlines without semicolons', () => {
		expect(parseMembers('a: number\n b?: string').map((p) => p.name)).toEqual(['a', 'b']);
	});

	it('parses defaults with nested values', () => {
		expect(parseDefaults('let { a = { x: 1, y: 2 }, b: c = fn(1, 2) }: P = $props();')).toEqual({
			a: '{ x: 1, y: 2 }',
			b: 'fn(1, 2)'
		});
	});
});
