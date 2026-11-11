<!--
@component
One flag drawn as a circle at a pixel position, as in ggflags. Pass a flag
from `@samizdata/mozaic/flags`. A hairline ring keeps white and pale flags
visible on the background. Used by `Flags`, `Beeswarm`, `BarChart` and
`StripChart`; use it directly to put a flag beside a label or annotation.
-->
<script lang="ts">
	interface Props {
		/** A flag from `@samizdata/mozaic/flags` (inner SVG markup on a 512 × 512 viewBox). */
		svg: string;
		/** Centre in px. */
		cx: number;
		cy: number;
		/** Radius in px. */
		r?: number;
		/** Ring colour; defaults to the border token. Use `none` for no ring. */
		stroke?: string;
		strokeWidth?: number;
		/** Accessible name (adds a <title>), usually the country's name. */
		title?: string;
		opacity?: number;
		onpointerenter?: (event: PointerEvent) => void;
		onpointerleave?: (event: PointerEvent) => void;
		class?: string;
	}

	let {
		svg,
		cx,
		cy,
		r = 8,
		stroke = 'var(--mz-color-border)',
		strokeWidth = 1,
		title,
		opacity = 1,
		onpointerenter,
		onpointerleave,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
</script>

<g
	class="mz-flag {className}"
	transform="translate({cx - r} {cy - r})"
	{opacity}
	role={title ? 'img' : undefined}
	aria-label={title}
	{onpointerenter}
	{onpointerleave}
>
	{#if title}<title>{title}</title>{/if}
	<clipPath id="{uid}-clip"><circle cx={r} cy={r} {r} /></clipPath>
	<g clip-path="url(#{uid}-clip)">
		<svg width={r * 2} height={r * 2} viewBox="0 0 512 512" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted markup generated from flag-icons -->
			{@html svg}
		</svg>
	</g>
	{#if stroke !== 'none'}
		<circle cx={r} cy={r} r={r - strokeWidth / 2} fill="none" {stroke} stroke-width={strokeWidth} />
	{/if}
</g>
