# Source / Folder Reorganization — Design

**Date:** 2026-06-19
**Status:** Approved (design); ready for implementation plan
**Scope:** `packages/shadmin/src/components/{leaflet,extras,realtime}` + `packages/shadmin-core`

## Goal

Post-fork from marmelab, the source layout carries legacy organization that no longer fits:

1. **Leaflet** is disorganized — component `.tsx` files are split across `shapes/`, `osm/`, `geocoding/`, `geoman/` **and** the `leaflet/` top level, while ~40 `.spec`/`.stories` files sit orphaned at the top, separated from their components.
2. **Extras** is a meaningless label now that we're our own project — these are first-class components and belong under `admin/` by type.
3. **Realtime hooks + transports** (the headless half) belong in `shadmin-core` — they are the natural seed for the in-house core package.

This reorg does all three in one effort.

## The Governing Invariant

The registry derives each item's **name from the file basename, not its path** (`scripts/granularize-block.mjs:125` — `name: noExt.split("/").pop()`). Therefore **moving a file between directories inside a granularized block does not change its registry item name or the consumer's flat install**, provided:

- the file stays under a granularized block's `sourceDirs`, and
- no basename collision is introduced (the global dedupe guard in `generate-registry.mjs` errors on collisions).

**Per-task gate:** after each move, `git diff packages/shadmin/registry.json` must show **only the intended deltas** (block-membership changes, removed `extras`/realtime-hook items), nothing else. The E2E (`scripts/test-registry.sh`) is the consumer-install backstop. This makes Parts A and B pure, verifiable reshuffles. Part C is different — it changes *packaging*, see its section.

Every move updates, in lockstep: **{source files, `scripts/registry.config.mjs`, `index.ts` barrels, importer paths}** — then the registry-diff assertion.

---

## Part A — Leaflet: consistent, colocated subdirs

**Block:** `leaflet-admin` (`sourceDirs: src/components/leaflet`, recursive — unchanged).

**Target structure** (every component in a subdir with its `.spec` + `.stories` colocated; **no component at `leaflet/` top level**):

```
leaflet/
  index.ts, types.ts, shared.ts, shared-map.tsx        ← shared infra only
  shapes/        point-{field,input}, polygon-{field,input}, line-string-{field,input},
                 multi-{point,line-string,polygon}-{field,input}, geometry-collection-{field,input},
                 bbox-{field,input}, shape-field-shell, shape-input-shell  (+ each .spec/.stories)
  features/      feature-{field,input}, feature-collection-{field,input}, geojson-{field,input}
  coordinates/   lat-lng-{field,input}
  geocoding/     geocoding-input, map-with-search, reverse-geocode-field,
                 nominatim-client, use-geocode, use-reverse-geocode, leaflet-geocoding.stories
  osm/           osm-feature-{add,subtract,operator}, geometry-ops, osm-presets, osm-tag-catalog,
                 overpass-client, use-osm-features, use-osm-snap-to-roads, use-overpass, leaflet-osm.stories
  geoman/        use-geoman-rhf, geoman-shape-mapping, shape-constraints
  simplify/      simplify-input
```

**Moves:** the orphaned top-level `.spec`/`.stories` (point, polygon, line-string, multi-*, geometry-collection, osm-feature-*, map-with-search, reverse-geocode-field, geocoding-input) join their components in the matching subdir. The top-level components (`feature*`, `geojson*`, `lat-lng*`, `simplify-input`) move into `features/`, `coordinates/`, `simplify/`. Block-level demo stories (`leaflet.stories.tsx`, `leaflet-shapes.stories.tsx`) stay at the top.

**Risk:** lowest. Pure moves + relative-import fixups; name-preserving. Honors [[project_stories_colocated]].

---

## Part B — Extras: dissolve into `admin/`

**Remove the `extras` block** from `registry.config.mjs`. The `admin` block's `sourceDirs` is already `{ path: "src/components/admin", recursive: true }`, so files moved under `admin/` are picked up automatically and granularized by basename — **every component keeps its registry name**. The `@shadmin/extras` umbrella item disappears (acceptable — no external users).

