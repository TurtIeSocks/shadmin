# Chelone `@chelone/vue` V1 — Adapter foundation + vertical CRUD slice · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task (project default — skip the inline-vs-subagent offer). Each task is a workflow-dispatchable unit with a deliverable + green gate; implementers TDD from this plan + the spec + the named **React twin file** as reference oracle (do NOT expect pre-baked implementation code — write it from scratch via TDD, matching the twin's behavior in Vue idioms).

**Goal:** Ship `@chelone/vue` V1 — the adapter foundation (reactivity bridge, vue-router adapter, `<Admin>`/`<Resource>`) plus one full CRUD vertical (List/DataTable, Edit/Create, a few inputs/fields, Save) — a runnable Vue admin doing full CRUD against `fakeDataProvider`, browser-verified. This proves the headless model scales to Vue.

**Architecture:** A new `packages/vue` mirrors `@chelone/react` against the unchanged, proven-headless `@chelone/core`. The adapters differ only in *how they subscribe*: React uses `useSyncExternalStore`; Vue uses a `shallowRef` + `store.subscribe` + `onScopeDispose` bridge over Chelone's own `MicroStore`. Everything subscribed *to* stays in core.

**Tech Stack:** Vue 3 (Composition API, `<script setup>` SFCs) · vue-router · `@tanstack/vue-query` · `@tanstack/vue-store` (forms, or direct form-core bridge) · shadcn-vue / reka-ui (components) · Vitest + `@vue/test-utils` (+ browser provider) · Vite · pnpm workspace + turbo.

**Spec:** `docs/brainstorming/specs/2026-07-06-chelone-vue-adapter-design.md` (read it — decisions D1–D5, sections A–D, risks).

## Global Constraints

- **Repo:** `chelone`, branch `main`, COMMIT directly to main, NEVER push. `.superpowers/` git-excluded.
- **ZERO core changes is the success gate.** If the Vue port forces a `packages/core` edit, that is a leaked React assumption — fix it IN CORE, re-run `@chelone/react` green (`pnpm --dir packages/react test` EXITS 0), and record the change + why. Never mutate core silently to make Vue work.
- **Boundary discipline:** `@chelone/vue` may import `vue`/`vue-router`/`@tanstack/vue-*`/`@chelone/core`; NEVER `react`/`@chelone/react`. Core stays react-free (Biome boundary lint at error).
- **Reference oracle:** every Vue unit has a finished `@chelone/react` twin (`packages/react/src/…`). Match its behavior; translate to Vue idioms. Do not reinvent logic — the logic is in core.
- **i18n/errors:** core emits `TranslatableMessage` / i18n keys; Vue renders them (no `@@react-admin@@` strings, no `error?.root?.message`).
- **Verify each task EXITS 0:** `pnpm --dir packages/vue test` (vitest run + typecheck — check the separate "Errors:" line, not just "Tests passed") + `npx biome check packages/vue` clean. Conventional Commits.
- **Zero `any` in new glue.** `interface` over `type` for object shapes.

---

## File structure (created in V1)

```
packages/vue/
  package.json  tsconfig.json  vite.config.ts  vitest.config.ts  biome/boundary config
  src/
    index.ts                      # barrel
    store/use-store.ts            # MicroStore -> shallowRef bridge (+ selector)
    router/adapter.ts             # RouterAdapter type + provide/inject key
    router/vue-router-adapter.ts  # vue-router impl of the adapter
    router/nav-composables.ts     # useNavigate/useLocation/useParams/useRedirect/useCreatePath
    admin/admin.vue               # <Admin> (registry provide + route build + named slots)
    admin/resource.vue            # <Resource> (self-register via inject)
    admin/resource-registry.ts    # provide/inject key + register/unregister + reactive store
    controllers/use-list-controller.ts
    controllers/use-edit-controller.ts
    controllers/use-create-controller.ts
    form/use-form.ts              # form-core bridge
    form/use-input.ts
    components/ui/*                # shadcn-vue primitives (slice: button,input,table,field,select/combobox,checkbox)
    components/admin/list/{list.vue,data-table.vue}
    components/admin/view/{edit.vue,create.vue}
    components/admin/inputs/{text-input.vue,number-input.vue,boolean-input.vue,reference-input.vue}
    components/admin/fields/{text-field.vue,reference-field.vue}
    components/admin/buttons/{save-button.vue,toolbar.vue}
apps/vue-demo/                    # runnable Vue admin (browser-verify target)
```

---

## Task 1 — Scaffold `packages/vue`

**Files:** Create `packages/vue/{package.json,tsconfig.json,vite.config.ts,vitest.config.ts,src/index.ts}`; a smoke test `packages/vue/src/scaffold.test.ts`. Wire into `pnpm-workspace.yaml` (already globs `packages/*`) + turbo.

