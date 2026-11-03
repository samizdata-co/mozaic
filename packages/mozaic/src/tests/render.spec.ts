import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { renderDocument } from './dom.js';
import BarsFixture from './fixtures/BarsFixture.svelte';
import MarksFixture from './fixtures/MarksFixture.svelte';
import GroupedFixture from './fixtures/GroupedFixture.svelte';
import GeoFixture from './fixtures/GeoFixture.svelte';
import CompoundFixture from './fixtures/CompoundFixture.svelte';
import GuidesFixture from './fixtures/GuidesFixture.svelte';
import TableFixture from './fixtures/TableFixture.svelte';
import FacetsFixture from './fixtures/FacetsFixture.svelte';
import ControlsFixture from './fixtures/ControlsFixture.svelte';
import EdgeAxisFixture from './fixtures/EdgeAxisFixture.svelte';
import ElectionFixture from './fixtures/ElectionFixture.svelte';
import EmbeddedFixture from './fixtures/EmbeddedFixture.svelte';
import DownloadsFixture from './fixtures/DownloadsFixture.svelte';
import { gazeta, paper } from './fixtures/themes.js';

const finite = (value: string | null) => value !== null && !/NaN|undefined/.test(value);

describe('Chart frame', () => {
	it('sets style, language and ARIA wiring', () => {
		const { $ } = renderDocument(BarsFixture, { style: gazeta, locale: 'ro' });
		const figure = $('figure.mz-chart')!;
		expect(figure.getAttribute('data-mz-style')).toBe('gazeta');
		expect(figure.getAttribute('lang')).toBe('ro-MD');
		const titleId = $('h2.mz-title')!.getAttribute('id');
		expect(titleId).toBeTruthy();
		expect(figure.getAttribute('aria-labelledby')).toBe(titleId);
		const svg = $('svg.mz-svg')!;
		expect(svg.getAttribute('role')).toBe('img');
		expect(svg.getAttribute('aria-labelledby')).toBe(titleId);
		expect($(`#${svg.getAttribute('aria-describedby')}`)!.textContent).toBe('Test bars');
	});

	it('applies the style tokens inline', () => {
		const { $ } = renderDocument(BarsFixture, { style: paper });
		expect($('figure')!.getAttribute('style')).toContain('--mz-color-accent: #9f1853');
	});

	it('loads the style fonts and shows the house logo', () => {
		const withText = renderDocument(BarsFixture, { style: paper });
		expect(withText.$('.mz-logo')!.getAttribute('aria-label')).toBe('PAPER');
		expect(withText.$('.mz-logo svg')).not.toBeNull();
		expect(withText.$('.mz-logo-text')!.textContent).toBe('PAPER');
		const svgOnly = renderDocument(BarsFixture, { style: gazeta });
		expect(svgOnly.$('.mz-logo')!.getAttribute('aria-label')).toBe('Gazeta');
		expect(svgOnly.$('.mz-logo-text')).toBeNull();
		expect(render(BarsFixture, { props: { style: paper } }).head).toContain('fonts.bunny.net/css?family=work-sans');
		expect(render(BarsFixture).head).not.toContain('fonts.bunny.net');
	});

	it('translates frame labels', () => {
		expect(renderDocument(BarsFixture, { locale: 'en' }).$('.mz-source')!.textContent).toContain('Source:');
		expect(renderDocument(BarsFixture, { locale: 'ro' }).$('.mz-source')!.textContent).toContain('Sursa:');
		expect(renderDocument(BarsFixture, { locale: 'ru' }).$('.mz-source')!.textContent).toContain('Источник:');
	});

	it('formats axis numbers per locale', () => {
		const ticks = (locale: 'en' | 'ro' | 'ru') =>
			renderDocument(BarsFixture, { locale })
				.$$('.mz-axis-x text')
				.map((t) => t.textContent?.trim());
		expect(ticks('en')).toContain('1,000');
		expect(ticks('ro')).toContain('1.000');
		expect(ticks('ru')).toContain('1 000');
	});

	it('anchors axis labels inwards at the chart edges', () => {
		const anchors = renderDocument(EdgeAxisFixture)
			.$$('.mz-axis-x text')
			.map((t) => t.getAttribute('text-anchor'));
		expect(anchors).toEqual(['start', 'middle', 'end']);
		const centred = renderDocument(BarsFixture, { orientation: 'vertical' })
			.$$('.mz-axis-x text')
			.map((t) => t.getAttribute('text-anchor'));
		expect(centred).toEqual(['middle', 'middle', 'middle']);
	});

	it('sizes the HTML layer in percentages until the plot is measured', () => {
		const fluid = renderDocument(BarsFixture, { fluid: true }).$('.mz-html')!.getAttribute('style')!;
		expect(fluid).toMatch(/width: [\d.]+%/);
		expect(fluid).not.toContain('px');
		const fixed = renderDocument(BarsFixture).$('.mz-html')!.getAttribute('style')!;
		expect(fixed).toMatch(/width: [\d.]+px/);
	});

	it('shows the embed code under the chart, except in print and inside an embed', () => {
		const embed = { src: '/embed/bars/ro/', scriptSrc: '/embed.js', title: 'Bare' };
		const { $ } = renderDocument(BarsFixture, { locale: 'ro', embed });
		const button = $('.mz-chart-tools .mz-tool')!;
		expect(button.getAttribute('aria-label')).toBe('Încorporează');
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect($('.mz-embed-code')!.hasAttribute('hidden')).toBe(true);
		const code = $('.mz-embed-code textarea')!;
		expect(code.getAttribute('aria-label')).toBe('Codul de încorporare');
		expect(code.textContent).toContain('src="/embed/bars/ro/" title="Bare"');
		expect(code.textContent).toContain('script src="/embed.js" async');
		expect(renderDocument(BarsFixture).$('.mz-embed-code')).toBeNull();
		expect(renderDocument(BarsFixture, { medium: 'print', embed }).$('.mz-embed-code')).toBeNull();
		const embedded = renderDocument(EmbeddedFixture);
		expect(embedded.$('.mz-chart')).not.toBeNull();
		expect(embedded.$('.mz-embed-code')).toBeNull();
	});

	it('offers PNG and SVG downloads when asked, or under setDownloads()', () => {
		expect(renderDocument(BarsFixture).$('.mz-image-download')).toBeNull();
		const own = renderDocument(BarsFixture, { locale: 'ro', download: 'bars' });
		expect(own.$('.mz-tool')!.getAttribute('aria-label')).toBe('Descarcă');
		expect(own.$$('.mz-image-download button').map((b) => b.textContent)).toEqual(['PNG', 'SVG']);
		expect(renderDocument(DownloadsFixture).$('.mz-image-download')).not.toBeNull();
		expect(renderDocument(DownloadsFixture, { download: false }).$('.mz-image-download')).toBeNull();
		expect(renderDocument(BarsFixture, { medium: 'print', download: true }).$('.mz-chart-tools')).toBeNull();
	});

	it('uses print tokens and drops interactive layers in print', () => {
		const web = renderDocument(BarsFixture);
		expect(web.$('.mz-tooltip')).not.toBeNull();
		const print = renderDocument(BarsFixture, { medium: 'print' });
		expect(print.$('.mz-tooltip')).toBeNull();
		expect(print.$('.mz-html')).toBeNull();
		expect(print.$('figure')!.getAttribute('style')).toContain('--mz-size-axis: 6.5pt');
	});
});

