<!--
@component
Dots at data positions (scatter plots, dot plots, proportional symbols on
maps). With a projection on `<Plot>`, `x`/`y` are longitude/latitude.
Each dot has a ring in the background colour so overlaps stay legible.
-->
<script lang="ts" generics="T">
	import { useChart, usePlot } from '../core/context.js';
	import { position } from '../core/scales.js';
	import { access, type Accessor, type Value } from '../core/accessor.js';

	interface Props {
		data: T[];
		x: Accessor<T, Value>;
		y: Accessor<T, Value>;
		/** Radius in px. Use a d3 `scaleSqrt` for sizes proportional to area. */
		r?: Accessor<T, number>;
		fill?: Accessor<T, string>;
		/** Ring colour; defaults to the background. */
		stroke?: Accessor<T, string>;
		strokeWidth?: number;
		opacity?: Accessor<T, number>;
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
		r = 4,
		fill,
		stroke = 'var(--mz-color-bg)',
		strokeWidth = 1.5,
		opacity = 1,
		title,
		onpointerenter,
		onpointerleave,
		onclick,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();
	const defaultFill = $derived(chart.theme.palettes.categorical[0]);
</script>

<g class="mz-points {className}" stroke-width={strokeWidth}>
	{#each data as d, i}
		{@const [cx, cy] = position(plot, access(x, d, i), access(y, d, i))}
		{#if Number.isFinite(cx) && Number.isFinite(cy)}
			<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
			<circle
				{cx}
				{cy}
				r={access(r, d, i)}
				fill={fill ? access(fill, d, i) : defaultFill}
				fill-opacity={access(opacity, d, i)}
				style:stroke={access(stroke, d, i)}
				onpointerenter={onpointerenter ? (e) => onpointerenter(d, e) : undefined}
				onpointerleave={onpointerleave ? (e) => onpointerleave(d, e) : undefined}
				onclick={onclick ? (e) => onclick(d, e) : undefined}
				>{#if title}<title>{title(d)}</title>{/if}</circle
			>
		{/if}
	{/each}
</g>
