<!--
@component
Text at data positions. Without `data`, draws a single label at `x`/`y`. With a projection on
`<Plot>`, `x`/`y` are longitude/latitude.
Newlines in the text become separate lines. `halo` adds an outline in the
background colour so text stays legible over marks.
-->
<script lang="ts" generics="T">
	import { usePlot } from '../core/context.js';
	import { access, type Accessor, type Value } from '../core/accessor.js';
	import { position } from '../core/scales.js';

	interface Props {
		data?: T[];
		x: Accessor<T, Value>;
		y: Accessor<T, Value>;
		text: Accessor<T, string>;
		dx?: number;
		dy?: number;
		anchor?: 'start' | 'middle' | 'end';
		/** Vertical alignment of the first line relative to y. */
		baseline?: 'top' | 'middle' | 'bottom';
		fill?: Accessor<T, string>;
		fontSize?: number | string;
		fontWeight?: number | string;
		halo?: boolean;
		lineHeight?: number;
		class?: string;
	}

	let {
		data = [undefined as T],
		x,
		y,
		text,
		dx = 0,
		dy = 0,
		anchor = 'start',
		baseline = 'middle',
		fill,
		fontSize,
		fontWeight,
		halo = false,
		lineHeight = 1.2,
		class: className = ''
	}: Props = $props();

	const plot = usePlot();
	const shift = $derived(baseline === 'top' ? '0.71em' : baseline === 'middle' ? '0.32em' : '0');
</script>

<g class="mz-text {className}" class:mz-halo={halo} font-size={fontSize} font-weight={fontWeight}>
	{#each data as d, i}
		{@const lines = String(access(text, d, i)).split('\n')}
		{@const [px, py] = position(plot, access(x, d, i), access(y, d, i))}
		<text x={px + dx} y={py + dy} text-anchor={anchor} style:fill={fill ? access(fill, d, i) : undefined}>
			{#each lines as line, l}
				<tspan x={px + dx} dy={l === 0 ? shift : `${lineHeight}em`}>{line}</tspan>
			{/each}
		</text>
	{/each}
</g>

<style>
	.mz-text text {
		fill: var(--mz-color-text);
		font-size: var(--mz-size-axis);
	}
	.mz-halo text {
		paint-order: stroke;
		stroke: var(--mz-color-bg);
		stroke-width: 3px;
		stroke-linejoin: round;
	}
</style>