describe('Bars', () => {
	it('draws one path per datum in both orientations', () => {
		for (const orientation of ['horizontal', 'vertical'] as const) {
			const { $$ } = renderDocument(BarsFixture, { orientation });
			const paths = $$('.mz-bars path');
			expect(paths).toHaveLength(3);
			expect(paths.every((p) => finite(p.getAttribute('d')))).toBe(true);
		}
	});

	it('starts negative bars at the baseline', () => {
		const { $$ } = renderDocument(BarsFixture);
		const zeroLine = $$('.mz-bars path')[2].getAttribute('d')!;
		// Plot is 400 wide minus theme padding (40 + 16); x(0) for domain [-100, 1500] is 344 * 100/1600 = 21.5.
		expect(zeroLine.startsWith('M21.5,')).toBe(true);
	});

	it('splits bands for grouped bars and stacks with base', () => {
		const grouped = renderDocument(GroupedFixture, { mode: 'grouped' }).$$('.mz-bars path');
		expect(grouped).toHaveLength(4);
		const stacked = renderDocument(GroupedFixture, { mode: 'stacked' });
		expect(stacked.$$('.mz-bars path')).toHaveLength(4);
		expect(stacked.$('.mz-bars')!.getAttribute('stroke-width')).toBe('1');
	});
});

