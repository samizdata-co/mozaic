# AGENTS.md

This repository holds the data analysis and charts for one story, built with
the mozaic chart library (Svelte 5 + d3). House style: `src/lib/theme.ts`. Languages: see
`mozaic.config.ts`.

## Where things go

- Data wrangling: `analysis/R` or `analysis/py`. Output tidy CSV to `data/processed/`.
- Charts: `src/charts/<slug>/` with `Chart.svelte` (the chart), `data.ts` (load and type the
  CSV), `messages.ts` (every user-facing string, per language). Register in `src/charts/index.ts`.
- Do not edit `src/routes/embed/**`, `manifest.json` or `embed.js` routes; they are generic.

## Chart conventions

- Wrap everything in `<Chart {style} {locale} {medium} {width} alt="…">` with `Header`
  (`Title`, `Subtitle`), a `Plot`, and `Footer` (`Notes`, `Source`).
- Scales are plain d3 scales. Set the domain; `<Plot>` sets the range.
- Draw in `<Svg>`; tooltips go in `<Html>`. Use `{#snippet children(plot)}` on `<Plot>`
  to get ranged scales for tooltip positions.
- Colours: `style.palettes` (the theme each chart receives); assign categorical colours by entity in order.
  Text uses text colours (`var(--mz-color-text)`), never data colours.
- Every chart needs `alt` text, a legend for 2+ series, and strings in every language.
- Use the theme's breakpoints (`plot.breakpoint`) for small-screen layouts.
- Name the y unit once, on the top tick: `<AxisY unit="lei/m³" />`.
- Tooltips: `<Tooltip title items>`, one item per series (label, value, colour), so values line up.
- Event markers on a time axis: `<RefLine x={date} label="…" dotted labelY={-30} />`, labels above the plot.
- No `<DataTable>` ("Show the data" button) unless asked for.

## Before you finish

- `pnpm check` passes.
- Look at the preview (`pnpm dev`) at 320 px and 1000 px, in every language, and in print medium.
- `pnpm build` succeeds.

The full component reference and examples are in the mozaic docs site (the library's `apps/docs`).
