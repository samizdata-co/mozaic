<!-- section: Quality -->

# Contributing

The monorepo uses pnpm workspaces:

```
packages/mozaic         the library
packages/cli            mozaic export / eject
apps/docs               this site: docs, gallery, API reference, embeds
```

## Commands

```bash
pnpm install
pnpm dev            # docs site with live library source
pnpm check          # svelte-check / tsc everywhere
pnpm test           # unit and server-render tests
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm build          # package the library, build the docs site
pnpm test:e2e       # Playwright: pages, embeds, accessibility (after build)
pnpm export         # export every docs embed with mozaic export
```

The docs app resolves `@samizdata/mozaic` to the library source through a `mozaic-dev` export condition, so library changes hot-reload without a build.

## Tests

- **Unit tests** for transforms, locales, styles, geometry, CSV, embed code and the host script.
- **Server-render tests** render components with `svelte/server` and query the HTML (`packages/mozaic/src/tests`).
- **Gallery tests** render every example in every style, language and medium and fail on `NaN` or `undefined` in the output.
- **API tests** check that every exported component is documented.
- **CLI tests** run a real export against a fixture site when a Chromium is available.
- **End-to-end tests** (Playwright) load every gallery page, check embeds resize their iframe, and run axe-core.

## Releasing

1. `pnpm changeset` after each change to a published package; describe it for readers of the changelog.
2. `pnpm release` bumps versions and writes CHANGELOGs.
3. Publish with `pnpm -r publish` (configure the registry first).

## Decisions

Architecture decisions live in `docs/adr/`. Read `docs/adr/0001-chart-core.md` in the repository for why mozaic has its own small core instead of SveltePlot or Layer Cake.