describe('marks and annotations', () => {
	const { $, $$ } = renderDocument(MarksFixture);

	it('renders lines and areas with gaps for missing values', () => {
		const line = $('.mz-line')!.getAttribute('d')!;
		expect(finite(line)).toBe(true);
		expect(line.match(/M/g)).toHaveLength(2);
		expect(finite($('.mz-area')!.getAttribute('d'))).toBe(true);
	});

	it('skips points with missing values', () => {
		expect($$('.mz-points circle')).toHaveLength(4);
		expect($('.mz-points title')!.textContent).toBe('point 0');
	});

	it('renders rects, rules, gridlines and multi-line text', () => {
		expect($$('.mz-rects rect')).toHaveLength(1);
		expect($$('.mz-rules line')).toHaveLength(2);
		expect($$('.mz-grid-y line').length).toBeGreaterThan(2);
		expect($$('.mz-text tspan').map((t) => t.textContent)).toEqual(['line one', 'line two']);
	});

	it('renders annotations', () => {
		expect($('.mz-callout text')!.textContent).toContain('callout-label');
		expect($$('.mz-callout path')).toHaveLength(2);
		expect($('.mz-ref-line text')!.textContent).toBe('target');
		expect($('.mz-ref-band text')!.textContent).toBe('band-label');
		expect($('.mz-label circle')).not.toBeNull();
		expect(finite($('.mz-arrow path')!.getAttribute('d'))).toBe(true);
	});

	it('nudges overlapping end labels apart', () => {
		const ys = $$('.mz-line-end-labels text').map((t) => Number(t.getAttribute('y')));
		expect(Math.abs(ys[0] - ys[1])).toBeGreaterThanOrEqual(14);
	});
});

describe('geo', () => {
	it('projects features and lon/lat points', () => {
		const { $ } = renderDocument(GeoFixture);
		expect(finite($('.mz-geo path')!.getAttribute('d'))).toBe(true);
		const circle = $('.mz-points circle')!;
		expect(Number(circle.getAttribute('cx'))).toBeCloseTo(150, 0);
		expect($('.mz-text text')).not.toBeNull();
	});
});

