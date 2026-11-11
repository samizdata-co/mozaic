<!--
@component
A beeswarm: one dot per datum along the x scale, nudged vertically so dots
do not overlap. With a band y scale, each category gets its own swarm.
Pass `flag` to draw countries as circular flags instead of dots.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { scaled } from '../core/scales.js';
	import { access, type Accessor } from '../core/accessor.js';
	import { dodge } from '../transforms/dodge.js';
	import Flag from './Flag.svelte';

	interface Props {
		data: T[];
		x: (d: T) => number;
		/** Category on a band y scale; omit for a single swarm across the middle. */
		y?: (d: T) => string;
		r?: number;
		padding?: number;
		fill?: Accessor<T, string>;
		opacity?: Accessor<T, number>;
		/** The datum's flag from `@samizdata/mozaic/flags`, drawn as a circle of radius `r` instead of a dot. */
		flag?: (d: T) => string | null | undefined;
		title?: (d: T) => string;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		class?: string;
	}

	let {
		data,
		x,
		y,
		r = 4,
		padding = 1,
		fill,
		flag,
		opacity = 1,
		title,
		onpointerenter,
		onpointerleave,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const dots = $derived.by(() => {
		// A local, throwaway index: rebuilt on every change, never observed.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const groups = new Map<string, number[]>();
		data.forEach((d, i) => {
			const key = y ? y(d) : '';
			groups.set(key, [...(groups.get(key) ?? []), i]);
		});
		const out = new Array<{ d: T; cx: number; cy: number }>(data.length);
		for (const [key, indices] of groups) {
			const xs = indices.map((i) => plot.x(x(data[i])) ?? NaN);
			const offsets = dodge(xs, r, { padding });
			const centre = y ? scaled(plot.y, key) : plot.height / 2;
			indices.forEach((i, k) => (out[i] = { d: data[i], cx: xs[k], cy: centre + offsets[k] }));
		}
		return out;
	});
</script>

<g class="mz-beeswarm {className}">
	{#each dots as dot, i}
		{@const svg = flag?.(dot.d)}
		{#if svg}
			<Flag
				{svg}
				cx={dot.cx}
				cy={dot.cy}
				{r}
				opacity={access(opacity, dot.d, i)}
				title={title?.(dot.d)}
				onpointerenter={onpointerenter ? (e) => onpointerenter(dot.d, e) : undefined}
				onpointerleave={onpointerleave ? (e) => onpointerleave(dot.d, e) : undefined}
			/>
		{:else}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<circle
				cx={dot.cx}
				cy={dot.cy}
				{r}
				fill={fill ? access(fill, dot.d, i) : chart.theme.palettes.categorical[0]}
				fill-opacity={access(opacity, dot.d, i)}
				onpointerenter={onpointerenter ? (e) => onpointerenter(dot.d, e) : undefined}
				onpointerleave={onpointerleave ? (e) => onpointerleave(dot.d, e) : undefined}
				>{#if title}<title>{title(dot.d)}</title>{/if}</circle
			>
		{/if}
	{/each}
</g>

<style>
	.mz-beeswarm > circle {
		stroke: var(--mz-color-bg);
		stroke-width: 1;
	}
</style>
