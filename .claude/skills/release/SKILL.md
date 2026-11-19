---
name: release
description: How to release mozaic to npm — write changesets, check, version, commit, publish @samizdata/mozaic (library and mozaic CLI) with pnpm (the user approves once with a passkey), push the commit and tag, and bring the new version into maia. Use whenever there are unreleased changes to packages/mozaic and the user wants them on npm, or asks to release, publish, ship, cut a version, bump the version or tag — even if they don't say "npm". Also use when adding a changeset after a library change.
---

# Releasing mozaic

One package is published to npm: **`@samizdata/mozaic`** (`packages/mozaic`), the library plus the `mozaic` CLI in `packages/mozaic/cli/` (its `bin`). The docs site (`apps/docs`) and the root are private and never published. `@samizdata/create-mozaic` (ADR 0003) and `@samizdata/mozaic-cli` (ADR 0004) are retired and deprecated on npm; don't publish them.

Publishing, pushing and tagging are public and permanent: npm versions can't be reused. Do them when the user asked for a release; otherwise stop after the changeset and ask.

## 1. See what is unreleased

```bash
git fetch && git status -sb                     # main, clean, not behind origin
git log --oneline "@samizdata/mozaic@$(node -p "require('./packages/mozaic/package.json').version")"..HEAD -- packages/mozaic
ls .changeset/*.md | grep -v README             # pending changesets
```

Only changes under `packages/mozaic` (including `cli/`) need a release. Docs-site, test-only and tooling changes don't (a docs change that ships in the package, such as a component's JSDoc, does).

## 2. Write the changesets

Every user-facing change since the last release needs a changeset. Write the file directly (`pnpm changeset` is interactive):

```md
---
'@samizdata/mozaic': minor
---

`Tooltip`: the card keeps its width as it moves. It used to shrink to the room left of its position, which moved it again and set off "ResizeObserver loop" errors near the right edge of narrow charts.
```

Save it as `.changeset/<short-kebab-name>.md`. CLI changes are `@samizdata/mozaic` changes too; start their entry with the command (`mozaic export`).

Pick the bump. mozaic is pre-1.0:

- **minor**: new components, props, recipes or options, and anything that breaks existing charts (renamed or removed props, changed defaults, changed output). Say what users must change.
- **patch**: fixes that keep the API.

The text becomes the CHANGELOG entry. Follow the existing entries in `packages/mozaic/CHANGELOG.md`: start with the component in backticks, then say what changed for someone writing charts (what it does now, what it used to do, how to opt out). Use a bulleted list for several changes. Don't describe internals or tests.

Commit the changesets with the change they describe, or on their own if the change is already committed.

## 3. Check

Run what CI runs (`.github/workflows/ci.yml`); all of it must pass:

```bash
pnpm install --frozen-lockfile
pnpm format:check && pnpm lint && pnpm check && pnpm test
pnpm build && pnpm test:e2e
```

Run `pnpm build && pnpm test:e2e` in the background: it takes a few minutes.

## 4. Version and commit

```bash
pnpm release                      # changeset version: bumps the version, writes the CHANGELOG, deletes the changesets
pnpm install                      # refresh the lockfile if versions changed
git diff --stat                   # package.json, CHANGELOG.md, removed changesets
git commit -am "Release X.Y.Z"    # plus `git add -A .changeset` for the deleted files
```

The commit subject is exactly `Release X.Y.Z` (see `git log --grep '^Release'`), with no body.

## 5. Publish (one passkey approval)

The npm account uses two-factor authentication with a **passkey** (no one-time codes), so every publish needs the user to approve in the browser. That only works in an interactive terminal: run the commands below in the user's Terminal panel (`run_in_terminal`; start the line with `cd <mozaic checkout> &&` if the tab can't open there), never in the Bash tool.

Use pnpm for every registry command (login, whoami, publish), not npm. pnpm 12 keeps its own login in `~/.config/pnpm/config.yaml`, apart from npm's `~/.npmrc`, and only pnpm's matters: `pnpm release:publish` is plain `pnpm publish` plus a git tag, not `changeset publish` (which asks the npm CLI about 2FA first and, when npm isn't logged in, runs pnpm non-interactively, so the passkey prompt never shows: `ERR_PNPM_OTP_NON_INTERACTIVE`). The npm CLI's login is never needed.

1. Check the login in Bash (no terminal needed):

   ```bash
   pnpm whoami                    # must print nicucalcea
   ```

   On a 401, run `pnpm login` in the Terminal panel; the user presses Enter and signs in in the browser.

2. Publish in the Terminal panel, from the repo root:

   ```bash
   pnpm release:publish
   ```

   `prepack` builds `dist/` and runs publint, pnpm prints an "Authenticate your account at" link with a QR code, the user presses Enter and approves with their passkey, and then the script creates the lightweight tag `@samizdata/mozaic@X.Y.Z`. Tell the user what to expect, then read the tab (`read_terminal` with a long `wait_for_output_ms`) until it prints `Tagged @samizdata/mozaic@X.Y.Z` or an error. Never ask for, or type, a password or code yourself.

3. Confirm on the registry. npm can take ten minutes or more to list a new version after pnpm prints "Published"; don't publish again. Wait in the background instead of polling by hand:

   ```bash
   until curl -s https://registry.npmjs.org/@samizdata%2fmozaic | grep -q '"X.Y.Z"'; do sleep 20; done
   ```

## 6. Push the commit and tag

The tag is lightweight, which `git push --follow-tags` skips. Push it by name:

```bash
git push origin main
git push origin "@samizdata/mozaic@X.Y.Z"
git ls-remote --tags origin | grep "@X.Y.Z"
```

## 7. Bring the release into maia

Projects are created by maia (`samizdata-co/maia`, checked out in `../maia`), which pins the mozaic version. After every release:

- Set `mozaic_version` in `../maia/copier.yml` to `X.Y.Z`. maia's `test_mozaic_version_matches_mozaic` fails until you do.
- If the release changes what a chart project needs (the example chart, embed routes, `vite.config.ts`, conventions in the chart `AGENTS.md` or the `mozaic-chart` skill, a new recipe the skill should name), port it into maia's `template/{% if charts == 'mozaic' %}charts{% endif %}/` and `.claude/skills/mozaic-chart/`.
- Release maia with its own `release-template` skill (`../maia/.claude/skills/release-template/SKILL.md`): minor for a mozaic minor, patch for a mozaic patch with no template changes. That skill also covers generating a project and building its `charts/` before tagging.

If `../maia` has uncommitted work that isn't yours, don't commit it: ask, or work in a separate `git worktree`.

## Things that trip people up

- `pnpm publish` refuses a version that is already on npm. If the publish went through but the tag wasn't made (the tab was closed, the approval timed out after upload), don't rerun `release:publish`: create the tag with `git tag "@samizdata/mozaic@X.Y.Z"` on the release commit.
- `pnpm publish` refuses from a dirty tree or a branch other than `main`; that is deliberate, don't pass `--no-git-checks`.
- `prepack` runs `publint`. A publint error stops the publish of `@samizdata/mozaic`; fix it, amend the release commit and publish again.
- Don't publish from a dirty tree or from anything but `main` at the release commit.
