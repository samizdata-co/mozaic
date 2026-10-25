import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { examples } from './index';
import { components } from '../api';
import * as mozaic from 'mozaic';

const styles = ['base', 'samizdata', 'zdg'] as const;
const locales = ['en', 'ro', 'ru'] as const;

describe('gallery examples', () => {
	for (const example of examples) {
		it(`${example.slug} renders in every style, language and medium`, () => {
			for (const style of styles)
				for (const locale of locales)
					for (const medium of ['web', 'print'] as const) {
						const { body } = render(example.component, { props: { style, locale, medium } });
						expect(body, `${style}/${locale}/${medium}`).toContain('mz-chart');
						expect(body, `${style}/${locale}/${medium}`).not.toMatch(/NaN|undefined|\[object Object\]/);
					}
		});
	}

	it('every example has a description, tags and its source', () => {
		for (const e of examples) {
			expect(e.description.length).toBeGreaterThan(20);
			expect(e.tags.length).toBeGreaterThan(0);
			expect(e.source).toContain('<script');
		}
	});
});

describe('API reference', () => {
	it('documents every component the library exports', () => {
		const exported = Object.entries(mozaic)
			.filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function' && !['PX_PER_MM'].includes(name))
			.map(([name]) => name);
		const documented = new Set(components.map((c) => c.name));
		expect(exported.filter((name) => !documented.has(name))).toEqual([]);
	});

	it('lists each prop once', () => {
		for (const c of components) {
			const names = c.props.map((p) => p.name);
			expect(names, c.name).toEqual([...new Set(names)]);
		}
	});

	it('gives every component a description and every prop a type', () => {
		for (const c of components) {
			expect(c.description, c.name).not.toBe('');
			for (const p of c.props) expect(p.type, `${c.name}.${p.name}`).not.toBe('');
		}
	});
});
