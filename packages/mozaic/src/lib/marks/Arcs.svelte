<!--
@component
Pie or donut slices centred in the plot area. Use sparingly: bars compare
values better. A donut (innerRadius 0.6) with ≤ 5 slices and direct labels
is the acceptable case.
-->
<script lang="ts" generics="T">
	import { arc, pie, type PieArcDatum } from 'd3-shape';
	import { useChart, usePlot } from '../core/context.js';
	import { access, type Accessor } from '../core/accessor.js';

	interface Props {
		data: T[];
		value: (d: T) => number;
		fill?: Accessor<T, string>;
		/** Inner radius as a fraction of the outer radius (0 = pie). */
		innerRadius?: number;
		/** Gap between slices, radians. */
		padAngle?: number;
		cornerRadius?: number;
		/** Keep data order (default) or sort largest first. */
		sort?: boolean;
		/** Text label drawn outside each slice. */
		label?: (d: T) => string;
		title?: (d: T) => string;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		class?: string;
	}

	let {
		data,
		value,
		fill,
		innerRadius = 0.6,
		padAngle = 0.01,
		cornerRadius = 0,
		sort = false,
		label,
		title,
		onpointerenter,
		onpointerleave,
		class: className = ''
	}: Props = $props();

	const chart = useChart();
	const plot = usePlot();

	const radius = $derived(Math.max(0, Math.min(plot.width, plot.height) / 2 - (label ? 24 : 0)));
	const slices = $derived.by(() => {
		const generator = pie<T>().value(value).padAngle(padAngle);
		return (sort ? generator.sort((a: T, b: T) => value(b) - value(a)) : generator.sort(null))(data);
	});
	const shape = $derived(
		arc<PieArcDatum<T>>()
			.innerRadius(radius * innerRadius)
			.outerRadius(radius)
			.cornerRadius(cornerRadius)
	);
	const labelArc = $derived(
		arc<PieArcDatum<T>>()
			.innerRadius(radius + 12)
			.outerRadius(radius + 12)
	);
</script>

<g class="mz-arcs {className}" transform="translate({plot.width / 2},{plot.height / 2})">
	{#each slices as slice, i}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<path
			d={shape(slice) ?? ''}
			fill={fill
				? access(fill, slice.data, i)
				: chart.theme.palettes.categorical[i % chart.theme.palettes.categorical.length]}
			stroke="var(--mz-color-bg)"
			stroke-width={1}
			onpointerenter={onpointerenter ? (e) => onpointerenter(slice.data, e) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(slice.data, e) : undefined}
			>{#if title}<title>{title(slice.data)}</title>{/if}</path
		>
		{#if label}
			{@const [lx, ly] = labelArc.centroid(slice)}
			<text x={lx} y={ly} dy="0.32em" text-anchor={lx >= 0 ? 'start' : 'end'}>{label(slice.data)}</text>
		{/if}
	{/each}
</g>

<style>
	text {
		fill: var(--mz-color-text);
		font-size: var(--mz-size-axis);
	}
</style>