**Component → destination mapping** (45 components):

| Destination | Components |
|---|---|
| `admin/fields/` | api-key-field, color-field, cron-field, currency-field, duration-field, phone-field, rating-field, subscription-plan-field, usage-meter-field, webhook-endpoint-field |
| `admin/inputs/` | api-key-input, color-input, cron-input, currency-input, duration-input, phone-input, rating-input, webhook-endpoint-input, subscription-plan-picker |
| `admin/buttons/` | dual-approval-button, status-transition-button |
| `admin/list/` | bulk-edit-drawer, filter-live-form, calendar-list, tree-list |
| `admin/form/` | wizard-form |
| `admin/collaboration/` (new) | comments-thread, presence-bar |
| `admin/widgets/` (new) | kanban-board, pivot-grid, dashboard-charts, schema-driven-view, record-timeline, approval-queue, assistant, command-menu, in-place-editor, onboarding-tour, theme-studio, layout-builder, i18n-key-editor, permission-matrix, job-monitor, diff-viewer, data-provider-devtools |

`admin/collaboration/` and `admin/widgets/` are new. **`admin/views/` is left untouched** — it holds the CRUD view shells (`create`, `edit`, `show`, `simple-show-layout`, `tabbed-show-layout`, `labeled`, `translatable-fields*`); the data-display widgets (kanban, pivot, dashboard-charts, schema-driven-view, record-timeline, approval-queue) go to `admin/widgets/` with the standalone tools rather than polluting the CRUD-shell directory.