describe('compound marks', () => {
	it('treemap: one cell per item, labels where they fit', () => {
		const { $$ } = renderDocument(CompoundFixture, { kind: 'treemap' });
		expect($$('.mz-treemap rect')).toHaveLength(4);
		expect($$('.mz-treemap text').length).toBeGreaterThan(0);
	});

	it('waffle: total squares', () => {
		expect(renderDocument(CompoundFixture, { kind: 'waffle' }).$$('.mz-waffle rect')).toHaveLength(40);
	});

	it('dumbbell: two dots per row', () => {
		expect(renderDocument(CompoundFixture, { kind: 'dumbbell' }).$$('.mz-dumbbell circle')).toHaveLength(8);
	});

	it('arrows: a line and a head per row, pointing from start to end', () => {
		const { $$ } = renderDocument(CompoundFixture, { kind: 'arrows' });
		expect($$('.mz-arrows-line')).toHaveLength(4);
		const heads = $$('.mz-arrows-head').map((p) =>
			p
				.getAttribute('d')!
				.match(/-?[\d.]+/g)!
				.map(Number)
		);
		expect(heads).toHaveLength(4);
		// The tip is the first point; the base is behind it: left of it for Alpha (10 → 14), right for Beta (6 → 4).
		expect(heads[0][2]).toBeLessThan(heads[0][0]);
		expect(heads[1][2]).toBeGreaterThan(heads[1][0]);
	});

	it('slope: one line per item plus two axes, and headings', () => {
		const { $$ } = renderDocument(CompoundFixture, { kind: 'slope' });
		expect($$('.mz-slope line')).toHaveLength(6);
		expect($$('.mz-slope-heading').map((t) => t.textContent)).toEqual(['2015', '2025']);
	});

	it('beeswarm: no overlapping dots', () => {
		const dots = renderDocument(CompoundFixture, { kind: 'beeswarm' })
			.$$('.mz-beeswarm circle')
			.map((c) => [Number(c.getAttribute('cx')), Number(c.getAttribute('cy'))]);
		expect(dots).toHaveLength(8);
		for (let i = 0; i < dots.length; i++)
			for (let j = i + 1; j < dots.length; j++)
				expect(Math.hypot(dots[i][0] - dots[j][0], dots[i][1] - dots[j][1])).toBeGreaterThanOrEqual(8);
	});

	it('arcs: one slice and label per item', () => {
		const { $$ } = renderDocument(CompoundFixture, { kind: 'arcs' });
		expect($$('.mz-arcs path')).toHaveLength(4);
		expect($$('.mz-arcs text')).toHaveLength(4);
	});
});

describe('guides', () => {
	const { $$, $ } = renderDocument(GuidesFixture);

	it('builds threshold and ordinal legends', () => {
		const legends = $$('.mz-legend');
		expect(legends[0].textContent).toContain('< 10');
		expect(legends[0].textContent).toContain('10–20');
		expect(legends[0].textContent).toContain('≥ 20');
		expect(legends[1].textContent).toContain('North');
	});

	it('draws a colour ramp with locale-formatted ticks', () => {
		expect($$('.mz-color-ramp stop').length).toBeGreaterThan(10);
		expect($$('.mz-color-ramp text').map((t) => t.textContent)).toContain('1.000');
	});

	it('draws size legend circles and inline keys', () => {
		expect($$('.mz-size-legend circle')).toHaveLength(2);
		expect($('.mz-key')!.textContent).toContain('health');
	});
});

describe('Table and data access', () => {
	const { $ } = renderDocument(TableFixture);
	const table = $('.mz-table')!;

	it('sorts by the initial column and limits rows', () => {
		const rows = [...table.querySelectorAll('tbody tr')];
		expect(rows).toHaveLength(3);
		expect(rows[0].querySelector('th')!.textContent).toBe('Bălți');
		expect($('.mz-table-more')!.textContent).toContain('5');
	});

	it('formats numbers per locale and renders cell types', () => {
		expect(table.textContent).toContain('1.200');
		expect(table.textContent).toContain('30,5');
		expect(table.querySelectorAll('.mz-cell-bar')).toHaveLength(3);
		expect(table.querySelectorAll('.mz-sparkline')).toHaveLength(3);
		const heat = [...table.querySelectorAll('td')].find((td) =>
			td.getAttribute('style')?.includes('background: #123b78')
		)!;
		expect(heat.getAttribute('style')).toContain('color: #ffffff');
	});

	it('exposes sorting state to assistive technology', () => {
		expect(table.querySelector('th[aria-sort="descending"]')!.textContent).toContain('Value');
	});

	it('offers a data table and a CSV download', () => {
		const button = $('.mz-chart-tools .mz-tool')!;
		expect(button.getAttribute('aria-label')).toBe('Arată datele');
		expect(button.getAttribute('aria-controls')).toBe($('.mz-chart-tools .mz-data-table')!.getAttribute('id'));
		expect($('.mz-chart-tools .mz-data-table table')).not.toBeNull();
		const link = $('.mz-data-download')!;
		expect(link.getAttribute('download')).toBe('districts.csv');
		expect(decodeURIComponent(link.getAttribute('href')!)).toContain('District,Value');
	});
});

