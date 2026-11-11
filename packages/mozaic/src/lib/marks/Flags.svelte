<!--
@component
Flags as points, as in ggflags: one circular flag per datum at its x/y
position (scatter plots, dot plots, maps with a projection). Pass the flag for
each datum from `@samizdata/mozaic/flags`; rows without one are skipped. For a
one-axis strip of flags that do not overlap, use `Beeswarm` with `flag`.
-->
<script lang="ts" generics="T">
	import { usePlot } from '../core/context.js';
	import { position } from '../core/scales.js';
	import type { Accessor, Value } from '../core/accessor.js';
	import { access } from '../core/accessor.js';
	import Flag from './Flag.svelte';

	interface Props {
		data: T[];
		x: Accessor<T, Value>;
		y: Accessor<T, Value>;
		/** The datum's flag from `@samizdata/mozaic/flags`, or nothing to skip it. */
		flag: (d: T) => string | null | undefined;
		/** Radius in px. */
		r?: Accessor<T, number>;
		opacity?: Accessor<T, number>;
		/** Accessible name per flag, usually the country's name. */
		title?: (d: T) => string;
		onpointerenter?: (d: T, event: PointerEvent) => void;
		onpointerleave?: (d: T, event: PointerEvent) => void;
		class?: string;
	}

	let {
		data,
		x,
		y,
		flag,
		r = 8,
		opacity = 1,
		title,
		onpointerenter,
		onpointerleave,
		class: className = ''
	}: Props = $props();

	const plot = usePlot();

	const items = $derived(
		data.flatMap((d, i) => {
			const svg = flag(d);
			if (!svg) return [];
			const [cx, cy] = position(plot, access(x, d, i), access(y, d, i));
			return Number.isFinite(cx) && Number.isFinite(cy) ? [{ d, i, svg, cx, cy }] : [];
		})
	);
</script>

<g class="mz-flags {className}">
	{#each items as item (item.i)}
		<Flag
			svg={item.svg}
			cx={item.cx}
			cy={item.cy}
			r={access(r, item.d, item.i)}
			opacity={access(opacity, item.d, item.i)}
			title={title?.(item.d)}
			onpointerenter={onpointerenter ? (e) => onpointerenter(item.d, e) : undefined}
			onpointerleave={onpointerleave ? (e) => onpointerleave(item.d, e) : undefined}
		/>
	{/each}
</g>