**Non-component helpers** move beside their owning component (same destination subdir): `cron-utils.ts`→fields-or-inputs (cron pair — place in `admin/inputs/` next to cron-input, imported by both), `duration-utils.ts`→`admin/inputs/`, `command-menu-context.ts`→`admin/widgets/`, `assistant-transport.ts`→`admin/widgets/`, `theme-studio-vars.ts`→`admin/widgets/`, `data-provider-devtools-context.ts`→`admin/widgets/`. (A helper shared by a field+input pair lives with whichever the spec's plan designates and the other imports across — note the exact path in the plan to avoid a broken relative import.)

**`ui/color-picker`** is currently an `extras` block extraFile (needed by `color-input`). Re-home it into the **`admin` block's extraFiles** in `registry.config.mjs` (`OUR_UI_ITEMS` already contains nothing for it — it ships as a bundled extraFile, not a granular item; keep that treatment under admin).

**Barrels:** delete `extras/index.ts`; fold its exports into the appropriate `admin/<subdir>/index.ts` (or the admin barrel), matching the existing admin barrel convention.

**Risk:** medium — many moves, but each name-preserving. The registry-diff gate per move catches mistakes.

---

## Part C — Realtime → `shadmin-core` (packaging change)

**Move to `shadmin-core/src/realtime/`** (verified headless — these import only `shadmin-core`/`react`/`@tanstack/react-query`/siblings, zero JSX, zero `@/components`):

- `hooks/*` — all 17 (`use-subscribe`, `use-subscribe-to-record{,-list}`, `use-subscribe-callback`, `use-publish`, `use-get-{one,many,list}-live`, `use-get-lock{,s}{,-live}`, `use-lock`, `use-unlock`, `use-lock-on-mount`, `use-on-reconnect`, `use-realtime-status`)
- `transports/*` — `broadcast-channel-transport`, `sse-transport`, `websocket-transport`, `fake-transport`, `in-memory-lock-provider`
- `add-events-for-mutations.ts`, `realtime-data-provider.ts`, `topics.ts`, `types.ts`

**Stay in the registry** (`realtime` block) — the UI components, which now import the hooks from `"shadmin-core"`:

- `list-live`, `edit-live`, `show-live`, `menu-live`, `lock-status`, `lock-on-mount`

**`shadmin-core` changes:**
- add `src/realtime/` + a barrel; `src/index.ts` adds `export * from "./realtime"` (verify no name collision with the ra-core re-export surface; the realtime symbols are distinct).
- `package.json`: add `react` + `@tanstack/react-query` as **peerDependencies**, `mock-socket` as a **devDependency** (transport tests). Keep `private: true` for now.
- the in-package realtime files import ra-core symbols directly (they're now *inside* core); ensure the `noRestrictedImports` "use shadmin-core not ra-core" Biome rule is scoped to the **registry** source, not `shadmin-core` itself (core may import ra-core).

**The consequence (accepted — "all three in one go"):** `shadmin-core` is `private`/unpublished. Once the realtime registry components import it, **a registry consumer cannot `shadcn add` them** — `npm i shadmin-core` 404s. So:

- **Realtime is monorepo-internal until `shadmin-core` is published.** Dev/demo work (workspace resolution); external consumer install of realtime is deferred.
- **E2E adjustment:** `scripts/test-registry.sh` installs blocks into a fresh out-of-workspace consumer app. The realtime block's consumer-install step must be **skipped (or marked expected-fail with a logged reason)** until core publishes — do NOT let it silently pass or silently break. Realtime stays verified by the in-monorepo typecheck/build/test.
- **Docs:** the `use-*` realtime hook pages in the website (`/docs/use-subscribe`, etc.) are registry-generated catalog entries today; after the move they're no longer registry items. They remain as MDX guide pages (content already ported) but lose their install card. Acceptable; note in the manifest generator that realtime hooks are now a `shadmin-core` API surface, not registry items.

**Enabling follow-up (out of scope here):** publish `shadmin-core` (0.x). This rides naturally with the final-stretch ra-core→core port ([[project_strategic_replan]]), where core becomes real in-house logic worth publishing. Until then, realtime's external availability is paused — a deliberate, recorded trade-off.

**Risk:** highest — packaging + registry-surface + E2E + docs all shift. Do this part last in the plan, after A and B are green.

---

## Out of Scope / Keep As-Is

- **Other feature blocks** — `block-editor`, `rich-text-input`, `mdx-editor`, `monaco`, `csv-import`, `supabase` are cohesive, self-contained blocks with distinct deps. Not extras-like; leave them.
- **`packages/shadmin/temp/` + `temp-rich-text-input/`** — untracked local scaffolding (0 git files); `rm -rf` to declutter the worktree (not a repo change).
- **Publishing `shadmin-core`** — separate effort (see Part C follow-up).
- **The ra-core→core port** — the final-stretch goal; this reorg only seeds core's `realtime/`.

## Sequencing (single plan, ordered)

1. **Leaflet** (A) — isolated, lowest risk.
2. **Extras** (B) — dissolve into admin.
3. **Realtime→core** (C) — packaging change, last.

Each step ends green (typecheck + Biome + build + registry-diff assertion + E2E); after C, E2E realtime is monorepo-only.

## Assumptions (open to correction during spec review)

1. The extras taxonomy table — esp. the new `admin/widgets/` + `admin/collaboration/` subdirs and the views/list/form placements of the non-field/input/button widgets. Most opinionated part; reassign any specific component freely.
2. Breaking `@shadmin/extras` (umbrella) and pausing realtime's consumer-install path are **acceptable** (no external users yet).
3. Realtime (C) proceeds now and goes monorepo-internal; publishing `shadmin-core` is a recommended follow-up, **not** part of this work.
4. Leaflet subdir names (`features`, `coordinates`, `simplify`) are mine — rename freely.
5. Helper files colocate with their owning component; where a helper is shared by a field+input pair, the plan names the canonical path and the sibling imports across.
6. Other feature blocks stay untouched.

## Risks & Mitigations

- **Basename collision when merging extras into admin** → dedupe guard errors at generate time; the registry-diff gate catches it per move.
- **Broken relative imports after moves** → typecheck + build per step; importer-path fixups are part of each move.
- **Realtime E2E breakage** → explicitly skip/quarantine realtime consumer-install with a logged reason (Part C); never silent.
- **`shadmin-core` index name collisions** (ra-core re-export vs realtime) → verify at the barrel; rename or scope if any clash.
- **Turbo cached green masking a real failure** → run registry generate/build uncached (`--force` / direct) when asserting the byte-diff ([[project_leaflet_build_broken]] caveat).
