# Base-UI Variant of the Shadcn Admin Kit Registry

**Status:** Draft
**Date:** 2026-05-21
**Author:** session continuation from `2026-05-21` registry refactor

## Problem

The kit currently ships only a radix-based ui primitive layer. shadcn upstream
offers both radix and base-ui as primitive backends for its own components, and
consumers increasingly expect parity. The recent registry refactor
(`06ef140bd`) prepared for this by isolating all primitive imports inside
`src/components/ui/` so the backend can be swapped in one directory; this spec
turns that preparation into shipped product.

## Goals

- Ship a base-ui variant of every primitive currently exposed under
  `src/components/ui/` so consumers can install either backend from one
  registry.
- Mirror shadcn upstream's `style` field model so consumers pick a backend via
  `components.json` rather than via a different URL or namespace.
- Keep consumer install paths unchanged. Whichever variant is installed lands
  at `@/components/ui/<name>.tsx`.
- Maintain CI verification for both variants so regressions in either backend
  surface fast.

## Non-Goals

- Building base-ui variants of components outside `src/components/ui/` (e.g.,
  admin components are primitive-agnostic and consume only the ui wrappers).
- Replacing radix as the default. Radix remains the default variant.
- Hand-coding adapters that translate radix primitive APIs to base-ui at
  runtime. Each backend keeps its own implementation.
- Supporting third-party primitive backends (only radix and base-ui).
- Granularizing the base-ui ui items into per-component registry entries (out
  of scope; granular split currently applies only to the `admin` block).

## Locked Decisions

These were resolved during brainstorming and are not re-litigated below.

| Decision | Choice |
|----------|--------|
| Consumer choice mechanism | `style` field in `components.json`, with `{style}` URL placeholder |
| Coverage | Full parity with current ui/ surface (~55 primitives) |
| Source maintenance | Two parallel hand-maintained directories |
| Source layout | `src/bases/radix/ui/` + `src/bases/base/ui/` (mirrors shadcn upstream) |
| Default style | `default` (radix). Alternative: `base-ui` |

## Architecture

### Source layout

```
src/
  bases/
    radix/
      ui/             # 55 *.tsx — current ui/ files move here
    base/
      ui/             # 55 *.tsx — new, base-ui implementations
  components/
    admin/            # primitive-agnostic; imports via @/components/ui/* alias
    extras/           # same
    rich-text-input/  # same
    ...
```

`src/components/ui/` no longer exists as a directory. The alias
`@/components/ui/*` (declared in `tsconfig.app.json` and `vite.config.ts`)
resolves to the active base's ui directory based on the `VARIANT` environment
variable. This single alias change is what swaps the primitive backend for the
entire dev environment.

### Path alias resolution

`tsconfig.app.json` and `vite.config.ts` both read a `VARIANT` env var
(defaulting to `radix`) and set:

```
"@/components/ui/*" -> "src/bases/${VARIANT}/ui/*"
```

A secondary alias `@/base/ui/*` always resolves to `src/bases/base/ui/*` so
internal tooling and tests can reach the inactive base directly when needed
(e.g., for parity checks).

### Build pipeline

`scripts/registry.config.mjs` gains a top-level `styles` array:

```js
export const styles = ["default", "base-ui"];

export const styleToBase = {
  default: "radix",
  "base-ui": "base",
};
```

`scripts/generate-registry.mjs` produces one `registry.json` whose `items[]`
include ui primitives once, with `files[].path` carrying a `{style}` token (or
the file content is interpolated at build time, not at generate time).

`scripts/build_registry.mjs` iterates `styles`, writes per-style JSON outputs:

```
public/r/
  registry.json               # catalog with URL pattern
  default/
    <name>.json               # radix-flavored
  base-ui/
    <name>.json               # base-ui-flavored
```

`public/r/registry.json` declares its URL template such that the shadcn CLI
substitutes `{style}` when resolving items:

```
https://marmelab.com/shadcn-admin-kit/r/{style}/{name}.json
```

Granular admin items (output of the existing `granularizeBlock` generator) are
NOT per-style because they don't depend on which base is active — they import
via `@/components/ui/*` which the consumer's own project resolves to whichever
ui files the consumer installed. They live at `public/r/{name}.json` (no
style prefix). Only `registry:ui` items are duplicated per style.

