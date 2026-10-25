<!--
@component
The outer frame of every chart. Applies the house style and locale, measures
its width (for breakpoints) and shares theme, locale, medium and breakpoint
with everything inside via `useChart()`, `useTheme()` and `useLocale()`.

It does not care what renders inside: a mozaic `<Plot>`, hand-written SVG,
a map or a table.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setChartContext } from '../core/context.js';
	import { createLocale, type LocaleCode } from '../locale/index.js';
	import { breakpointFor, resolveStyle, tokensToStyle, type StyleName } from '../styles/index.js';
	import type { Medium, Theme } from '../styles/types.js';

	interface Props {
		/** House style name or a Theme object. */
		style?: StyleName | Theme;
		/** Defaults to the style's default locale. */
		locale?: LocaleCode;
		medium?: Medium;
		/** Text description for screen readers. Describe what the chart shows, not how it looks. */
		alt?: string;
		/** Fixed width in px (print: use `mm()`). Otherwise the chart fills its container. */
		width?: number;
		/** Add the style's web-font stylesheet to the page head. Turn off when the host page already loads the fonts. */
		loadFonts?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		style = 'base',
		locale,
		medium = 'web',
		alt,
		width: fixedWidth,
		loadFonts = true,
		class: className = '',
		children
	}: Props = $props();

	const uid = $props.id();
	const theme = $derived(resolveStyle(style));
	const loc = $derived(createLocale(locale ?? theme.defaultLocale));

	let measuredWidth = $state(0);
	const measured = $derived(fixedWidth != null || measuredWidth > 0);
	const width = $derived(fixedWidth ?? (measuredWidth || theme.plot.initialWidth));
	const breakpoint = $derived(breakpointFor(width, theme.breakpoints));
	const ids = { title: `${uid}-title`, desc: `${uid}-desc` };

	setChartContext({
		get theme() {
			return theme;
		},
		get locale() {
			return loc;
		},
		get medium() {
			return medium;
		},
		get breakpoint() {
			return breakpoint;
		},
		get width() {
			return width;
		},
		get measured() {
			return measured;
		},
		ids
	});
</script>

<svelte:head>
	{#if loadFonts && theme.fonts}
		<link rel="stylesheet" href={theme.fonts.stylesheet} />
	{/if}
</svelte:head>

<figure
	class="mz-chart {className}"
	data-mz-style={theme.name}
	data-mz-medium={medium}
	data-mz-breakpoint={breakpoint}
	lang={loc.lang}
	aria-labelledby={ids.title}
	style={tokensToStyle(
		medium === 'print' ? ({ ...theme.tokens, ...theme.print.tokens } as Theme['tokens']) : theme.tokens
	)}
	style:width={fixedWidth != null ? `${fixedWidth}px` : undefined}
	bind:clientWidth={measuredWidth}
>
	{@render children?.()}
	{#if alt}<p id={ids.desc} class="mz-visually-hidden">{alt}</p>{/if}
</figure>

<style>
	.mz-chart {
		box-sizing: border-box;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--mz-gap);
		font-family: var(--mz-font-body);
		font-size: var(--mz-size-body);
		color: var(--mz-color-text);
		background: var(--mz-color-bg);
		font-variant-numeric: tabular-nums;
	}
	.mz-visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