describe('layout and controls', () => {
	it('renders one facet per group with titles', () => {
		const { $$, $ } = renderDocument(FacetsFixture);
		expect($$('.mz-facet')).toHaveLength(3);
		expect($$('.mz-facet-title').map((t) => t.textContent)).toEqual(['panel A', 'panel B', 'panel C']);
		expect($('.mz-facets')!.getAttribute('style')).toContain('repeat(2,');
	});

	it('renders an accessible button group and scroller steps', () => {
		const { $, $$ } = renderDocument(ControlsFixture);
		expect($('[role="radiogroup"]')!.getAttribute('aria-label')).toBe('Measure');
		expect($('[aria-checked="true"]')!.textContent?.trim()).toBe('Option B');
		expect($$('.mz-scroller-step')).toHaveLength(2);
		expect($('.graphic')!.textContent).toBe('graphic 0');
	});

	it('hides controls in print', () => {
		expect(renderDocument(ControlsFixture, { medium: 'print' }).$('[role="radiogroup"]')).toBeNull();
	});
});

describe('Election marks', () => {
	it('draws one seat per seat, party by party, inside the plot', () => {
		const { $, $$ } = renderDocument(ElectionFixture);
		const parties = $$('.mz-hemicycle-party');
		expect(parties.map((g) => g.querySelectorAll('circle').length)).toEqual([55, 26, 20]);
		expect(parties.map((g) => g.getAttribute('fill'))).toEqual(['#e0a800', '#d7263d', '#14a38b']);
		expect(parties[0].querySelector('title')!.textContent).toBe('A: 55');
		for (const c of $$('.mz-hemicycle circle')) {
			const [cx, cy, r] = ['cx', 'cy', 'r'].map((a) => Number(c.getAttribute(a)));
			expect(cx - r).toBeGreaterThanOrEqual(-0.01);
			expect(cx + r).toBeLessThanOrEqual(400 - 40 - 16 + 0.01);
			expect(cy + r).toBeLessThanOrEqual(200 + 0.01);
		}
		expect($('.mz-hemicycle-majority')).not.toBeNull();
		expect($('.mz-hemicycle-label')!.textContent).toBe('51 for a majority');
		expect($('.mz-hemicycle .total')!.textContent).toBe('101');
		// The first party fills from the left: its seats are left of the centre on average.
		const xs = [...parties[0].querySelectorAll('circle')].map((c) => Number(c.getAttribute('cx')));
		expect(Math.min(...xs)).toBeLessThan(50);
	});

	it('leaves unfilled seats empty when the chamber is bigger', () => {
		const { $$ } = renderDocument(ElectionFixture, { total: 110 });
		expect($$('.mz-hemicycle-empty circle')).toHaveLength(9);
	});

	it('draws a range bar and a dot per interval', () => {
		const { $$ } = renderDocument(ElectionFixture);
		const ranges = $$('.mz-interval-range');
		expect(ranges).toHaveLength(3);
		expect($$('.mz-interval-dot')).toHaveLength(3);
		for (const el of [...ranges, ...$$('.mz-interval-dot')])
			for (const a of el.getAttributeNames()) expect(finite(el.getAttribute(a)), a).toBe(true);
		const width = Number(ranges[0].getAttribute('width'));
		expect(width).toBeCloseTo(((54 - 46) / 60) * (400 - 40 - 16), 0);
	});
});
