# Chelone P7 — Reference App: shadcn UI rebridge + registry + website/docs/demo

**Date:** 2026-07-03 · **Repo:** `chelone` (commits to main; never push) · **Charter:** shadcn-admin-kit `docs/brainstorming/specs/2026-06-23-chelone-charter.md` §5 (react package = the shadcn components), §6 (port plan), §7 P7, §8 (v1 scope), §11 #22 (docs quickstart)

**The final v1 phase.** P0–P6 built the headless engine + shell + router + forms. P7 builds the **visible half**: the shadcn-native component surface (ported from shadmin's `components/admin/*`, rewired onto `@chelone/react` hooks), the registry pipeline, and the website/docs/demo copied as a consumer of `@chelone/*`.

**Research reference files** (on disk, read them — exhaustive detail): `chelone/.superpowers/sdd/p7/rebridge-delta-table.md` (the ra-core→@chelone hook delta + GAP list), `rebridge-inventory.md` (component families + counts + wave grouping), `registry-pipeline-reference.md` (the 4-stage pipeline + landmines), `website-copy-map.md` (site/docs/demo copy plan).

---

## 0. Research ground truth (2026-07-03; shadmin + chelone probed)

### 0a. The dominant finding — components don't exist yet, and the rebridge has a prerequisite
- `@chelone/react/src` ships **only headless logic** (admin/ form/ resource/ router/ ssr/ + hooks). The ONLY `.tsx` view is `form/filter-live-form.tsx`. There is **NO** List/DataTable/Edit/Create/Show/SimpleForm/TextField/TextInput/Layout/Sidebar/LoginPage. P7 BUILDS these.
- Components live at `packages/react/src/components/` (charter §5: the react package holds the shadcn components). Sub-tree mirrors shadmin: `ui/` (primitives) + `admin/` (inputs, fields, list, views, layout, form, buttons, auth, common).
- **The rebridge is a single clean seam:** shadmin components reach ra-core via `shadmin-core` (a verbatim `export * from "ra-core"`), almost never importing ra-core directly (5 files). So a family-wide port is mostly repointing that import to `@chelone/react` + per-hook contract fixups — NOT per-file archaeology.

### 0b. The GAP list — hooks/components shadmin uses that @chelone/react does NOT export yet (P7a authors these FIRST)
From `rebridge-delta-table.md`. Ordered by usage/blocking:
- **`useRecordContext` (61 uses)** — GAP. Author a thin hook + `RecordContext`/`RecordContextProvider` over the record a controller provides.
- **`useFieldValue` (52)** — GAP. `{ source, record?, defaultValue? }` → value at source from the ambient record.
- **`useGetRecordRepresentation` (34) / `useGetResourceLabel` (35) / `useTranslateLabel` (9) / `useResourceTranslation` (30)** — GAP. i18n/label helpers over resource definitions + i18n.
- **`useList` (12)** — GAP. Client-side list (data in props, no dataProvider) → a ListContext; needed by inline-choices + array-of-embedded.
- **`ValidationError` as a JSX component (~8)** — GAP/SHAPE. Core exports `ValidationError` as an Error CLASS; shadmin renders `<ValidationError error={...}/>`. Author a react component that renders a `string | TranslatableMessage` via `useTranslate`.
- **RHF family (27 files): `useWatch`/`useFormContext`/`useFormState`/`Controller`/`FormProvider`/`useFieldArray`/`useController`** — GAP. Chelone has no react-hook-form. Map each to `CheloneFormProvider` + `useInput` + `useForm` state slices + `createArrayBinding`/`ArrayInputProvider`. Deepest semantic rewrites (array/date/time inputs, both login forms, wizard-form, simple-form-iterator, save-button, bulk-edit-drawer, in-place-editor).
- **`useStore` → `useStoreItem` (RENAME+SHAPE, 30) / `usePreference` (13, GAP)** — store alias + preferences stack (preferences = inspector-only, deferrable).
- **`useSaveContext` (2, GAP) / `useEditContext`→`useEditController` / `useShowContext`→`useShowController`** — controller-hook aliases + a SaveContext exposure.
- **`useRefresh` (6) / `useLoading` (6) / `useDataProvider` (7) / `useFilterContext` (6) / `useIsMobile` (9) / `useSemanticElements` (11) / `useLocaleState`→`useLocale`+`useSetLocale`** — small GAPs; author or map.
- **Deferrable GAPs (extras-only):** `useTranslatableContext` (translatable fields), `useSupportCreateSuggestion`/create-suggestion stack, `usePreference`/inspector, `useReferenceManyFieldController`. Defer with the extras.

### 0c. SHAPE divergences (semantic fixups the port must handle everywhere)
- **Error shape (high-risk, pervasive):** ra-core `fieldState.error` is an RHF object (`{message, root:{message}}`) carrying `@@react-admin@@`-prefixed strings; chelone `fieldState.error` is a native `string | TranslatableMessage`. **Every shadmin site doing `error?.root?.message ?? error?.message` must change** to render a `TranslatableMessage` (via the new `<ValidationError>` / `useTranslate`).
- **`useListContext.setFilters`** debounce is now controller-owned (P4 `createListController`), not in the hook.
- **`Admin`/`Resource`** — chelone `<Admin>` is children-composable (P6); shadmin wraps `CoreAdminContext`/`CoreAdminUI` with `CoreAdminProps`. Prop surface differs; the demo/docs `<Admin>` usage rewrites.

### 0d. Registry pipeline (from `registry-pipeline-reference.md`)
4 stages: config (`registry.config.mjs` — hand-authored blocks/themes/baseStyles) → generate (`registry:generate` walks `src/`, granularizes per-file items + import-graph deps → `registry.json`) → build (`registry:build` → `dist/r/*.json` via pinned shadcn CLI; auto-blocks get deps RECOMPUTED, 3 manual blocks verbatim) → test (`test-registry.sh` E2E installs into a scratch Vite consumer). Landmines: shadcn exits 0 on error (real gate = downstream `vite build`); granularize must skip `itemRef.name===blockName`; basename collisions throw; root tsconfig needs `paths {"@/*":["./src/*"]}`; pin shadcn version; the `shadmin-core→ra-core` import rewrite (workspace seam → real published dep). **chelone wrinkle:** `@chelone/core`+`@chelone/react` are unpublished 0.0.0 — the registry's copied source needs them as REAL npm deps, so registry E2E is BLOCKED until they're published (external dep — user action).

### 0e. Website/docs/demo (from `website-copy-map.md`)
- shadmin `apps/website` = ONE React Router v7 SPA (`@react-router/dev`, `ssr:false`, SSG via `prerender()`, `future.unstable_optimizeDeps:true`, MDX pipeline). Three areas: `landing/` (27 files, ZERO admin imports — copies wholesale bar brand/install/snippets), `docs/` (nav engine + MDX components copy wholesale; content mostly rewrites), `demo/` (real admin app — heavy rewrite).
- **Consume model:** `chelone/apps/website` = new workspace member; `@chelone/*` resolve to SRC via workspace symlink (exactly the shadmin-core model, no dist/plugin for the packages). `unstable_optimizeDeps` still required for TanStack dedup. A Vite src-alias is needed for the NEW `packages/react/src/components` views (the shadmin `shadminSourcePlugin` analog).
- Docs `props/` = typedoc-generated (regenerate against `@chelone/*`, don't copy). Docs `images/` = regenerate from the new demo (drop the `MdxImg` guard). Extras docs (block-editor/leaflet/monaco/etc) DROP/defer.

---

## 1. Decisions (assumptions — the user's review checkpoint)

| # | Decision | Why |
|---|----------|-----|
| D1 | **v1 scope cut.** v1 = the `admin/` CORE surface (inputs, fields, list/datagrid, CRUD views, layout, form layouts, buttons, auth, common) + `ui/` primitives verbatim. **DEFERRED to post-v1:** all extras (leaflet, monaco, block-editor, mdx-editor, rich-text-input, csv-import, realtime, supabase), widgets (kanban/pivot/command-menu/assistant/dashboards), collaboration, inspector/preferences, translatable-inputs, create-suggestion, guessers. | Charter §8 v1 = ra-core parity core; extras are §3 post-v1. 1014 files is not one phase; the core admin surface (~229 files) is v1. |
| D2 | **Components live in `packages/react/src/components/`** (`ui/` + `admin/`). The headless hooks stay where they are; `components/` is additive. | Charter §5: the react package holds the shadcn components. |
| D3 | **P7a compatibility layer FIRST.** Author every non-deferred GAP hook + `<ValidationError>` component + the RHF→chelone form-context shims in `@chelone/react` BEFORE porting components. Deferred-extras-only GAPs are NOT built (leaflet/inspector/translatable/create-suggestion/preferences hooks). | 0b: the rebridge is blocked on these; authoring them once unblocks all component waves. |
| D4 | **Port, don't rewrite, the components.** shadmin's `components/admin/*` + `ui/` are the user's own post-defork work — COPY them into chelone, then repoint `shadmin-core`→`@chelone/react` + apply the 0c error-shape + Admin/Resource fixups. Not clean-room (clean-room was only for the ra-core-derived CORE, done in P0–P6). | User owns the components; copy+rebridge is far faster than rewrite and preserves the "absolute cinema" UI. |
| D5 | **Error-shape fixup is a cross-cutting sweep.** Provide `<ValidationError>` + a `useFieldError`-style helper that renders `string \| TranslatableMessage`; every ported input/field routes errors through it (kills the `error?.root?.message` idiom). | 0c high-risk divergence; centralize it. |
| D6 | **Registry pipeline BUILT, live E2E DEFERRED.** Port config→generate→build scripts under the `@chelone` namespace sourcing `packages/react/src/components`; produce `dist/r/*.json`. The `test-registry.sh` E2E (consumer install from a real registry URL + npm packages) is DEFERRED until the user publishes `@chelone/core`+`@chelone/react` to npm — flagged as an external dependency, not a P7 blocker. | 0d: registry copied source needs real published deps; publishing is a user action (npm org grabbed, stub not yet published). |
| D7 | **Website/docs/demo copied as a workspace consumer.** `chelone/apps/website` (new member); landing + docs-engine copy wholesale (brand/install/snippet rewrites); docs content rewritten per-component as views land; demo rewritten onto `@chelone/react` + the new views + `fakeDataProvider`. Extras docs/demo areas DROP. Docs `props/` regenerate via typedoc; images regenerate from the demo. | 0e; the site is the reference app + the docs quickstart home. |
| D8 | **Docs quickstart** ("point at a Zod schema, get 95%"): `defineResources({posts:{schema}})` → `<Admin dataProvider><Resource name="posts" list={PostList} edit={PostEdit}/></Admin>` → typed records + auto-validation (D6 registry-schema default validator) + CRUD. The "95%" auto-scaffold (schema→default List/Edit/Show field inference) is a STRETCH — ship the quickstart on explicit views first; schema-field-inference is a fast-follow if time allows. | Charter §11 #22; the API exists, the auto-scaffold is the aspirational bit. |
| D9 | **Execution is wave-by-wave with checkpoints.** Each wave is its own Workflow (pattern-gate where a new lifecycle is introduced; probes; opus review) and must be green before the next. Orchestrator (main thread) reviews between waves. | P7 is too large for one run; waves keep it tractable + resumable. |

---

## 2. Execution — waves (each a Workflow; SDD implementer + reviewer + fix-loop; TDD; green gate per task; OUTPUT-BREVITY rule in every prompt; commits to main; reports under `.superpowers/sdd/p7/`)

### WAVE P7a — Compatibility layer (@chelone/react GAP hooks + ValidationError + RHF shims)
The prerequisite. Author in `packages/react/src/` (+ core where a vanilla piece belongs):
- `RecordContext` + `RecordContextProvider` + `useRecordContext`; `useFieldValue({source,record?,defaultValue?})`.
- Label/repr helpers: `useGetRecordRepresentation`, `useGetResourceLabel`, `useTranslateLabel`, `useResourceTranslation` (over resource definitions + i18n).
- `<ValidationError error>` component (renders `string | TranslatableMessage` via `useTranslate`) + a shared `useFieldError` normalizer.
- `useList` (client-side list → ListContext, no dataProvider).
- Store: `useStore` alias/shim over `useStoreItem` (signature parity `(key,default)→[value,setter]`).
- Controller-context aliases: `useEditContext`/`useShowContext`/`useCreateContext` + `useSaveContext` (expose the composed controllers' save + state as ra-shaped context hooks); `useListContext` completeness (filter/sort/pagination/selection slices) if any missing.
- Small maps: `useRefresh` (queryClient invalidation), `useLoading` (global fetching indicator via query cache), `useDataProvider` (raw provider access from context), `useLocaleState`→ensure `useLocale`+`useSetLocale` cover it, `useIsMobile` (a small media-query hook), `useSemanticElements` (or decide it's ui-only, port with ui/).
- RHF→chelone form shims: document + provide the mapping so the 27 RHF-direct files port (useWatch→form.store selector, useFormContext→useCheloneFormContext, useFormState→useForm slices, useFieldArray→createArrayBinding/useArrayInput, Controller/useController→useInput, FormProvider→CheloneFormProvider).
- Barrel-export all. Pattern gate (any new context lifecycle — record/list context under churn/StrictMode/discard). Probes (parity of the compat hooks vs ra-core contracts). Opus review.

### WAVE P7b — `ui/` primitives (verbatim) + simple inputs
- Copy `packages/shadmin/src/components/ui/` (58 files, zero core coupling) → `packages/react/src/components/ui/` verbatim; wire the CSS/theme + tailwind source scan. Add shadcn deps (radix, cva, etc.) as react deps.
- Port simple inputs (WAVE A: text, number, boolean, nullable-boolean, date, date-time, time, password, color, resettable-text) onto `useInput` + the compat layer + `<ValidationError>`. Handle the date/time RHF-direct fixups.
- Reviews + a `useInput`-contract probe (error-shape divergence pinned).

### WAVE P7c — choice/reference inputs + fields
- Choice/reference inputs (WAVE B: select(-array), autocomplete(-array), checkbox-group, radio-button-group, reference(-array), array, datagrid-input, rating, currency, duration, phone, search, file, image + niche) onto `useChoicesContext`/`useChoices`/`useReferenceInput` + array-binding.
- Fields (WAVE C, 31: display mirror via `useFieldValue`+`useRecordContext`; reference-* fields reuse the choice/reference data hooks).
- Reviews + probe (choices union + reference lookupKey + array row identity).

### WAVE P7d — list/datagrid + CRUD views + layout + auth
- List/datagrid (WAVE D, 25; `data-table.tsx` is the riskiest single file) onto `useListContext` + selection/sort/pagination + the compat `useList`.
- CRUD views (WAVE E, 11: create/edit/show shells) onto the composed controllers; layout (17: app-bar/sidebar/menu/theme/user-menu) onto `<Admin>`/resource-definitions; auth (9: login/logout/callback) onto the auth hooks.
- Reviews + a shell-integration probe (a real `<Admin><Resource>` renders list→edit→show→create end-to-end against `fakeDataProvider`).

### WAVE P7e — form layouts + buttons + feedback + common
- Form layouts (WAVE F, 10: simple-form, simple-form-configurable, simple-form-iterator, tabbed-form, wizard-form, toolbar) onto the P6 form hooks + FormGroups + the RHF-shim.
- Buttons (26) + feedback (12) + common (8) onto mutation/nav hooks.
- Reviews + probe. This closes the v1 component surface.

### WAVE P7f — Registry pipeline (built; E2E deferred)
- Port `registry.config.mjs` + `generate-registry.mjs` + `granularize-block.mjs` + `build-registry.mjs` + `parse-css-vars.mjs` under `@chelone` namespace, sourcing `packages/react/src/components`. Produce `dist/r/*.json`. Wire the `@chelone/react`→(published-dep) rewrite (parameterized; flip on publish). Guards: dangling-dep validator, basename-collision, granularize self-skip. `test-registry.sh` authored but gated behind a publish flag (DEFERRED live E2E — document the external dep).
- Review + a registry-integrity probe (every emitted item's deps resolve; no dangling `@chelone/<x>`).

### WAVE P7g — Website + docs + demo
- `chelone/apps/website` workspace member; copy landing (brand/install/snippet rewrites) + docs-engine wholesale; the Vite src-alias for `packages/react/src/components` + `unstable_optimizeDeps`.
- Rewrite the demo onto `@chelone/react` + the new views + `fakeDataProvider`; the getting-started + quickstart docs (D8); regenerate typedoc props + demo images; DROP extras docs/demo areas.
- Verify the site builds (SSG) + the demo runs + a docs ComponentPreview renders a real view. Review + opus final.

### P7 FINAL — whole-phase opus review + v1 sign-off
MERGE-READY bar across all of P7; confirm the v1 scope cut is coherent (deferred extras clearly marked), the quickstart works, the registry builds, the site+demo run. Ledger + memory close-out. Flag the external deps (npm publish for registry E2E; domain).

---

## 3. Conventions (carried from P0–P6)
- Ported component code keeps shadmin's structure; repoint imports + apply the error-shape/Admin/Resource fixups; match surrounding idiom.
- Zero `any` in NEW glue (ported shadcn code may carry shadcn's own idioms — do not gratuitously churn it, but no new `any`).
- `@chelone/react` gains component deps (radix/cva/shadcn); core stays vanilla (boundary lint unchanged — components are react-only).
- Notifications/errors are i18n keys / translatable payloads (no `@@react-admin@@` strings).
- `.superpowers/` git-excluded; reports under `.superpowers/sdd/p7/`; research reference files already there.
- Commits straight to main, Conventional Commits, no push. Wave-by-wave; each green before the next.
- **OUTPUT-BREVITY rule in every workflow agent prompt** (short single-line structured fields; detail to report files — the StructuredOutput-cap footgun).
