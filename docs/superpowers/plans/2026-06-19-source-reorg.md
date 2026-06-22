# Source / Folder Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `packages/shadmin` source so Leaflet is consistently structured with colocated tests/stories, the `extras` block dissolves into typed `admin/` subdirectories (and becomes granular registry items), and the headless realtime hooks/transports move into `shadmin-core`.

**Architecture:** Three sequential parts (A Leaflet → B Extras → C Realtime), each independently green. Parts A/B are registry source reshuffles verified by an explicit `registry.json` diff gate; Part C is a packaging change (registry → npm package) that makes realtime monorepo-internal until `shadmin-core` publishes.

**Tech Stack:** pnpm + turborepo monorepo, the registry pipeline (`scripts/registry.config.mjs` → `generate-registry.mjs` → `build-registry.mjs` → `test-registry.sh`), Biome, vitest (browser provider), `shadmin-core` workspace package.

**Spec:** `docs/superpowers/specs/2026-06-19-source-reorg-design.md`

## Global Constraints

- **Registry item NAMES never change.** Moving a file inside a granularized block keeps its basename-derived item name (`granularize-block.mjs:125`). Only the `admin` block is granularized.
- **Registry-impact reality (verified):** only `admin` has `granularize: true`. `extras`, `realtime`, `leaflet-admin` ship as single monolith items. Therefore:
  - **A (Leaflet):** the `leaflet-admin` monolith item stays; only its bundled files' target paths shift to mirror new subdirs.
  - **B (Extras):** the `extras` monolith item is **removed**; the 45 former-extras components become **new granular `@shadmin/<name>` items** (admin is granularized) **and** join the `@shadmin/admin` monolith bundle. No name collisions exist (verified).
  - **C (Realtime):** the `realtime` monolith item stays but bundles only the 6 UI components and gains a `shadmin-core` npm dependency → not consumer-installable until `shadmin-core` publishes.
- **Per-task gate** (the "test" for a move task): (1) `pnpm --filter shadmin registry:generate` then `git diff --stat packages/shadmin/registry.json` shows **only the intended delta** for that task; (2) `pnpm exec turbo run typecheck` green; (3) Biome clean on touched files; (4) the moved components' own `.spec` files still pass; (5) for the final task of each part, `bash packages/shadmin/scripts/test-registry.sh` green.
- **Lockstep:** every move updates {source files (+ their `.spec`/`.stories`), `registry.config.mjs` if block boundaries change, `index.ts` barrels, importer paths} together.
- **Helper files** (non-component `.ts`) move beside their owning component; fix ALL importers (grep the helper's basename) to the new relative path.
- **Commit directly to `main`** (per project convention); end messages with the Co-Authored-By trailer.
- **Don't trust turbo-cached green** for the registry diff — run `registry:generate` directly (it's not turbo-cached).

---

## Part A — Leaflet

### Task A1: Reorganize `leaflet/` into colocated subdirs

**Files (moves under `packages/shadmin/src/components/leaflet/`):**
- Into `features/`: `feature-field`, `feature-input`, `feature-collection-field`, `feature-collection-input`, `geojson-field`, `geojson-input` (each `.tsx` + `.spec.tsx` + `.stories.tsx` where present) — currently top-level.
- Into `coordinates/`: `lat-lng-field`, `lat-lng-input` (+ spec/stories).
- Into `simplify/`: `simplify-input` (+ spec/stories).
- Into `shapes/` (the loose top-level `.spec`/`.stories` whose `.tsx` already lives in `shapes/`): `point-{field,input}`, `polygon-{field,input}`, `line-string-{field,input}`, `multi-{point,line-string,polygon}-{field,input}`, `geometry-collection-{field,input}` — move the orphaned `.spec.tsx`/`.stories.tsx` from top-level into `shapes/`.
- Into `osm/`: orphaned `osm-feature-add.{spec,stories}.tsx`, `osm-feature-subtract.{spec,stories}.tsx` (the `.tsx` already in `osm/`).
- Into `geocoding/`: orphaned `geocoding-input.{spec,stories}.tsx`, `map-with-search.{spec,stories}.tsx`, `reverse-geocode-field.{spec,stories}.tsx` (the `.tsx` already in `geocoding/`).
- Stay at top level: `index.ts`, `types.ts`, `shared.ts`, `shared-map.tsx`, `leaflet.stories.tsx`, `leaflet-shapes.stories.tsx`.

**Interfaces:** Produces no API change — pure relocation. The `leaflet-admin` block (`registry.config.mjs:235`, `sourceDirs: src/components/leaflet` recursive) is unchanged.

