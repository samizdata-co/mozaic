<!-- section: Build -->

# Writing marks

A mark is a Svelte component that calls `usePlot()` and draws SVG. There is no registration step and no internal API.

```svelte
<!-- Lollipops.svelte -->
<script lang="ts" generics="T">
	import { usePlot, useTheme, scaled } from '@samizdata/mozaic/core';

	interface Props {
		data: T[];
		x: (d: T) => number;
		y: (d: T) => string;
		r?: number;
	}

	let { data, x, y, r = 4 }: Props = $props();
	const plot = usePlot();
	const theme = useTheme();
</script>

<g class="lollipops">
	{#each data as d}
		{@const cy = scaled(plot.y, y(d))}
		<line x1={plot.x(0)} x2={plot.x(x(d))} y1={cy} y2={cy} stroke="var(--mz-color-axis)" />
		<circle cx={plot.x(x(d))} {cy} {r} fill={theme.palettes.categorical[0]} />
	{/each}
</g>
```

## Conventions

- **Accessors in, pixels out.** Take data and accessor functions; turn them into pixels with `plot.x`, `plot.y` or `position(plot, x, y)`. Use `scaled()` for band scales.
- **No data preparation inside marks.** Sort, stack and aggregate before the data reaches the mark (in the chart file or `@samizdata/mozaic/transforms`).
- **Colours.** Data colours come from `useTheme().palettes`. Text, gridlines and outlines use CSS tokens: `var(--mz-color-text)`, `--mz-color-muted`, `--mz-color-grid`, `--mz-color-axis`, `--mz-color-bg`.
- **Theme defaults must be derived.** Write `const r = $derived(radius ?? theme.plot.barRadius)`, not `let { radius = theme.plot.barRadius }`. Destructuring defaults are not reactive, so they would not follow a style change.
- **Use `Accessor<T, Value>`, not `Accessor<T, any>`.** A union with `any` collapses to `any` and erases the callback's types.
- **Print.** Marks inside `<Svg>` print. Interactive-only parts should check `plot.medium !== 'print'`.
- **Accessibility.** Offer a `title` accessor that renders `<title>` inside each shape.
- **Name classes `mz-…`** if the mark belongs in the library.

## Adding a mark to the library

1. Add `packages/mozaic/src/lib/marks/YourMark.svelte` with an `@component` comment and typed, JSDoc-commented `Props`. The API reference is generated from these.
2. Export it from `marks/index.ts`.
3. Add a server-render test in `packages/mozaic/src/tests` and a gallery example in `apps/docs/src/lib/gallery`.
4. Run `pnpm check && pnpm test`, and add a changeset (`pnpm changeset`).