The granular generator's import classifier currently treats all
`@/components/ui/*` imports as references to shadcn upstream items (plain
names like `"popover"`). After this change every ui file is OURS (already
customized in the registry refactor — e.g. primitive namespace re-exports,
`slot.tsx`). The classifier updates so all ui imports resolve to
`@shadcn-admin-kit/<name>` instead of shadcn upstream names. This is what
threads the consumer's `style` choice through the dependency graph: installing
`@shadcn-admin-kit/data-table` pulls our per-style ui items, not shadcn
upstream's. Existing `OUR_UI_ITEMS` carve-out (slot, combobox, color-picker,
direction) becomes the new default for every ui file.

### Dev workflow

`package.json` scripts gain a `VARIANT=base` prefix for the base-ui matrix:

```
"dev": "vite",
"dev:base": "VARIANT=base vite",
"test": "vitest run --browser.headless",
"test:base": "VARIANT=base vitest run --browser.headless",
"typecheck": "tsc --noEmit -p tsconfig.app.json",
"typecheck:base": "VARIANT=base tsc --noEmit -p tsconfig.app.json",
```

CI runs both `:base` and default variants in parallel matrix jobs.

For Storybook, the storybook script reads VARIANT the same way so a developer
can visually compare both backends by running two storybook instances on
different ports.

### ESLint

The current rule bans `radix-ui` and `@base-ui/react` imports outside
`src/components/ui/`. It updates to:

- `radix-ui` and `radix-ui/*` allowed only inside `src/bases/radix/ui/`.
- `@base-ui/react` and `@base-ui/react/*` allowed only inside
  `src/bases/base/ui/`.

The pre-existing single-directory allowance is split into two backend-specific
allowances, enforcing that a radix import in `src/bases/base/ui/` is an error
(and vice versa).

### Coverage gap handling

Both backends may lack 1:1 equivalents. Gaps are symmetric: radix has no
combobox primitive (current repo uses base-ui combobox), and base-ui may lack
equivalents for some radix primitives. For each gap, the corresponding
`src/bases/<backend>/ui/<name>.tsx` ships one of three fallbacks, decided per
primitive at implementation time:

1. **Custom headless implementation** — write the behavior ourselves using
   React + accessibility primitives. Right for components whose API is small
   and where the primitive-specific UX (e.g., portal placement) is the only
   non-trivial bit. Example: current combobox uses base-ui for its Combobox
   primitive; the radix variant likely needs a custom impl backed by `cmdk`
   (already used elsewhere in the kit).
2. **Re-export from the other backend** as an explicit escape hatch — clearly
   marked with a top-of-file comment explaining the gap. Acceptable when
   parity is genuinely impossible and we don't want to block the variant on
   one primitive. This DOES require the other backend's package to be a peer
   dep of the consumer install; documented as such.
3. **Stub that throws at runtime** — for primitives that have no sensible
   fallback and that the admin layer doesn't actually use in any
   currently-shipped component. Documented as a known limitation.

The implementation plan inventories every ui primitive in the existing
`src/components/ui/` directory and decides per-file which fallback (if any) it
needs for each backend.

### Registry shape

Catalog (`public/r/registry.json`):

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "Shadcn Admin Kit",
  "homepage": "https://marmelab.com/shadcn-admin-kit/",
  "items": [...]
}
```

Per-style item example (`public/r/base-ui/popover.json`):

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "popover",
  "type": "registry:ui",
  "files": [
    {
      "path": "src/components/ui/popover.tsx",
      "content": "<base-ui-flavored source>"
    }
  ],
  "dependencies": ["@base-ui/react"]
}
```

The `path` field is the consumer-side target path; the `content` is the
source file for the chosen style.

### Consumer experience

```sh
# components.json (consumer side)
{
  "style": "base-ui",
  "registries": {
    "@shadcn-admin-kit": "https://marmelab.com/shadcn-admin-kit/r/{style}/{name}.json"
  }
}

# Install popover (base-ui variant)
pnpm dlx shadcn@latest add @shadcn-admin-kit/popover
# → fetches from /r/base-ui/popover.json
# → file lands at @/components/ui/popover.tsx
```