- [ ] **Step 1: Record the baseline registry**
  Run: `cd packages/shadmin && pnpm registry:generate && git stash` is NOT needed — instead capture: `git show HEAD:packages/shadmin/registry.json > /tmp/reg-before.json` (baseline for the diff).

- [ ] **Step 2: Move files with `git mv`**
  Create the subdirs and move each file + its colocated `.spec`/`.stories`. Example for the `features/` group:
  ```bash
  cd packages/shadmin/src/components/leaflet
  mkdir -p features coordinates simplify
  for n in feature-field feature-input feature-collection-field feature-collection-input geojson-field geojson-input; do
    for ext in tsx spec.tsx stories.tsx; do [ -f "$n.$ext" ] && git mv "$n.$ext" "features/$n.$ext"; done
  done
  for n in lat-lng-field lat-lng-input; do for ext in tsx spec.tsx stories.tsx; do [ -f "$n.$ext" ] && git mv "$n.$ext" "coordinates/$n.$ext"; done; done
  for ext in tsx spec.tsx stories.tsx; do [ -f "simplify-input.$ext" ] && git mv "simplify-input.$ext" "simplify/simplify-input.$ext"; done
  ```
  Then move the orphaned shapes/osm/geocoding specs+stories into their existing component subdirs (the `.tsx` is already there):
  ```bash
  for n in point-field point-input polygon-field polygon-input line-string-field line-string-input \
           multi-point-field multi-point-input multi-line-string-field multi-line-string-input \
           multi-polygon-field multi-polygon-input geometry-collection-field geometry-collection-input; do
    for ext in spec.tsx stories.tsx; do [ -f "$n.$ext" ] && git mv "$n.$ext" "shapes/$n.$ext"; done
  done
  for n in osm-feature-add osm-feature-subtract; do for ext in spec.tsx stories.tsx; do [ -f "$n.$ext" ] && git mv "$n.$ext" "osm/$n.$ext"; done; done
  for n in geocoding-input map-with-search reverse-geocode-field; do for ext in spec.tsx stories.tsx; do [ -f "$n.$ext" ] && git mv "$n.$ext" "geocoding/$n.$ext"; done; done
  ```

- [ ] **Step 3: Fix imports**
  The moved files' relative imports (to `../shared`, `./types`, sibling components) now resolve from a deeper path. Run typecheck to surface every break and fix each (`@/`-alias imports are unaffected; only relative `./`/`../` imports in moved files + any file importing a moved file need updating). Update `leaflet/index.ts` to point at the new subdir paths.
  Run: `pnpm exec turbo run typecheck --filter shadmin` → fix until clean.

