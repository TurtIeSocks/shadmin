# Monorepo Reorg — Trace (Phase 1)

Module-level (repo ~104k LOC src). Date: 2026-06-09. Companion to `org-pass.md` /
`shadcn-cleanup-plan.md` (prior passes; both deferred structural work).

## Top-level areas

| Area | Purpose | Signals |
|------|---------|---------|
| `src/components/` | The library. 11 registry blocks: `ui` (shadcn primitives), `admin` (~160 ra-core wrappers), `extras`, `block-editor`, `mdx-editor`, `monaco`, `rich-text-input`, `leaflet`, `csv-import`, `supabase`, `realtime`. Specs (306) + stories (267) colocated. | [HOT] admin/ |
| `src/hooks/`, `src/lib/`, `src/index.css` | Shared lib code; registry `extraFiles`. | |
| `src/examples/example-admin.tsx` | Single file; **registry item** `example-admin` (registry.config.mjs:308). | |
| `src/demo/` | Demo app. Entry: `index.html` → `src/main.tsx` → `demo/App.tsx` (+5 swap-variant `App.*.tsx`). Per-resource CRUD dirs. | |
| `src/test/` | Shared spec/story harness (`_test-helpers`), imported by 81 specs. | |
| `website/` | Marketing site. **No package.json** — second Vite entry in root package. Own `@/` → `website/src`. | |
| `docs/` | Astro Starlight docs. Already a workspace package (`shadcn-admin-kit-doc`). | |
| `scripts/` | Registry pipeline + utilities. | [COMPLEX] |
| `public/` | **Deploy aggregation target**, gh-pages root. website→`/`, demo→`/demo`, docs→`/docs`, registry→`/r`. | |
| `eslint-rules/`, `rules/`, `knip.json` | Root tooling. eslint config covers `src/` + `website/src/`. | |
| `.storybook/` | Root storybook over `../src/**/*.stories.*`. | |

## Dependency edges (import-level)

```
src/demo      → src/components, src/lib, src/hooks   (one-way; nothing imports demo)
src/examples  → src/components/admin                  (one-way)
website/      → (nothing — fully isolated; own alias @/ → website/src)
docs/         → (no source imports; Astro markdown only)
src/components → src/components, src/lib, src/hooks   (internal only; never → demo)
```

Clean DAG. No cycles, no cross-app imports. **Monorepo split is import-safe.**

## Tooling-level couplings (the real migration surface)

| # | Coupling | Where |
|---|----------|-------|
| 1 | Registry source walk: `src/components/<block>` per-block `sourceDirs` | scripts/registry.config.mjs (11 blocks) |
| 2 | Registry output: `public/r/` hardcoded | scripts/build_registry.mjs:18 |
| 3 | Registry homepage: `https://marmelab.com/shadcn-admin-kit/` | registry.config.mjs:10, registry.json |
| 4 | Demo build: `./dist` → `./public/demo` | Makefile:21-23 |
| 5 | Website build: `website/dist/*` → `./public/` | Makefile:55-57 |
| 6 | Docs build: `docs/dist` → `./public/docs`; astro base `/shadcn-admin-kit/docs/` | Makefile:73-76, docs/astro.config.mjs:81,96 |
| 7 | Storybook glob `../src/**/*.stories.*`; preview imports `../src/index.css` | .storybook/main.ts:4, preview.ts:2 |
| 8 | Vitest: 9 per-block include globs `src/components/<block>/**/*.spec.*`; browser provider; global+browser setup at root | vitest.config.ts:79-106 |
| 9 | Docs check-scripts read OUTSIDE docs/: `src/components/<dir>/<slug>.stories.tsx`, `src/demo/` | docs/scripts/check-stories.mjs:34, check-demo-coverage.mjs:21 |
| 10 | eslint ignores/targets span `src/` + `website/src/`; custom rules in `eslint-rules/` | eslint.config.js:24,66-89 |
| 11 | `@/*` → `./src/*` alias | tsconfig.json:10, components.json aliases |
| 12 | CI: test.yml → `make build-registry`+`build-demo`; deploy.yml → `make build` → gh-pages `public/` (excludes `r/*/`); release.yml versions `public/r/` snapshots | .github/workflows/ |
| 13 | Root package.json holds ALL deps (library + demo + website); docs has own | package.json |

## Constraint discovered (hard)

**shadcn registry distribution model:** component source ships verbatim via `shadcn add`;
internal imports MUST stay `@/components/...`, `@/lib/...`, `@/hooks/...` so the consumer's
CLI rewrites them to the consumer's aliases. → Wherever the library lands, its internal
imports keep the `@/` form and its own tsconfig/alias must keep `@/*` → its `src/*`.
Apps consuming the library cross-package CANNOT rely on the same `@/` meaning — needs an
explicit decision (workspace package name imports vs cross-package alias).

**Outward-facing URLs frozen:** `…/r/<item>.json` (registry consumers), `/demo`, `/docs`
(published links). `public/` layout must come out byte-compatible.

## Misc findings

- `package-test.json` at root — purpose unknown, check during map.
- `storybook-static/` at root — build artifact, gitignored presumably.
- Registry homepage still `marmelab.com` post-defork (org-pass.md says de-forked 2026-06-10) — flag, separate decision.
- build_registry.mjs:23-27 manually rebuilds 3 items (`rich-text-input`, `leaflet-admin`, `extras`) — quirk to preserve.
