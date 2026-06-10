# Repo Organization Pass (post-defork)

Companion to `shadcn-cleanup-plan.md`. Scope: file/component/site organization now
that the marmelab fork constraint is gone. Delegate mode — calls made autonomously,
assumptions listed below.

## Trace — what the structure actually is

| Area | Finding |
|------|---------|
| `src/components/<block>/` | `admin/` + `ui/` are fork-era (May 2025). `extras`, `block-editor`, `leaflet`, `monaco`, `supabase`, `realtime`, `csv-import`, `mdx-editor`, `rich-text-input` were all added 2026-05 — these are the "additional directories." Each maps **1:1 to a registry block** (`scripts/registry.config.mjs` → `registry.json`), the published `shadcn add` surface. |
| `src/stories/` | **267 files** mirroring the component tree (admin alone: 156). The mirror was the chaos. |
| specs vs stories | **306 specs already colocated** in `src/components/`; **0 stories** were — total asymmetry. |
| `docs/` | Separate workspace package (`shadcn-admin-kit-doc`, Astro Starlight). Coverage-gated (`check-stories`/`check-specs`/`check-coverage`/`check-sidebar` wired into `make build-doc`). |
| `website/` | **No package.json** — second Vite entry in the *root* package (`website:dev/build`). Live marketing site; `make build-website` → `mv website/dist/* public/`. |
| `src/demo/` | Main playground (root `dev`). 6 `App.*.tsx` swap-entrypoints (not imported anywhere) + per-resource dirs. |

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Colocate all 267 stories** next to their component + spec | Kills the mirror; matches existing spec colocation. Registry excludes `.stories.` by **suffix** (`generate-registry.mjs:28`) so colocation does **not** change the published surface. Storybook glob is `src/**/*.stories.*` (recursive) so stories stay discovered. Stories import via `@/` alias so their own imports don't break. |
| 2 | **`_test-helpers.tsx` → `src/test/`** | Shared cross-block harness (`StoryAdmin`/`RealtimeStoryAdmin`), imported by 81 specs. No single block home. `@/test/...` resolves via the existing `@/* → src/*` alias (no config change). |
| 3 | **realtime `*-fixtures.ts` → `realtime/__fixtures__/`** | Story-local, imported relatively. `__fixtures__/` is auto-excluded from the registry (`DEFAULT_EXCLUDED_DIRS`), so colocating them next to the realtime stories keeps the realtime block clean. |
| 4 | **Keep `src/components/<block>/` block dirs as-is** | They are optional, dependency-heavy **registry blocks**, not fork-deference artifacts. The rationale changed (fork-respect → distribution); the structure is still correct. Flattening would force every consumer to pull leaflet/monaco/tiptap/supabase deps. |
| 5 | **Keep `website/` and `docs/` as two sites** | `website` is a live deploy target (Makefile `build`). `docs` is the Astro doc package. Legitimately separate; merging is risky and outward-facing. |
| 6 | **Leave `src/demo/` App variants** | Deliberate swap-entrypoints, not imported. Moving them risks breaking a manual dev workflow for ~no structural gain. |
| 7 | **Remove dead story-migration one-shots** | `docs/scripts/{fix-moved-story-imports,rewrite-spec-story-imports,rewrite-story-titles,list-story-moves}.mjs` + `scripts/audit-component-coverage.mjs` all read the now-deleted `src/stories/`, have 0 references, and are superseded. |

## Map

```
src/stories/<block>/<slug>.stories.tsx   ->  src/components/<block>/[subpath/]<slug>.stories.tsx   (260, sibling of component+spec)
src/stories/_test-helpers.tsx            ->  src/test/_test-helpers.tsx                              (+ @/stories/_test-helpers -> @/test/_test-helpers, 81 specs)
src/stories/realtime/<n>-fixtures.ts     ->  src/components/realtime/__fixtures__/<n>-fixtures.ts    (6, registry-excluded)
src/stories/                             ->  (deleted)
```

Touched configs: `docs/scripts/check-stories.mjs` (story path), `docs/scripts/check-specs.mjs`
(sibling-import assertion), `knip.json` (stories entry glob). `registry.json` regen also
absorbed a pre-existing stale `spinner`-block dep from the earlier spinner dedupe.

## Verification

typecheck ✅ · lint ✅ · `registry:generate` → **0 colocation delta** ✅ ·
check-stories/specs/docs/demo-coverage ✅ · 4 spec files / 7 tests across all 3
import-rewrite classes ✅.

## Deferred (NOT done — need explicit sign-off, outward-facing or distinct scope)

- **Flatten the 320-file `admin/` dir** into `inputs/`, `fields/`, `buttons/`, `layout/`, … —
  changes published install paths (registry `recursive:false` + every `@/components/admin/x`
  import). Needs a dedicated pass with registry coordination.
- **`check-sidebar` gap**: 32 orphan doc pages (the whole realtime suite + the removed `form`)
  not in `docs/sidebar.config.mjs`. Pre-existing; realtime ones likely need *adding* to the
  sidebar, `form` likely needs *deleting* (component removed this session). Distinct docs pass.
