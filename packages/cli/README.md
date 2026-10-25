# @mozaic/cli

```bash
mozaic export [dir]   # export every embed in a built site (default: build) to SVG, PDF and PNG
mozaic eject <recipe> # copy a recipe (BarChart, ColumnChart, LineChart, ScatterChart) into your project
mozaic --help
```

`export` reads `embed/manifest.json` from the built site, serves the folder locally and renders each
embed in headless Chromium:

- `web.png` (2×) and `web.svg` at `--web-width` (default 640 px)
- `print-<width>.svg` and `print-<width>.pdf` for each print width in the manifest

Options: `--out <dir>` (default `exports`), `--only <slug,…>`, `--formats svg,pdf,png`,
`--web-width <px>`, `--browser <path>`.

Chromium lookup: `--browser`, `$MOZAIC_BROWSER`, Playwright's download (`npx playwright install chromium`),
any Chromium in Playwright's cache, then common system locations. Each is tried until one starts.
