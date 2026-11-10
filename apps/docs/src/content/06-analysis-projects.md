<!-- section: Publish -->

# Analysis projects

Each story gets its own repository, created with [maia](https://github.com/samizdata-co/maia), a [Copier](https://copier.readthedocs.io/) template. Answer `mozaic` to the Charts question, or pass it:

```bash
uvx copier copy --trust --data charts=mozaic gh:samizdata-co/maia <dir>
```

The questions that matter for charts are the outlet (SAMIZDATA, Ziarul de Gardă or none: the house style), `chart_locales` (comma-separated `en`, `ro`, `ru`; the first is the default) and the hidden `mozaic_path`, which links a local mozaic checkout (see the last section). The project records its answers in `.copier-answers.yml`; `uvx copier update --trust` brings later template releases into it, including new mozaic versions and brand themes.

## Layout

```
etl/                                scripts that clean and process the data
docs/                               analysis notebook (Quarto, Jupyter or Observable) and story.md
data/raw/, data/processed/          the analysis's own data (not read by the charts)
charts/data/                        tidy CSV, committed; the contract between analysis and charts
charts/src/charts/<slug>/           Chart.svelte, data.ts, messages.ts
charts/src/charts/index.ts          chart registry: slug, title, component, print widths
charts/src/lib/theme.ts             the house style (the outlet's brand, or mozaic's base)
charts/src/lib/brands/<outlet>/     copy of the outlet's brand theme and logo; updated by copier update
charts/src/routes/                  preview page, embed pages, manifest.json, embed.js (generic)
charts/mozaic.config.ts             project, locales, baseUrl
charts/AGENTS.md, .claude/skills/   instructions for AI agents
.github/workflows/charts.yml        deploy charts/ to GitHub Pages
```

## Data

Write **tidy, long-format** CSV from the analysis to `charts/data/`: one row per observation, one column per variable. Charts import the CSV at build time and parse it:

```ts
import { autoType, csvParse } from 'd3-dsv';
import raw from '../../../data/turnout.csv?raw';

export interface Row {
	year: number;
	region: string;
	turnout: number;
}
export const rows = csvParse(raw, autoType) as unknown as Row[];
```

The data ends up inside the built page, so embeds have no runtime dependencies.

## Commands

Run these in `charts/`:

```bash
pnpm dev      # preview every chart; switch language, width and medium; copy embed codes
pnpm check    # type-check
pnpm build    # static site in charts/build/
pnpm export   # SVG, PDF and PNG in charts/exports/
```

## Publishing

`.github/workflows/charts.yml` builds `charts/` and deploys it to GitHub Pages on every push to `main` that changes it. Enable Pages (Settings → Pages → Source: GitHub Actions) and commit `charts/pnpm-lock.yaml` first. Set `baseUrl` in `charts/mozaic.config.ts` to the public URL so the preview page shows the right embed codes. See [Embedding](../embedding/).

## Developing library features from a project

When a story needs a new mark or option:

1. Create (or update) the project with mozaic linked from your checkout: `--data mozaic_path=/absolute/path/to/mozaic`. Pass it again on `copier update`, or the project switches back to npm.
2. Work in the mozaic checkout and run `pnpm --filter mozaic package` after changes (or `svelte-package --watch`).
3. Add a gallery example and a test in the library.
4. Add a changeset and release; then set `mozaic_version` in maia's `copier.yml`, release maia, and run `copier update` in the project.