Consumers switching backends mid-project run a one-time re-add of any installed
ui items after flipping `style`.

## Verification

- Unit + browser tests pass on both `VARIANT=radix` (default) and
  `VARIANT=base`.
- Typecheck passes on both variants.
- Lint passes on both variants (including the backend-specific import bans).
- Registry build succeeds for both styles: 55 × 2 per-style JSONs + the 186
  shared granular items + 9 blocks = ~~300 output files in `public/r/`.
- Visual smoke check: a single storybook story (e.g., `Popover.stories.tsx`)
  renders correctly under both variants when running `npm run storybook` and
  `npm run storybook:base` side by side.

## Migration steps

1. Move every file from `src/components/ui/*.tsx` to `src/bases/radix/ui/*.tsx`
   via `git mv` (preserves history). The current `combobox.tsx` is an exception
   to "everything in `bases/radix/` uses radix" — it uses base-ui because
   radix has no Combobox primitive. Either leave it as-is with a top-of-file
   gap comment, or replace with a custom cmdk-backed implementation; decide
   during implementation.
2. Update `tsconfig.app.json` + `vite.config.ts` to read `VARIANT` and resolve
   `@/components/ui/*` accordingly. Default `VARIANT=radix`.
3. Verify the default-variant build is green (lint + typecheck + tests). This
   is a refactor checkpoint; behavior must not change.
4. Update ESLint rule per the "ESLint" section above.
5. Update `scripts/granularize-block.mjs` so all `@/components/ui/*` imports
   resolve to `@shadcn-admin-kit/<name>` items (drop the `OUR_UI_ITEMS`
   carve-out; everything in `bases/<backend>/ui/` is ours now). Regenerate
   `registry.json` and verify granular admin items reference our ui items
   instead of shadcn upstream.
6. For each primitive in `src/bases/radix/ui/`, author its base-ui counterpart
   in `src/bases/base/ui/`. Same export surface (same named functions, same
   prop types). The implementation plan groups these into batches by
   primitive-API similarity to optimize the order. Coverage-gap primitives
   ship one of the three fallback patterns (custom / re-export / stub) per the
   "Coverage gap handling" section.
7. Update `scripts/registry.config.mjs` with the `styles` array + per-style
   build logic.
8. Update `scripts/generate-registry.mjs` and `scripts/build_registry.mjs` for
   per-style outputs.
9. Update CI workflow to run both variant matrices.
10. Update `CHANGELOG.md` with consumer-facing instructions, including the
    `style` switch in `components.json` and the re-add step.

## Open Questions

These are intentionally unresolved at design time and decided during
implementation:

- Exact list of base-ui primitives that need fallback (custom impl vs re-export
  vs stub). Resolved per-file as the inventory pass runs in step 5.
- Whether to ship a separate `registry:base` design-system item per style for
  `shadcn create` UX, or leave consumers to set `style` manually. Defer to
  follow-up; not blocking parity.
- Whether `extras/` and `rich-text-input/` blocks should also gain explicit
  base-ui awareness, or if they're transparent because they import only
  through `@/components/ui/*`. Expectation is the latter; verify during
  implementation.
- Storybook UX for comparing variants side-by-side. Adequate to run two
  instances for now; can revisit if it becomes painful.

## Out of Scope

- Granularizing `registry:ui` items per style (each ui item ships as a single
  per-style JSON, not as further sub-items).
- A runtime backend switcher (no `<PrimitiveProvider value={"radix"}>` in
  consumer apps; choice is install-time).
- Migrating consumers' existing radix installs automatically; consumers re-add
  ui items after flipping `style`.

## Estimated effort

- Migration steps 1–4 (radix moved, alias plumbing, ESLint update): 1–2h.
- Migration step 5 (author 55 base-ui files): 6–10h focused work. Possibly
  parallelizable via subagent dispatch.
- Migration steps 6–7 (build pipeline per-style): 2–3h.
- Migration steps 8–9 (CI + docs): 1h.

Total: 10–16h. Strong candidate for splitting across multiple sessions and/or
dispatching the per-primitive work to subagents.