- [ ] **Step 4: Gate — registry delta is target-paths only**
  Run: `cd packages/shadmin && pnpm registry:generate && node -e "const a=require('/tmp/reg-before.json'),b=require('./registry.json'); const an=a.items.map(i=>i.name).sort(), bn=b.items.map(i=>i.name).sort(); console.log('items added/removed:', JSON.stringify([...new Set([...an,...bn])].filter(n=>an.includes(n)!==bn.includes(n))))"`
  Expected: `items added/removed: []` (no item names change — only the `leaflet-admin` item's internal file `path`/`target` strings shift, which is the intended delta). Then `git diff packages/shadmin/registry.json` — confirm only `src/components/leaflet/...` path strings changed.

- [ ] **Step 5: Run leaflet specs**
  Run: `pnpm --filter shadmin test -- leaflet` (vitest browser, headless). Expected: all leaflet specs pass.

- [ ] **Step 6: Commit**
  ```bash
  git add -A packages/shadmin/src/components/leaflet packages/shadmin/registry.json
  git commit -m "refactor(leaflet): colocate tests/stories, typed subdirs, no loose components"
  ```

---

## Part B — Extras → admin

> Each B task moves a destination group, updating both barrels (`extras/index.ts` shrinks, `admin/index.ts` grows) and importers. The `extras` block stays defined until Task B4 (it still builds with fewer files — a shrinking monolith). The `admin` block (recursive) auto-picks-up moved files, emitting new granular items.

### Task B1: Fields + Inputs → `admin/fields/`, `admin/inputs/`

**Files:**
- `git mv` to `admin/fields/` (+ `.spec`/`.stories`): api-key-field, color-field, cron-field, currency-field, duration-field, phone-field, rating-field, subscription-plan-field, usage-meter-field, webhook-endpoint-field.
- `git mv` to `admin/inputs/` (+ `.spec`/`.stories`): api-key-input, color-input, cron-input, currency-input, duration-input, phone-input, rating-input, webhook-endpoint-input, subscription-plan-picker.
- Helpers → `admin/inputs/`: `cron-utils.ts`, `duration-utils.ts`.

**Interfaces:** Produces 19 new granular registry items (names = component basenames; collision-free, verified).

- [ ] **Step 1: Baseline** `git show HEAD:packages/shadmin/registry.json > /tmp/reg-before.json`.
- [ ] **Step 2: Move** the 19 components (+ spec/stories) and the 2 helpers with `git mv` into the target subdirs.
- [ ] **Step 3: Barrels** — remove the 19 + 2 lines from `extras/index.ts`; add to `admin/index.ts` as `export * from "@/components/admin/fields/<name>";` / `.../inputs/<name>";` (match the existing alias-path style).
- [ ] **Step 4: Fix imports** — grep each moved file's basename and `cron-utils`/`duration-utils` across `src/`; update relative importers to the new paths. `pnpm exec turbo run typecheck --filter shadmin` → clean.
- [ ] **Step 5: Gate** — `pnpm registry:generate`; assert via the diff script that the **only item-set change is +19 new items** (the moved components) and **no names removed** (extras monolith still present until B4). `git diff` shows the new items target `components/admin/fields|inputs/...`. Biome clean on touched files.
- [ ] **Step 6: Specs** — `pnpm --filter shadmin test -- "fields|inputs"` for the moved components pass.
- [ ] **Step 7: Commit** `refactor(extras): move fields+inputs into admin/{fields,inputs}`.

### Task B2: Buttons + List + Form

**Files:**
- `admin/buttons/`: dual-approval-button, status-transition-button.
- `admin/list/`: bulk-edit-drawer, filter-live-form, calendar-list, tree-list.
- `admin/form/`: wizard-form.
(each + `.spec`/`.stories`)

- [ ] **Step 1: Baseline** as B1.
- [ ] **Step 2: Move** the 7 components with `git mv`.
- [ ] **Step 3: Barrels** — remove from `extras/index.ts`; add to `admin/index.ts` with the matching subdir alias paths.
- [ ] **Step 4: Fix imports** + typecheck clean.
- [ ] **Step 5: Gate** — `registry:generate`; assert +7 new items, none removed; targets correct; Biome clean.
- [ ] **Step 6: Specs** for the 7 pass.
- [ ] **Step 7: Commit** `refactor(extras): move buttons+list+form into admin/`.

### Task B3: Widgets + Collaboration

**Files:**
- `admin/widgets/` (new): kanban-board, pivot-grid, dashboard-charts, schema-driven-view, record-timeline, approval-queue, assistant, command-menu, in-place-editor, onboarding-tour, theme-studio, layout-builder, i18n-key-editor, permission-matrix, job-monitor, diff-viewer, data-provider-devtools.
- Helpers → `admin/widgets/`: command-menu-context.ts, assistant-transport.ts, theme-studio-vars.ts, data-provider-devtools-context.ts.
- `admin/collaboration/` (new): comments-thread, presence-bar.
(each component + `.spec`/`.stories`)

- [ ] **Step 1: Baseline** as B1.
- [ ] **Step 2: Move** the 19 components + 4 helpers with `git mv` (`mkdir -p admin/widgets admin/collaboration`).
- [ ] **Step 3: Barrels** — remove from `extras/index.ts`; add to `admin/index.ts` (`.../widgets/<name>`, `.../collaboration/<name>`).
- [ ] **Step 4: Fix imports** (grep each basename + the 4 helpers) + typecheck clean.
- [ ] **Step 5: Gate** — `registry:generate`; assert +19 new items, none removed; targets correct; Biome clean.
- [ ] **Step 6: Specs** for the moved components pass.
- [ ] **Step 7: Commit** `refactor(extras): move widgets+collaboration into admin/`.

### Task B4: Remove the `extras` block + rehome color-picker

**Files:**
- Modify: `packages/shadmin/scripts/registry.config.mjs` — delete the `extras` block (the `name: "extras"` entry, ~line 279). Add `{ path: "src/components/ui/color-picker", recursive: false }`-equivalent files to the **`admin` block's `extraFiles`** (color-picker ships bundled, as it did under extras — match its prior `type`/`target`).
- Delete: `packages/shadmin/src/components/extras/index.ts` and the now-empty `src/components/extras/` dir (only `__screenshots__` + `index.ts` should remain; verify no `.tsx` left).
- Verify: `admin/index.ts` already re-exports everything formerly in `extras/index.ts` (added across B1–B3).

- [ ] **Step 1: Baseline** `git show HEAD:packages/shadmin/registry.json > /tmp/reg-before.json`.
- [ ] **Step 2: Confirm `extras/` is component-empty** — `find src/components/extras -name '*.tsx' ! -name '*.spec.*' ! -name '*.stories.*'` returns nothing (all moved in B1–B3). Move any stragglers.
- [ ] **Step 3: Edit `registry.config.mjs`** — remove the `extras` block; add color-picker to the `admin` block `extraFiles` with the same shape it had under extras (read the old extras block's color-picker entry first, replicate under admin).
- [ ] **Step 4: Delete `extras/index.ts`** and remove the empty `extras/` dir (keep nothing but, if present, relocate `__screenshots__` or let it be removed if empty).
- [ ] **Step 5: Gate** — `pnpm registry:generate`; assert the **only removed item is `extras`** (the umbrella monolith) and **no items added/removed beyond that** (B1–B3 already added the granular items). `git diff` confirms color-picker now ships under the admin block. `pnpm exec turbo run typecheck` clean; Biome clean.
- [ ] **Step 6: Full E2E** — `bash packages/shadmin/scripts/test-registry.sh` green (installs admin + a former-extras granular item into the consumer app; confirms color-picker resolves under admin).
- [ ] **Step 7: Commit** `refactor(extras): remove block; color-picker → admin extraFiles`.

---

## Part C — Realtime → shadmin-core

### Task C1: Move headless realtime into `shadmin-core`

**Files:**
- Create `packages/shadmin-core/src/realtime/` and `git mv` into it (with `.spec` files): all of `packages/shadmin/src/components/realtime/hooks/*` (17 hooks), `realtime/transports/*` (broadcast-channel-transport, sse-transport, websocket-transport, fake-transport, in-memory-lock-provider), `realtime/add-events-for-mutations.ts`, `realtime/realtime-data-provider.ts`, `realtime/topics.ts`, `realtime/types.ts`, and `realtime/__fixtures__/` if used by the moved specs.
- Create `packages/shadmin-core/src/realtime/index.ts` — barrel re-exporting the moved hooks/transports/types (mirror the type+value exports currently in `realtime/index.ts`).
- Modify: `packages/shadmin-core/src/index.ts` — add `export * from "./realtime";`.
- Modify: `packages/shadmin-core/package.json` — add `peerDependencies`: `react`, `@tanstack/react-query`; `devDependencies`: `mock-socket`. Keep `private: true`.
- Modify: the Biome `noRestrictedImports` rule (find it: `grep -rn noRestrictedImports packages biome.jsonc`) — scope the "import from shadmin-core not ra-core" restriction to exclude `packages/shadmin-core/**` (core may import ra-core).

**Interfaces:** Produces `shadmin-core` exports for every moved hook/transport/type. The moved files' former `import ... from "shadmin-core"` (ra-core symbols) become internal — either direct `ra-core` imports or relative; the in-package imports between hooks become relative (`./use-on-reconnect`, etc., already relative).

- [ ] **Step 1: Move** the headless files with `git mv` into `shadmin-core/src/realtime/` (+ specs + fixtures).
- [ ] **Step 2: Rewrite imports inside moved files** — `from "shadmin-core"` → `from "ra-core"` (these were ra-core symbols re-exported by the core barrel; inside core, import ra-core directly to avoid a self-cycle). Sibling imports (`./use-subscribe`, `../types`) stay relative and resolve in the new layout.
- [ ] **Step 3: Barrel + package** — write `shadmin-core/src/realtime/index.ts`; add `export * from "./realtime"` to `src/index.ts`; add the deps to `package.json`; scope the Biome rule.
- [ ] **Step 4: Install + typecheck core** — `pnpm install`; `pnpm --filter shadmin-core typecheck` clean. Verify no name collision between the realtime barrel and the `export * from "ra-core"` (run typecheck; a duplicate-export error surfaces a clash — rename/scope if any).
- [ ] **Step 5: Specs** — run the moved realtime hook/transport specs from their new home (`pnpm --filter shadmin-core test` if core has a test runner, else add a minimal `vitest`/`node --test` setup matching the spec style; the specs use vitest + mock-socket). Confirm green.
- [ ] **Step 6: Commit** `feat(core): move realtime hooks+transports into shadmin-core`.

### Task C2: Repoint realtime components + shrink the registry block

**Files:**
- Modify the 6 components in `packages/shadmin/src/components/realtime/` (`list-live`, `edit-live`, `show-live`, `menu-live`, `lock-status`, `lock-on-mount`): change `import { useX } from "./hooks/..."` → `import { useX } from "shadmin-core"`.
- Modify `realtime/index.ts` — drop the type/hook/transport exports now in core; keep only the 6 component exports (+ re-export the realtime types from `shadmin-core` if consumers expect them via this barrel: `export type { RealtimeDataProvider, ... } from "shadmin-core";`).
- Verify `realtime/hooks/`, `realtime/transports/` dirs are gone (emptied by C1).

**Interfaces:** Consumes the `shadmin-core` realtime exports from C1.

- [ ] **Step 1: Baseline** `git show HEAD:packages/shadmin/registry.json > /tmp/reg-before.json`.
- [ ] **Step 2: Repoint imports** in the 6 components to `shadmin-core`; update `realtime/index.ts`.
- [ ] **Step 3: Typecheck** — `pnpm exec turbo run typecheck` clean (the registry source now imports `shadmin-core` for realtime hooks — resolves via workspace).
- [ ] **Step 4: Gate** — `pnpm registry:generate`; assert the `realtime` item still exists, now bundles only the 6 components, and lists `shadmin-core` in its npm `dependencies`. No other item changes. `git diff` confirms the removed hook/transport files + the added dep.
- [ ] **Step 5: Realtime component specs** pass (`pnpm --filter shadmin test -- realtime`).
- [ ] **Step 6: Commit** `refactor(realtime): components import hooks from shadmin-core`.

### Task C3: E2E quarantine + docs note

**Files:**
- Modify: `packages/shadmin/scripts/test-registry.sh` — the realtime block can no longer install into an out-of-workspace consumer (`shadmin-core` is unpublished). Wrap the realtime install step in a skip with a **loud logged reason** (e.g. `echo "SKIP realtime consumer-install: depends on unpublished shadmin-core (see source-reorg spec Part C)"`), not a silent removal. If realtime isn't individually exercised by the E2E today, add an explicit comment marking it quarantined so it isn't re-added blindly.
- Modify: `apps/website/scripts/generate-docs-manifest.mjs` — add a comment (and, if the manifest derives realtime from the registry item, ensure the `use-*` hook pages are handled) noting realtime hooks are now a `shadmin-core` API surface, not registry items. The `/docs/use-*` MDX pages remain as guides (no registry install card).

- [ ] **Step 1: Quarantine** the realtime consumer-install in `test-registry.sh` with the logged reason.
- [ ] **Step 2: E2E** — `bash packages/shadmin/scripts/test-registry.sh` green (realtime skipped with the reason printed).
- [ ] **Step 3: Docs manifest** — `pnpm --filter shadmin-website docs:manifest && pnpm --filter shadmin-website docs:check` green; confirm the website builds (`pnpm --filter shadmin-website build`) and the `/docs/use-subscribe` page still renders as a guide.
- [ ] **Step 4: Commit** `chore(realtime): quarantine E2E consumer-install; docs note (core API)`.

---

## Final Verification (whole-branch, after all tasks)

- [ ] `pnpm exec turbo run typecheck` — all packages green.
- [ ] `pnpm --filter shadmin test` — full package spec suite green (run once, at the end).
- [ ] `bash packages/shadmin/scripts/test-registry.sh` — green (realtime quarantined with reason).
- [ ] `pnpm --filter shadmin-website build` + `make build` exit 0.
- [ ] `git diff <branch-base> -- packages/shadmin/registry.json` reviewed: `extras` removed; +45 granular former-extras items; leaflet target-paths shifted; realtime item shrunk + `shadmin-core` dep. Nothing unexpected.

## Self-Review

- **Spec coverage:** A (leaflet) ✓ Task A1; B (extras dissolve + color-picker + block removal) ✓ B1–B4; C (realtime→core + components + E2E/docs) ✓ C1–C3. Out-of-scope items (other blocks, publishing core, temp/ cruft) correctly excluded.
- **Registry mechanics:** corrected from the spec's "byte-identical" to the accurate per-part deltas (only `admin` is granularized → extras components become +45 granular items). Gate scripts assert the exact item-set change per task.
- **Type consistency:** barrels use `@/components/admin/<subdir>/<name>`; core realtime barrel mirrors the existing `realtime/index.ts` export names; the 6 components consume `shadmin-core`.
- **Risks:** basename collisions (none — verified), broken relatives (typecheck per task), realtime E2E (explicit quarantine), core barrel name clash (typecheck check in C1 Step 4), turbo-cached green (run `registry:generate` directly).
