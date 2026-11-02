<!--
@component
An SVG layer covering the whole `<Plot>`. Children are drawn in plot-area
coordinates (the padding is already applied). Anything that must print
belongs in an `<Svg>` layer.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useChart, usePlot } from './context.js';

	interface Props {
		/** Content for `<defs>` (gradients, patterns, clip paths). */
		defs?: Snippet;
		/** Hide this layer from assistive technology (e.g. a second, decorative layer). */
		decorative?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { defs, decorative = false, class: className = '', children }: Props = $props();

	const plot = usePlot();
	const chart = useChart();
</script>

<svg
	class="mz-layer mz-svg {className}"
	xmlns="http://www.w3.org/2000/svg"
	width={plot.fullWidth}
	height={plot.fullHeight}
	viewBox="0 0 {plot.fullWidth} {plot.fullHeight}"
	role={decorative ? 'presentation' : 'img'}
	aria-hidden={decorative ? 'true' : undefined}
	aria-labelledby={decorative
		? undefined
		: chart.ids.hasTitle
			? chart.ids.title
			: chart.ids.hasDesc
				? chart.ids.desc
				: undefined}
	aria-describedby={!decorative && chart.ids.hasTitle && chart.ids.hasDesc ? chart.ids.desc : undefined}
>
	{#if defs}<defs>{@render defs()}</defs>{/if}
	<g transform="translate({plot.padding.left},{plot.padding.top})">
		{@render children?.()}
	</g>
</svg>

<style>
	.mz-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		font-family: var(--mz-font-body);
	}
</style>
