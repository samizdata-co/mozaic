# ADR 0004: The CLI ships inside the library

- Status: accepted
- Date: 2026-11-10

## Context

`mozaic export` and `mozaic eject` were a second npm package,
`@samizdata/mozaic-cli` (`packages/cli`): about 350 lines of Node ESM with one
dependency, `playwright-core`. Every chart project installed it with
`@samizdata/mozaic`, both were released together at the same version (a
Changesets `fixed` group), and `eject` had to find the installed library to
read its recipe sources and kept its own copy of the recipe list. The usual
reason to split Node tooling from a library, keeping it away from people who
only want the components, doesn't apply: mozaic is only used by its author's
projects, which all install both.

## Decision

- The CLI moves to `packages/mozaic/cli/` and is the `bin` (`mozaic`) of
  `@samizdata/mozaic`, from 0.7.0. `playwright-core` becomes a dependency of
  the library.
- `eject` reads recipes from the package's own `src/lib/recipes/` and takes
  the recipe names from the file names, so there is no second list to update.
- `@samizdata/mozaic-cli` is deprecated on npm (last version 0.6.0). maia's
  chart projects depend on `@samizdata/mozaic` only.

## Consequences

- One package, one version, one tag and one changeset per release.
- Installing the library also installs `playwright-core` (about 14 MB, no
  browser download). Charts never import the CLI, so embeds are unchanged.
- The library package contains Node-only code outside `src/lib`. It is type
  checked with `tsc -p cli/jsconfig.json` and tested in its own vitest
  project.