**Interfaces — Produces:** the `@chelone/vue` package resolving `@chelone/core` via workspace; a green `pnpm --dir packages/vue test`.

- Deliverable: `package.json` name `@chelone/vue`, `main: ./src/index.ts` (source-only, like react), deps `@chelone/core: workspace:*`, peers `vue ^3`, `vue-router ^4`, `@tanstack/vue-query ^5`; devDeps `vitest`, `@vue/test-utils`, `@vitejs/plugin-vue`, `vue`, `typescript`. Scripts `test: vitest run --typecheck`, `typecheck: vue-tsc --noEmit`.
- Boundary lint: extend the Biome/eslint boundary config so `packages/vue` cannot import `react`/`@chelone/react` (mirror the core rule).
- Smoke test: import a trivial core symbol (e.g. `defineResources`) + assert it exists — proves the workspace link + vitest + typecheck pipeline.
- **Gate:** `pnpm --dir packages/vue test` EXITS 0; biome clean. Commit `chore(vue): scaffold @chelone/vue package`.

## Task 2 — Reactivity bridge (`useStore`) — THE crux

**Files:** Create `packages/vue/src/store/use-store.ts` + `use-store.test.ts`. **Twin:** the React `useSyncExternalStore`/`useSelector` usage in `packages/react/src/controller-hooks.ts` + core `packages/core/src/store/micro-store.ts` (read its `MicroStore<T>` + `onSubscribed` contract).

**Interfaces — Produces:**
- `useStore<T>(store: MicroStore<T>): Readonly<Ref<T>>` — `shallowRef(store.getSnapshot())`, `store.subscribe(() => ref.value = store.getSnapshot())`, `onScopeDispose(unsub)`.
- `useStoreSelector<T, S>(store: MicroStore<T>, selector: (t: T) => S): ComputedRef<S>` — memoized via `computed` over the tracked snapshot ref; only re-emits when the selected slice changes (shallow-equal guard).

- TDD the 4R lifecycle explicitly (this is the thesis): (a) first `subscribe` fires `onSubscribed` (acquire) — assert the acquire callback ran; (b) `onScopeDispose` (simulate via `effectScope().stop()`) runs the release; (c) a store mutation propagates to the ref; (d) selector only fires on selected-slice change. Use `effectScope` in tests to drive scope disposal deterministically.
- **Gate:** bridge tests green (4R acquire+release proven under Vue scope disposal); EXITS 0. Commit `feat(vue): MicroStore reactivity bridge (useStore + selector, 4R via onScopeDispose)`.

## Task 3 — vue-router RouterAdapter + nav composables

**Files:** Create `packages/vue/src/router/{adapter.ts,vue-router-adapter.ts,nav-composables.ts}` + tests. **Twin:** `packages/react/src/router/{adapter.tsx,nav-hooks.tsx}` + core `packages/core/src/router/port.ts` (RouterPort + `matchPath`/`createPath`).

