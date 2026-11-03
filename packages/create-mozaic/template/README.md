# __PROJECT_TITLE__

Charts for one piece of analysis, built with mozaic. The house style is in
`src/lib/theme.ts`.

## Layout

```
analysis/        R and Python scripts: data/raw → data/processed
data/raw/        source files (not committed)
data/processed/  tidy CSV the charts read (committed)
src/charts/      one folder per chart (Chart.svelte, data.ts, messages.ts) + index.ts registry
src/lib/theme.ts the house style
src/routes/      preview page, embed pages, manifest, embed.js (no need to edit)
mozaic.config.ts project name, languages, public URL
```

## Workflow

```bash
pnpm install
just data      # run the analysis scripts (or: Rscript analysis/R/01_prepare.R)
pnpm dev       # preview at http://localhost:5173
pnpm check     # type-check
pnpm build     # static embeds in build/
pnpm export    # SVG, PDF and PNG in exports/ (needs a Chromium; see below)
```

## Adding a chart

1. Write the data to `data/processed/<name>.csv` from your analysis script (tidy, one row per observation).
2. Copy `src/charts/example/` to `src/charts/<name>/` and edit `data.ts`, `messages.ts` and `Chart.svelte`.
3. Register it in `src/charts/index.ts`.
4. Check it in the preview at small (320 px) and large widths, in each language, and in print.

See `AGENTS.md` for the conventions, and the mozaic gallery for examples to copy.

## Publishing

`pnpm build` writes a static site to `build/`. Upload it anywhere (the included
GitHub Actions workflow deploys to GitHub Pages). Set `baseUrl` in
`mozaic.config.ts` to the public URL so the preview page shows correct embed codes.

Each chart is at `embed/<slug>/<locale>/`. To embed it, paste the code from the
preview page into the CMS. It is an iframe plus `embed.js`, which resizes the
iframe to fit the chart.

## Print and image export

`pnpm export` renders every embed with a headless Chromium and writes, per chart
and language:

- `web.png` (2×) and `web.svg` at 640 px
- `print-<width>.svg` and `print-<width>.pdf` for each print width in `src/charts/index.ts`

SVG text stays editable. If no Chromium is found, run `npx playwright install chromium`
or pass `--browser /path/to/chrome`.
