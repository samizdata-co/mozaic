# create-mozaic

Scaffold a mozaic analysis project: R/Python data scripts plus Svelte charts built as static embeds.

```bash
pnpm create @samizdata/mozaic budget-2026 --locales ro,ru --title "Budget 2026"
```

| Option              |                                                                                 |
| ------------------- | ------------------------------------------------------------------------------- |
| `--locales`         | comma-separated `en`, `ro`, `ru` (default `en`)                                 |
| `--title`           | project title                                                                   |
| `--name`            | package name (default: from the folder)                                         |
| `--mozaic`, `--cli` | a version range, or a local path to `packages/mozaic` / `packages/cli` (linked) |
| `--no-git`          | skip `git init`                                                                 |
| `--install`         | run `pnpm install`                                                              |

The generated project contains `analysis/` (R and Python), `data/`, `src/charts/` with an example chart,
a preview page, embed routes, `mozaic.config.ts`, a house style in `src/lib/theme.ts` (mozaic's `base`; swap in an outlet's brand theme), a `justfile`, `AGENTS.md`, a Claude Code skill and a
GitHub Pages deploy workflow.