**Interfaces — Produces:**
- `RouterAdapter` interface (mirror the react one's method/composable set) + a `RouterAdapterKey` provide/inject `InjectionKey`.
- `provideVueRouterAdapter()` / a `<RouterProvider>`-equivalent that installs the adapter backed by `useRouter()`/`useRoute()`.
- Composables (consume the injected adapter, throw if absent): `useNavigate()`, `useLocation()`, `useParams()`, `useRedirect()`, `useCreatePath()`. Pure `matchPath`/`createPath` come from `@chelone/core` unchanged.
- A router-optional degrade for standalone composables (mirror React's `useRedirectOptional` — real when adapter present, stable no-op when absent), so forms/controllers work without a mounted router in unit tests.

- TDD: mount a component under a real vue-router + the adapter; assert `useNavigate` pushes, `useLocation` reflects the route, `useCreatePath({resource,type:'edit',id})` builds the right path via core.
- **Gate:** router composables green; EXITS 0. Commit `feat(vue): vue-router RouterAdapter over core RouterPort + nav composables`.

## Task 4 — `<Admin>` / `<Resource>` (self-registration + routes + slots)

**Files:** Create `packages/vue/src/admin/{resource-registry.ts,resource.vue,admin.vue}` + tests. **Twin:** `packages/react/src/admin/*` (the children-composable `<Admin>` + marker-partition) + `packages/react/src/context.tsx`.

**Interfaces — Produces:**
- `resource-registry.ts`: a `ResourceRegistryKey` `InjectionKey`; the registry is a `reactive` map + `register(def)` / `unregister(name)`; `ResourceDefinition` = `{ name, list?, edit?, create?, show?, icon?, recordRepresentation? }` (Component refs).
- `resource.vue`: props `{ name, list?, edit?, create?, show? }`; on `setup`, `inject` the registry, `register(def)`, `onScopeDispose(() => unregister(name))`; renders nothing (a `<template/>` comment / no DOM).
- `admin.vue`: props `{ dataProvider, authProvider?, i18n?, store?, queryClient?, resources? }`; `provide`s the registry + the core `AdminContext` (dataProvider/i18n/etc. — reuse core's context construction, same as react's `<Admin>`); builds vue-router route records reactively from the registry (`watchEffect` → `router.addRoute`/route table) for `/{name}`, `/{name}/create`, `/{name}/:id`, `/{name}/:id/show`; named slots `#layout`, `#login`, `#dashboard` override the defaults; `:resources` prop merges into the registry (escape hatch).

- TDD: mount `<Admin :dataProvider><Resource name="posts" :list/></Admin>`; assert the registry has `posts`, the vue-router table gained the `posts` routes, and the `#layout` slot (when provided) wins. Test unregister on unmount.
- **Gate:** composition + route-build green; EXITS 0. Commit `feat(vue): <Admin>/<Resource> self-registration + reactive route build + page slots`.

## Task 5 — Controller composables (list / edit / create)

**Files:** Create `packages/vue/src/controllers/{use-list-controller.ts,use-edit-controller.ts,use-create-controller.ts}` + tests. **Twin:** `packages/react/src/controller-hooks.ts` + core `packages/core/src/…` controllers (`createListController`/`createEditController`/`createCreateController` — the vanilla ones the react hooks wrap). **Data:** `@tanstack/vue-query` over the same `dataProvider`.

**Interfaces — Produces:**
- `useListController(opts?)` → reactive `{ data, total, isPending, page, perPage, sort, filterValues, setPage, setPerPage, setSort, setFilters, selectedIds, onToggleItem, … }` — wraps the vanilla core list controller via `useStore` (Task 2) + drives fetch through vue-query.
- `useEditController({ resource?, id? })` → `{ record, isPending, save, saving }` (save reconciles via core save-pipeline + form).
- `useCreateController({ resource? })` → `{ save, saving }`.
- Each reads `resource` from the injected resource context (mirror react's `useResourceContext`) when not passed.

- TDD against `fakeDataProvider(seed)` + a `QueryClient`: list loads seeded rows + paginates + sorts; edit loads one record + `save` persists (getOne reflects); create adds a record. Mount under `<Admin>`/`VueQueryPlugin`.
- **Gate:** controllers drive real data via the bridge; EXITS 0. Commit `feat(vue): list/edit/create controller composables over core controllers`.

## Task 6 — Form + input composables

**Files:** Create `packages/vue/src/form/{use-form.ts,use-input.ts}` + tests. **Twin:** `packages/react/src/form-hooks.ts` (P5 form-core bridge via `@tanstack/react-store`) + core save-pipeline. **Bridge:** `@tanstack/vue-store` over `form-core`; if awkward, subscribe to form-core's own store with the Task-2 `useStore` pattern (document which).

**Interfaces — Produces:**
- `useForm({ record, onSubmit, resource })` → `{ form, values, submit, submitting, reset }` — `form-core` instance (revalidateLogic, schema-as-validator from the resource registry — same as core/react), reactive `values` via the bridge, server-error mapping via `form.setErrorMap({onSubmit})`, post-save `form.reset(saved)`.
- `useInput({ source, defaultValue?, validate? })` → `{ value, setValue, error, touched, id, name }` — binds a field to the ambient form (provide/inject the form context, mirror react's `CheloneFormProvider`); `error` is a `string | TranslatableMessage` (rendered via i18n, NOT `error.root.message`).

- TDD: a form over `postSchema` validates on submit (schema errors surface as translatable messages), `useInput('title')` two-way binds, submit calls `onSubmit` with typed values, server error maps to the field.
- **Gate:** form binds + validates off schema + submits; EXITS 0. Commit `feat(vue): form-core bridge (useForm) + useInput`.

## Task 7 — Component slice (shadcn-vue ui + admin SFCs)

**Files:** Create `packages/vue/src/components/ui/*` (shadcn-vue slice: `button, input, table, field, select`/`combobox`, `checkbox`, `card`) + `packages/vue/src/components/admin/{list/list.vue,list/data-table.vue,view/edit.vue,view/create.vue,inputs/{text-input,number-input,boolean-input,reference-input}.vue,fields/{text-field,reference-field}.vue,buttons/{save-button,toolbar}.vue}` + a browser-provider render test. **Twins:** the matching `packages/react/src/components/admin/*` files. **UI source:** copy shadcn-vue primitives (adapt reka-ui prop diffs — see spec Risk 1).

**Interfaces — Produces:** the SFCs, each `<script setup>` wiring to the Task 5/6 composables:
- `List` (uses `useListController`, provides list context) + `DataTable` (+ `DataTable.Col` slot API mirroring react) rendering rows via fields.
- `Edit`/`Create` (use edit/create controller + `useForm`; default children slot for inputs + a toolbar slot).
- Inputs (`useInput` + `ui/field` + `<ValidationError>`-equivalent): text, number, boolean, reference (reference uses `useReferenceInput`/choices — port the choices composable if not already; keep to the ONE reference input needed for the vertical).
- Fields (`useFieldValue` + record context): text, reference (resolves the referenced record's representation).
- `SaveButton` (submits the ambient form, disabled while saving) + `Toolbar`.

- TDD (browser provider): mount a `<DataTable>` over seeded data → a cell shows a seeded value; a `<TextInput source="title">` renders + binds; a `<ReferenceField>` resolves the referenced name; `<SaveButton>` submits.
- **Gate:** components render + wire to composables; browser render test green; EXITS 0. Commit(s) `feat(vue): ui slice + admin component vertical (list/datatable, edit/create, inputs, fields, buttons)`.

## Task 8 — Vue demo app + browser-verified CRUD probe (the milestone gate)

**Files:** Create `apps/vue-demo/{package.json,vite.config.ts,index.html,src/{main.ts,App.vue,resources/posts.vue-def,seed.ts,i18n.ts}}`. Reuse the seed shape from `apps/demo/src/seed.ts`. Add a `.claude/launch.json` config (port 5473 = Vite 5173 +300, avoid collisions) — machine-specific, leave uncommitted.

**Interfaces — Consumes:** everything from Tasks 1–7.

- Deliverable: a Vite Vue SPA — `<Admin :dataProvider="fakeDataProvider(seed)" :i18n :resources or <Resource name="posts" :list :edit :create/>>` with a `posts` resource (Zod `postSchema` mirroring `apps/demo`), a `PostList` (DataTable: title, author via ReferenceField, views, published) + `PostEdit`/`PostCreate` (TextInput/NumberInput/BooleanInput + ReferenceInput author + SaveButton/Toolbar).
- `vite.config.ts`: the `@/`→`packages/vue/src` alias (mirror apps/demo), `dedupe: ['vue']`, `@tanstack/vue-query` optimizeDeps as needed, tailwind `@source` scan of `packages/vue/src`.
- **Browser-verify via Claude Preview (the V1 gate):** boot the demo, navigate Posts list → click a row's Edit → the form renders (Title/Author-reference/Views/Published) → change Title → click Save → **redirect to list + edit persisted + notification**. Zero console errors. This is the Vue analog of P7's full-CRUD capstone.
- **ZERO-CORE-CHANGE check:** `git -C packages/core diff` is empty across V1 (or every core change is listed with its React-assumption justification AND `pnpm --dir packages/react test` still EXITS 0).
- **Gate:** browser-verified full CRUD cycle + core untouched (or justified). Commit `feat(vue): runnable Vue demo — full CRUD vertical browser-verified (V1 milestone)`.

---

## Execution — waves

Run as **subagent-driven workflows** (the P7 rhythm): implementer + reviewer + fix-loop per task; a pattern gate on Task 2 (the 4R bridge — a new lifecycle under Vue scope disposal) and Task 4 (the registry/route-build lifecycle); an adversarial probe on Task 8 (the CRUD cycle); an opus phase review at the end. Group into 3 waves to keep commits serialized on `main`:
- **Wave V1-a:** Tasks 1–4 (scaffold + bridge + router + Admin/Resource). Pattern gate on 2 + 4.
- **Wave V1-b:** Tasks 5–7 (controllers + form + component slice).
- **Wave V1-c:** Task 8 (demo + browser-verify probe) + opus phase review + the zero-core-change audit.

Each wave green before the next. `OUTPUT-BREVITY` rule in every agent prompt (short single-line structured fields; detail → report files under `.superpowers/sdd/vue/`). Every prompt mandates the vue test command EXITS 0 (check the separate "Errors:" line).

## Self-review (spec coverage)

- Spec §A bridge → Task 2 (+ form bridge Task 6). §A topology → Task 1. §A data layer → Task 5 (vue-query). ✓
- Spec §B composition → Task 4; §B router → Task 3. ✓
- Spec §C component port (ui + composables + admin SFCs) → Tasks 5/6/7 (V1 slice); §C V1 phase row → Tasks 1–8. ✓ (V2–V5 are later plans, out of this plan's scope by design.)
- Spec §D testing → each task's tests + Task 8 browser probe; §D zero-core-change gate → Global Constraints + Task 8 audit. ✓
- Spec risks: shadcn-vue prop diffs → Task 7 note; vue-store fit → Task 6 fallback; SFC fidelity → per-task twin + Task 8 probe. ✓
- No placeholders: tasks carry interfaces/signatures + gates; per project convention implementers TDD the bodies from the twin (not pre-baked code) — this is the deliberate altitude, not a gap.
