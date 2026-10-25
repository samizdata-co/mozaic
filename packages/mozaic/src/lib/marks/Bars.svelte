<!--
@component
Bars from a baseline to a value. Orientation follows the scales: a band y
scale gives horizontal bars, a band x scale gives vertical columns. Bars are
capped at the theme's maximum thickness and centred in their band.

- Stacked: pass `base={d => d.start}` and the value as `d.end` (see `stack()`).
- Grouped: pass `group={d => d.series}`; each band is split between groups.
-->
<script lang="ts" generics="T">
	import { scaleBand } from 'd3-scale';
	import { useChart, usePlot } from '../core/context.js';
	import { access, type Accessor, type Value } from '../core/accessor.js';
	import { barPath } from './bar-path.js';

	interface Props {
		data: T[];
		/** Value (horizontal bars) or category (vertical bars). */
		x: Accessor<T, Value>;
		/** Category (horizontal bars) or value (vertical bars). */
		y: Accessor<T, Value>;
		/** Value where each bar starts. A function for stacked bars. */
		base?: Accessor<T, number>;
		/** Sub-category for grouped bars. */
		group?: (d: T) => string;
		/** Order of groups within a band. Defaults to first appearance. */
		groups?: string[];
		/** Space between grouped bars, as a fraction of their slot. */
		groupPadding?: number;
		fill?: Accessor<T, string>;
		opacity?: Accessor<T, number>;
		/** Corner radius at the data end. Defaults to the theme. Use 0 for stacks. */
		radius?: number;
		/** Maximum bar thickness in px. Defaults to the theme. */
		maxThickness?: number;
		/** Gap in px (background colour) around each bar; use 1–2 for stacked segments. */
		gap?: number;
		/** Accessible label per bar (adds a <title>). */
		title?: (d: T) => string;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		onclick?: (d: T, event: MouseEvent) => void;
		class?: string;
	}

	let {
		data,
		x,
		y,
		base = 0,
		group,
		groups,
		groupPadding = 0.1,
		fill,
		opacity = 1,
		radius,
		maxThickness,
		gap = 0,
		title,
		onpointerenter,
		onpointerleave,
		onclick,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const orientation = $derived(plot.y.bandwidth ? 'horizontal' : 'vertical');
	const band = $derived(orientation === 'horizontal' ? plot.y : plot.x);
	const valueScale = $derived(orientation === 'horizontal' ? plot.x : plot.y);
	const bandwidth = $derived(band.bandwidth?.() ?? 0);
	const inner = $derived(
		group
			? scaleBand<string>()
					.domain(groups ?? [...new Set(data.map(group))])
					.range([0, bandwidth])
					.paddingInner(groupPadding)
			: undefined
	);
	const slot = $derived(inner ? inner.bandwidth() : bandwidth);
	const thickness = $derived(Math.min(slot, maxThickness ?? chart.theme.plot.barMaxThickness));
	const r = $derived(radius ?? chart.theme.plot.barRadius);
	const defaultFill = $derived(chart.theme.palettes.categorical[0]);

	const bars = $derived(
		data.map((d, i) => {
			const category = access(orientation === 'horizontal' ? y : x, d, i);
			const value = access(orientation === 'horizontal' ? x : y, d, i);
			const offset = inner && group ? (inner(group(d)) ?? 0) : 0;
			const t0 = (band(category) ?? NaN) + offset + (slot - thickness) / 2;
			const b = valueScale(access(base, d, i)) ?? 0;
			return { d, path: barPath(orientation, b, valueScale(value) ?? b, t0, t0 + thickness, r) };
		})
	);
</script>

<g class="mz-bars {className}" stroke={gap ? 'var(--mz-color-bg)' : undefined} stroke-width={gap || undefined}>
	{#each bars as bar, i}
		<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
		<path
			d={bar.path}
			fill={fill ? access(fill, bar.d, i) : defaultFill}
			fill-opacity={access(opacity, bar.d, i)}
			onpointerenter={onpointerenter ? (e) => onpointerenter(bar.d, e) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(bar.d, e) : undefined}
			onclick={onclick ? (e) => onclick(bar.d, e) : undefined}
			>{#if title}<title>{title(bar.d)}</title>{/if}</path
		>
	{/each}
</g>
