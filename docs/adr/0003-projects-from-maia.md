# ADR 0003: Projects are created by maia

- Status: accepted
- Date: 2026-11-10

## Context

Two templates created chart projects. `create-mozaic`
(`pnpm create @samizdata/mozaic`) copied a standalone project (R and Python
scripts, `data/processed/`, charts at the root) and filled in placeholders.
maia (`samizdata-co/maia`, a Copier template) creates the whole story
repository (ETL, notebooks, Quarto brand, article) and, with `charts: mozaic`,
the same chart project in `charts/` with the outlet's mozaic theme. The chart
files were kept in two places, and maia's copy fell behind: it still pinned
mozaic 0.2 when mozaic was at 0.6. Only `copier update` brings template,
mozaic and brand changes into existing projects. mozaic is only used by its
author's projects, so it needs no zero-setup scaffolder for outside users.

## Decision

- maia is the only scaffolder. `packages/create-mozaic` is removed and
  `@samizdata/create-mozaic` is deprecated on npm (last version 0.6.0).
- maia took over what only `create-mozaic` had: a GitHub Pages workflow for
  `charts/`, linking a local mozaic checkout (`--data mozaic_path=…`), and a
  mozaic version pin (`mozaic_version` in `copier.yml`) that its tests check
  against a sibling mozaic checkout.
- After each mozaic release, maia sets `mozaic_version`, ports any changes
  chart projects need, and releases.

## Consequences

- Starting a project needs `uv` (for `uvx copier`) as well as pnpm.
- mozaic's tests no longer generate a project; maia's tests do, and a
  `pnpm check` and `pnpm build` of a generated `charts/` is part of its release
  steps.
- `@samizdata/mozaic` and `@samizdata/mozaic-cli` are released together;
  `create-mozaic` no longer is. (Since [ADR 0004](0004-cli-in-the-library.md)
  the CLI ships inside `@samizdata/mozaic`.)
- Projects made with `create-mozaic` keep working (they depend only on the npm
  packages) but cannot use `copier update`.
