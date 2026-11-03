# ADR 0002: House styles live with their brands

- Status: accepted
- Date: 2026-11-03

## Context

mozaic shipped three house styles (`samizdata`, `zdg`, `plebiscit`) and looked
them up by name. Every new outlet or project style meant a library release, the
SAMIZDATA values were copied from `samizdata-co/brand` with nothing to catch
drift, and the Plebiscit.md style served one site. New analysis projects are
created with maia, which already pins each outlet's Quarto brand.

## Decision

- mozaic ships only the neutral `base` theme. `<Chart style>` and the recipes
  take a `Theme` object; there is no registry, `StyleName` or `resolveStyle`.
- Each brand repository keeps its mozaic theme in `datavis/mozaic/`
  (`theme.ts`, `logo.ts`), checked against its tokens by the brand's own
  scripts: `samizdata-co/brand` and `ziaruldegarda/brand`. Plebiscit.md keeps
  its theme in its own repository.
- Projects copy a brand's `datavis/mozaic/` folder and do not edit the copy,
  as they do with the Quarto extension. maia does this for the outlet chosen
  at setup; the docs site keeps copies in `apps/docs/src/lib/brands/`.
- `checkTheme()` exports the checks the library used to run on its own styles,
  so brands and projects can run them in their tests.

## Consequences

- A new outlet needs a brand repository (or a theme file in the project), not
  a mozaic release.
- Copies drift until they are updated from a brand release; the brand's
  version is in each theme's header.
- Theme names still name export folders and `data-mz-style`, but nothing in
  mozaic depends on a particular name.
