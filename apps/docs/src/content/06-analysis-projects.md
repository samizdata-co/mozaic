<!-- section: Publish -->

# Analysis projects

Each story gets its own repository, created with `create-mozaic`:

```bash
pnpm create @samizdata/mozaic <dir> --locales ro,ru --title "…"
```

Options: `--locales` (comma-separated), `--title`, `--name`, `--mozaic` and `--cli` (a version, or a local path), `--no-git` and `--install`.

## Layout

```
analysis/R/01_prepare.R   data/raw → data/processed (base R; add renv if needed)
analysis/py/prepare.py    the same in Python (uv)
data/raw/                 source files, not committed
data/processed/           tidy CSV, committed; the contract between analysis and charts
src/charts/<slug>/        Chart.svelte, data.ts, messages.ts
src/charts/index.ts       chart registry: slug, title, component, print widths
src/lib/theme.ts          the house style (mozaic's base; swap in a brand's theme)
src/routes/               preview page, embed pages, manifest.json, embed.js (generic)
mozaic.config.ts          project, locales, baseUrl
justfile                  data, dev, check, build, export, all
AGENTS.md, .claude/       instructions for AI agents
.github/workflows/        deploy to GitHub Pages
```

## Data

Write **tidy, long-format** CSV from the analysis scripts: one row per observation, one column per variable. Charts import the CSV at build time and parse it:

```ts
import { autoType, csvParse } from 'd3-dsv';
import raw from '../../../data/processed/turnout.csv?raw';

export interface Row {
	year: number;
	region: string;
	turnout: number;
}
export const rows = csvParse(raw, autoType) as unknown as Row[];
```

The data ends up inside the built page, so embeds have no runtime dependencies.

## Commands

```bash
just data     # run the analysis scripts
pnpm dev      # preview every chart; switch language, width and medium; copy embed codes
pnpm check    # type-check
pnpm build    # static site in build/
pnpm export   # SVG, PDF and PNG in exports/
```

## Developing library features from a project

When a story needs a new mark or option:

1. Work in the mozaic checkout, with the project linked (`--mozaic ../mozaic/packages/mozaic`), and run `pnpm --filter mozaic package` after changes (or `svelte-package --watch`).
2. Add a gallery example and a test in the library.
3. Add a changeset, release, and update the project's dependency.
