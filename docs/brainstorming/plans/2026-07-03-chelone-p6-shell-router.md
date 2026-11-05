# Chelone P6 — Shell + Router + Server-entry (+ P5 form leftovers)

**Date:** 2026-07-03 · **Repo:** `chelone` (commits to main; never push) · **Charter:** shadcn-admin-kit `docs/brainstorming/specs/2026-06-23-chelone-charter.md` §5 (Router / Server data-entry rows), §7 P6, §11 (#14 auth edge flows, #19 a11y)

**What P6 delivers (headless logic + the react shell wiring; shadcn UI ports stay P7):**
- The **router abstraction** Chelone owns and never depends on directly (react-router = default adapter, TanStack Router = reference slot).
- The **children-composable `<Admin>` façade** — kills the slot-passing that started this whole redesign (the user's original gripe).
- Resource registry + routing engine + **no-flash auth gate** + error boundary + scroll.
- The **SSR/server-entry seam** (dehydrate/hydrate; NO server functions — that's post-v1 `@chelone/start`).
- The **P5 form leftovers** now unblocked by the router: FilterLiveForm, warn-when-unsaved-changes, FormGroups primitive, WizardForm, TabbedForm.

---

## 0. Research ground truth (2026-07-03; ra-core shell + TanStack router-core@1.150 / query@5.90 probed from installed source + docs)

Trust these over training data. Implementers: re-verify only if installed versions differ.

### 0a. ra-core shell/router facts (parity-of-behavior targets — clean-room, never copy code)

1. **Three-layer split.** `CoreAdmin` = pure delegation → `CoreAdminContext` (all providers) + `CoreAdminUI` (top-level `<Routes>` + error boundary + login/auth-callback routes) wrapping `{children}`.
2. **Provider nesting order is load-bearing** (outermost→innermost): RouterProviderContext → Auth → Data → Store → Preferences → QueryClient → AdminRouter(basename) → I18n → Notification → UndoableMutations → ResourceDefinition(registry, innermost, wraps children). RouterProviderContext is OUTERMOST so every hook can read the injected router; `AdminRouter` creates/joins the actual router below query/store/auth but above i18n/notification/registry.
3. **The router is INJECTED, never imported.** `RouterProviderContext = createContext<RouterProvider>(reactRouterProvider)`. Every ra-core routing hook/component is a thin pass-through to `useRouterProvider().X`. react-router is a hard dep of the *default adapter* only. **Chelone owns the interface and supplies its own adapters; core never imports react-router.**
4. **The exact `RouterProvider` contract** (the complete surface — implementing these IS the whole contract): **7 hooks** `useLocation` (`{pathname,search,hash,state?,key?}`), `useNavigate` (`(to: string|Partial<Location>|number, opts?:{replace?,state?}) => void`, ref-STABLE so nav doesn't re-render), `useParams` (incl. `'*'` splat key), `useBlocker(shouldBlock: fn|boolean): {state:'blocked'|'unblocked'|'proceeding', proceed(), reset(), location}`, `useMatch({path,end?})`, `useInRouterContext()`, `useCanBlock()`; **5 components** `Link` (forwardRef), `Navigate`, `Route`, `Routes` (accepts `location?`), `Outlet`; **`matchPath(pattern, pathname) → {params,pathname,pathnameBase}|null`**; **`RouterWrapper({basename,children})`** — checks `useInRouterContext()`, renders children directly if already in a router, else creates one (default adapter uses a real path history, NOT HashRouter).
5. **Nested `<Routes>` + splat routing** is mandatory: `/*` at CoreAdminUI → `<name>/*` per resource → resource inner `create/*`, `:id/show/*`, `:id/*`, `/*`. Nested Routes match RELATIVE to parent; `params['*']` exposes the unmatched remainder (`useSplatPathBase` strips it).
6. **Resource sub-route order is deliberate:** create → show (`:id/show`) → edit (`:id`) → list (`/*`) — show before edit so `:id/show` isn't swallowed by the `:id/*` edit splat.
7. **CoreAdminRoutes branch order = the no-flash gate.** `useAuthState(undefined, false, {enabled: requireAuth})`: (1) `status==='empty'` → `<Ready>`; (2) `loading || (requireAuth && pendingAuth)` → no-layout customs + `<LoadingPage>` ONLY; (3) `requireAuth && !authed` → no-layout customs + `<LogoutOnMount>`; (4) else → `<HasDashboard><Layout><Routes>{layoutCustoms}{resources}{index}{errorRoutes}{catchAll}</Routes></Layout></HasDashboard>`. **Protected content NEVER mounts during the pending-auth window** — that's the no-flash guarantee (not render-then-hide).
8. **Resource registry is lazy:** register-on-mount / unregister-on-unmount via `Resource.registerResource(props, permissions)`, `isEqual`-guarded against needless re-renders, re-runs on permissions change. `ResourceDefinition = {name, hasList:!!list, hasCreate:!!create||!!hasCreate, hasEdit, hasShow, icon, recordRepresentation, options}`.
9. **Children partition by a static `raName` marker.** `useConfigureAdminRouterFromChildren` walks children (`Children.forEach`), recurses Fragments, ignores non-elements, buckets by `element.type.raName` into `resources / customRoutesWithLayout / customRoutesWithoutLayout`, and handles a single async function-child with a loading→ready status machine. **This is the exact mechanism the new children-composable `<Admin>` reuses for page slots.**
10. **CustomRoutes:** `noLayout` customs render in ALL branches (standalone, auth-agnostic); with-layout customs render inside `<Layout>` before resources (can override resource paths by order).
11. **Nav hooks:** `useCreatePath({type,resource?,id?})` (basename-prefixed; `list`→`/res`, `create`→`/res/create`, `edit`→`/res/:id`, `show`→`/res/:id/show`; id==null→list fallback; `encodeURIComponent(id)`; custom string type returned verbatim; `removeDoubleSlashes`). `useRedirect(to, resource?, id?, data?, state?)`: `false`→no-op, function, absolute-http→`window.location.href`, CreatePathType→navigate; adds `_scrollToTop` state EXCEPT for `'list'` (list restores its own scroll).
12. **basename** via `BasenameContext` (default `''`); AdminRouter sets it to the app basename only when inside a host router, `''` when it creates its own router (the router applies basename itself).
13. **Error boundary** at shell level (above Layout), react-error-boundary, **auto-resets on `location.pathname` change**, captures `errorInfo`/componentStack; default overridable via the `error` slot.
14. **Scroll:** `useScrollToTop` on `_scrollToTop` state; per-list `RestoreScrollPosition` tracks/restores `window.scrollY` via the Store (debounce 250), skipped when `_scrollToTop===true`.
15. **SSR-safe:** no internal nav reads `window.location`; `window` only for absolute-URL redirect / scrollTo / telemetry, all guarded. **Drop the react-admin telemetry pixel entirely.**
16. **No-authProvider shortcut:** `useAuthState` with `authProvider==null` returns frozen `{authenticated:true, isPending:false}` — appless demos never gate.

### 0b. TanStack + SSR facts (router-core@1.150.0, history@1.145.7, query@5.90.20)

1. **TanStack Router is split:** `@tanstack/router-core` (framework-agnostic, ~99% of logic) + `@tanstack/react-router` (hooks/components). The core instance (`createRouter({routeTree,history,basepath,context,dehydrate,hydrate,Wrap})`) exposes `navigate(NavigateOptions)`, `buildLocation(opts)→ParsedLocation` (pure path build), `commitLocation`, `latestLocation`, `state.matches[].params`, `subscribe(evt, fn)`, `basepath`, `resolvePathWithBase`, `matchRoutes`. History (`@tanstack/history`) owns `block(blocker)→unsub` (the imperative block primitive).
2. **The imperative seam that's BOTH-router-satisfiable** (Chelone's vanilla `RouterPort`): `navigate(to,opts)`, `back/forward`, `getLocation()`, `subscribe(listener)`, `getParams()`, `createHref(to)`. The ONE awkward method is **`block`** — react-router's blocker is a REACT HOOK (`useBlocker`, data-router v6.7+), NOT imperative; TanStack has both. So the blocker lives in the **react adapter** for the react-router path, not pure-vanilla core.
3. **The single decision that makes ONE interface cover both routers:** keep `to` a STRING and own search-param serialization in Chelone (Zod registry) — never surface TanStack's typed-search / typed-params generics. Then react-router's stringly `URLSearchParams` and TanStack's typed search both reduce to "Chelone hands the router a string."
4. **Leaks to paper over** (all 1–5 line adapter concerns): `resetScroll:true` (TanStack) == `preventScrollReset:false` (react-router, inverted); blocker `'idle'|'blocked'` vs react-router's `'unblocked'|'blocked'|'proceeding'` triple; `location.key` native in react-router, synthesized for TanStack; `createHref` descriptor shape.
5. **SSR dehydrate/hydrate** (query v5, exact names): `dehydrate(client, opts?)→DehydratedState`, `hydrate(client, state, opts?)`, `<HydrationBoundary state={...}>` (React), `queryClient.ensureQueryData(opts)` (blocking loader, returns data) / `queryClient.prefetchQuery(opts)` (streaming, fire-and-forget). **Chelone's option factories (`getListOptions` etc., P2) already ARE the loader seam** — a loader calls `ensureQueryData(getListOptions(...))`, the component calls `useQuery(getListOptions(...))` → cache hit. Create a FRESH QueryClient per request (never module-global).
6. **createServerFn** (`@tanstack/react-start`): `.inputValidator(zodSchema).handler(async ({data,context,signal})=>T)`, called `fn({data})`. **DO NOT build server fns in P6** — v1 is react-first CSR. P6's only server obligation = 3 shape constraints so `@chelone/start` (post-v1) can layer on without restructuring: (a) DataProvider methods stay plain `(resource,params)→Promise` with serializable params/results, (b) option factories exposed (done), (c) router + queryClient are FACTORY-created + provider-mounted at root (not window-singletons).

### 0c. Form-leftovers facts

1. **FilterLiveForm** = a form auto-submitting into a list's `setFilters`. Chelone already has both halves: P4 list-controller's `setFilters(filter, displayed?, debounced?)` ALREADY owns the debounce (500ms) + removeEmpty + page-reset; P5 form-controller + `useInput` + SourceContext give the form. Pure composition — delegate debounce to the list-controller (cleaner than ra, which re-implements it in the form).
2. **warnWhenUnsavedChanges** is HARD-BLOCKED on the router (needs `useBlocker`) — the canonical reason P5 deferred it. Dirty signal ALREADY exposed by P5: `!isDefaultValue` (NOT the sticky `isDirty`). Ship the `beforeunload` half unconditionally (pure DOM).
3. **form-core 1.33 group APIs are NOT validity aggregators.** `FieldGroupApi` state is `{values}` only (no isValid/errors) — it's for reusable field-bundles (P7 concern). `FormGroupApi` is a nested-field validator. **BUILD groups (thin): a `FormGroups` registry (string membership) + a `useFormGroup(name)` reducer over `form.store.state.fieldMeta` → `{isValid,isDirty,isTouched,errors}`** (~30–50 lines). Do NOT adopt FieldGroupApi for badges.
4. **WizardForm** has NO router coupling (step index = local state; validate-before-advance = `form.validateField` per group member). **TabbedForm** with `syncWithLocation=true` (ra default) makes each tab a nested route (deep-linkable) — needs the P6 router's Routes/Route/useLocation/useMatchPath/splat; `syncWithLocation=false` degrades to `useState`.

---

## 1. Design decisions (assumptions — the user's review checkpoint)

| # | Decision | Why |
|---|----------|-----|
| D1 | **Router = two layers.** **Core (`@chelone/core/router`, vanilla, SSR-safe, no React/window-at-import):** `CheloneLocation` type, `RouterPort` imperative seam (`navigate/back/forward/getLocation/subscribe/getParams/createHref`, `block?` optional), pure path utils (`createPath`, basename join, `removeDoubleSlashes`, `matchPath` string matcher). **React (`@chelone/react`):** `RouterAdapter` interface = ra-core's proven contract (7 hooks + 5 components + `matchPath` + `RouterWrapper`), injected via `RouterAdapterContext`. Ship `reactRouterAdapter` (DEFAULT) + `tanstackRouterAdapter` (reference slot). | Charter: interface never owned; react-router default + TanStack slot. The declarative component surface is what the shell parity needs; the imperative RouterPort is the vanilla/SSR/loader seam. Reimplementing route matching ourselves would be MORE risk, not less. |
| D2 | **`<Admin>` children-composable façade.** Provider config = props (`dataProvider`, `queryClient`, `authProvider`, `store`, `i18n`, `notifications`, `resources`, `basename`, `requireAuth`, `router`). **Page slots = marker-tagged children** (`<Admin.Title/Layout/LoginPage/Dashboard/CatchAll/Error/Ready/AuthCallback/Loading/AccessDenied/AuthenticationError>`), hoisted internally via the `raName`/`chelName`-marker partition (reuse ra-core's exact mechanism). Page-slot PROPS still accepted (escape hatch; prop wins over child). Keep the low-level `<AdminContext>` + `<AdminUI>` split (documented escape hatch). | THE user's original gripe. Kills the hand-maintained 20-prop forwarding manifest; unifies the two idioms (`<Resource>`/`<CustomRoutes>` are already children). Additive convenience over byte-identical underlying wiring. |
| D3 | **Resource registry.** Vanilla registry in core (keyed map + register/unregister/subscribe + `isEqual`-guard — reuse the MicroStore/store patterns). React `<Resource name list edit create show icon options>` + lazy register-on-mount/unregister-on-unmount + `ResourceContext` + `useResourceDefinition(s)`. Sub-route order create→show→edit→list. | Parity §0a-8; registry data is vanilla-able (it's a keyed store), React owns the lifecycle. |
| D4 | **No-flash auth gate** reuses P3 `useAuthState` (`enabled: requireAuth` + no-authProvider shortcut); branch order renders loading BEFORE mounting the layout tree. `Authenticated`/`useAuthenticated` (logoutOnFailure defaults true) for per-page gates. `useHandleAuthCallback` for OAuth. Confirm/blocking UI is shadcn-native later (P7) but the LOGIC hooks are headless here. | Parity §0a-7/16; §11 #14. |
| D5 | **SSR seam, NOT server functions.** P6 obligation = 3 shape constraints (serializable DP params/results ✓, option factories ✓ P2, factory-created router+queryClient at root). Add: re-export/thin-wrap `dehydrate`/`hydrate`/`HydrationBoundary`, a `createCheloneRouter()`-style factory, and a documented loader→`ensureQueryData`→`useQuery` story. Zero server-fn code. | §0b-6; don't front-load churn against still-moving Start APIs. `@chelone/start` is post-v1. |
| D6 | **Form leftovers, all into P6:** (a) **FilterLiveForm** — compose list-controller `setFilters(...,debounced)` + form-controller (delegate debounce to the controller). (b) **warnWhenUnsavedChanges** — `useBlocker` (react adapter) + unconditional `beforeunload`; dirty = `!isDefaultValue`. (c) **FormGroups** — BUILD (core registry + react `useFormGroup` reducer over `form.store.fieldMeta`); do NOT adopt form-core FieldGroupApi. (d) **WizardForm** — local step state + validate-before-advance. (e) **TabbedForm** — `syncWithLocation` split; URL-sync via the P6 router, `false`-variant `useState`. | §0c; recommendation folded these into P6 since the router now exists. |
| D7 | **Drop telemetry entirely.** No `disableTelemetry` prop (dead in shadmin anyway). | §0a-15; §16 no telemetry. |
| D8 | **Boundary.** router-core stays vanilla (extend Biome boundary lint to ban `react`, `react-dom`, `react-router`, `@tanstack/react-router` in `packages/core/**`). react-router + @tanstack/react-router are peer+dev deps of `@chelone/react` ONLY. `block()` lives in the react adapter (react-router's blocker is hook-only). | Charter core-is-vanilla rule; §0b-2. |
| D9 | **`<Resource>` extension seam.** Support a `group?: string`-style options passthrough (shadmin's menu grouping depends on it) via `options` rather than a bespoke prop — keep the core Resource minimal, let the shadcn menu (P7) read `definition.options.group`. | Preserve shadmin behavior without coupling core to menu concerns. |

---

## 2. Execution — TWO workflow waves (checkpoint after the shell)

Wave 1 = **Shell + Router** (the high-value deliverable, the user's gripe) with its own pattern gate + probes + interim opus review. Wave 2 = **Form leftovers + SSR seam** + final opus review. Orchestrator (main thread) reviews Wave 1 receipts before launching Wave 2.

Per-task rules (both waves): SDD implementer + combined spec/quality reviewer + fix loop (cap 2); TDD RED→GREEN; `*.test-d.ts` for type tests; `NODE_OPTIONS=--no-experimental-webstorage` already in core test script; both suites + typechecks + `biome check` green per task; zero `any`; interfaces over type-aliases for object shapes; notifications are i18n keys; Conventional Commits straight to main; reconcile `pnpm-lock.yaml` in the same commit when deps change; briefs/reports under `.superpowers/sdd/p6/` (git-excluded). If the plan conflicts with empirical behavior, TRUST empirical, adapt, flag loudly.

### WAVE 1 — Shell + Router

**W1-T1 — core: router primitives (vanilla)** `packages/core/src/router/{location,port,paths,match}.ts`
- `CheloneLocation` (`{pathname, search, searchParams: URLSearchParams, hash, state: unknown, key?}`), `NavigateOpts` (`{replace?, state?, resetScroll?}`), `RouterPort` imperative interface (`navigate(to, opts?)`, `back()`, `forward()`, `getLocation()`, `subscribe(listener)→Unsubscribe`, `getParams()`, `createHref(to)`; `block?` optional).
- Pure path utils: `createPath({type, resource?, id?}, basename?)` (parity §0a-11: list/create/edit/show, id==null→list, `encodeURIComponent`, custom-string verbatim, `removeDoubleSlashes`), `joinBasename`, and a dependency-free `matchPath(pattern, pathname)→{params, pathname, pathnameBase}|null` (splat `*` + `:param` support — the string matcher the resource routing needs; DO NOT pull in a router lib).
- Extend `biome.json` boundary rule: ban `react`, `react-dom`, `react-router`, `@tanstack/react-router` in `packages/core/**`.
- SSR-safe: no `window` at import; `matchPath`/`createPath` pure. Tests: createPath matrix (all types, id encoding, basename, double-slash, custom verbatim), matchPath (static, `:param`, splat remainder, `pathnameBase`, no-match), RouterPort is type-only (no runtime).

**W1-T2 — core: resource registry (vanilla)** `packages/core/src/resource/registry-store.ts` (NOTE: distinct from the P1 `defineResources` type registry — this is the runtime component registry)
- `ResourceDefinition` (`{name, hasList, hasCreate, hasEdit, hasShow, icon?, recordRepresentation?, options?}`), `createResourceRegistry()` → `{register(def), unregister(name), get(name), getAll(), subscribe(listener)}`, `isEqual`-guarded register (no-op if unchanged — avoid needless notify). Reuse the store/MicroStore notification pattern; SSR-safe.
- `computeDefinition(props)` helper (hasList=!!list etc.). Tests: register/unregister/subscribe, isEqual no-op, computeDefinition matrix, snapshot stability.

**W1-T3 — react: RouterAdapter interface + react-router default adapter + nav hooks** `packages/react/src/router/{adapter,react-router-adapter,context,nav-hooks}.tsx`
- Add `react-router` (`^7` — verify installed major) as peer+dev of `@chelone/react`; reconcile lockfile.
- `RouterAdapter` interface (the §0a-4 contract: 7 hooks + 5 components + `matchPath` + `RouterWrapper`). `RouterAdapterContext` + `useRouterAdapter()`; default = `reactRouterAdapter`.
- `reactRouterAdapter`: implement every member over react-router v7 (useLocation/useNavigate→ref-stable/useParams/useBlocker→normalize the state triple/useMatch/useInRouterContext/useMatch-based/Link forwardRef/Navigate/Route/Routes/Outlet/matchPath/RouterWrapper creating a real-path `createBrowserRouter`-or-`<BrowserRouter>` when not already in a router).
- Nav hooks bridged onto the adapter: `useNavigate`, `useLocation`, `useParams`, `useRedirect` (§0a-11 forms incl. `_scrollToTop`-except-list, absolute-http, function, false), `useCreatePath`, `useBasename` (`BasenameContext`, default `''`), `useGetPathForRecord` (link inference via resource-definition + canAccess), `useBlocker`, `useCanBlock`.
- Tests: adapter contract (each hook/component), useRedirect matrix, useCreatePath matrix, basename application, ref-stable navigate (no re-render on nav), useBlocker state normalization, RouterWrapper join-vs-create.

**W1-T4 — react: TanStack Router reference adapter** `packages/react/src/router/tanstack-router-adapter.tsx`
- Add `@tanstack/react-router` as an OPTIONAL peer + dev of `@chelone/react`; reconcile lockfile.
- `tanstackRouterAdapter` implementing the SAME `RouterAdapter` contract over TanStack Router (reference/proof-of-portability, NOT a co-equal maintained adapter — §0b-6 "reference slot"). Where a member is awkward (typed search), satisfy via string `to` + Chelone-owned serialization (§0b-3). Document the 4 leaks (§0b-4).
- Tests: a focused parity smoke — the adapter satisfies the interface and drives a minimal `<Admin>`-shaped route tree (navigate, params, location, Link) — proving the seam. Not full parity with react-router.

**W1-T5 — react: `<Resource>` + registry React layer** `packages/react/src/resource/{resource,resource-context,registry-hooks}.tsx`
- `<Resource>` (marker `chelName='Resource'`; props name/list/create/edit/show/icon/recordRepresentation/options/children): dual-purpose (config marker + when routed, mounts inner `<Routes>` in create→show→edit→list order via the adapter, wrapped in `ResourceContextProvider`).
- `ResourceRegistryProvider` (holds a `createResourceRegistry`), `useRegisterResources(children, permissions)` (lazy register-on-mount / unregister-on-unmount, isEqual-guard), `ResourceContext` + `useResourceContext`, `useResourceDefinitions`/`useResourceDefinition` (prop-override merge).
- Tests: registration lifecycle (mount registers, unmount unregisters, permissions re-run), sub-route order (show not swallowed by edit splat), ResourceContext prop-override, definitions map.

**W1-T6 — react: children-partition + `<Admin>` façade** `packages/react/src/admin/{partition,admin,admin-context,admin-ui,slots}.tsx`
- `partitionChildren(children)` — walk (recurse Fragments, ignore non-elements), bucket by `chelName` marker into `{resources, customRoutesWithLayout, customRoutesWithoutLayout, slots: {title, layout, loginPage, dashboard, catchAll, error, ready, authCallback, loading, accessDenied, authenticationError}}`; single async function-child loading→ready status machine.
- Slot markers: `Admin.Title`, `Admin.Layout`, `Admin.LoginPage`, `Admin.Dashboard`, `Admin.CatchAll`, `Admin.Error`, `Admin.Ready`, `Admin.AuthCallback`, `Admin.Loading`, `Admin.AccessDenied`, `Admin.AuthenticationError`, plus `<CustomRoutes noLayout?>` (marker `chelName='CustomRoutes'`).
- `<Admin>` = provider config props + partitioned children; page-slot props override matching child. Provider stack in the §0a-2 order: RouterAdapterContext → CheloneProvider(the existing P2-P5 provider: data/query/store/i18n/auth/notifications/resources) → ResourceRegistryProvider → RouterWrapper(basename) → shell. Low-level `<AdminContext>` + `<AdminUI>` split preserved as the escape hatch. No telemetry.
- Tests: partition (markers bucketed, Fragments recursed, non-elements ignored, prop-overrides-child, async function-child), provider order, escape-hatch split renders, page slots reach the shell.

**W1-T7 — react: routing engine + auth gate + error boundary + scroll** `packages/react/src/admin/{admin-routes,auth-gate,error-boundary,scroll}.tsx`
- `AdminRoutes` reproducing the §0a-7 branch order EXACTLY (empty→Ready; loading/pendingAuth→loading-only + no-layout customs; requireAuth&&!authed→logout + no-layout customs; else→Layout tree with layout customs → resources → index (dashboard or NavigateToFirstResource) → error routes → catch-all). No-flash gate via `useAuthState({enabled: requireAuth})` + no-authProvider shortcut (P3).
- `NavigateToFirstResource` (first hasList resource with list access via canAccess), `Authenticated`/`useAuthenticated` (logoutOnFailure default true), `useHandleAuthCallback` (OAuth redirect resolution), `LogoutOnMount`.
- Shell error boundary (above Layout) with location-change auto-reset + errorInfo capture; default `error` slot overridable. `useScrollToTop` (`_scrollToTop` state) + `RestoreScrollPosition` (per-list, Store-backed, debounce 250, skip when `_scrollToTop`).
- Tests: branch-order matrix (empty/loading/unauth/normal), no-flash (protected content NOT in tree during pendingAuth — assert absence, not hidden), initial-resource redirect + access filtering, custom-routes-in-all-branches, error boundary location-reset, scroll behavior.

**W1-T8 — PATTERN GATE (halt semantics — P4/P5 protocol)**
Adversarial probe of the shell + router + registration lifecycle BEFORE Wave 2 builds on it. Attack: (a) resource register/unregister churn (mount/unmount/remount, permissions flip) → no leaked definitions, no zombie subscriptions, isEqual-guard holds; (b) router-adapter swap (react-router ↔ tanstack) under a live `<Admin>` → no stale context, hooks resolve; (c) Suspense-discard / StrictMode / `<Activity>` around `<Admin>` and `<Resource>` → no double-registration, no zombie routes, auth-gate query not double-fired; (d) no-flash gate: assert protected content genuinely never mounts during pendingAuth (spy resource render); (e) SSR: `<Admin>` importable + shallow-renderable in pure node (no window-at-import) via the RouterWrapper join path. PASS → commit attack suite + continue; FAIL → halt, redesign addendum, second sitting.

**W1 Probes (parallel, after gate)** — 1) **shell-lifecycle** (registration/router-swap/StrictMode/Activity churn, mutation-verified non-vacuity); 2) **shell-parity** (black-box against the §0a parity checklist — branch order, sub-route order, redirect forms, createPath, no-flash, custom-routes-split, basename; report per-item PASS/GAP/DEFER); 3) **router-portability** (both adapters drive the same minimal admin: navigate/params/location/Link/blocker equivalent; the leaks are documented + bounded); 4) **ssr/factory-gate** (router+queryClient factory-created, no window-at-import in core router, `<Admin>` node-importable, boundary lint bans router libs in core, deps classified: react-router peer+dev of react only).

**W1 interim review (opus):** shell MERGE-READY bar (0 critical/important). Then orchestrator checkpoint before Wave 2.

### WAVE 2 — Form leftovers + SSR seam (launched after Wave 1 review)

**W2-T1 — core+react: FormGroups primitive** `packages/core/src/form/form-groups.ts` + `packages/react/src/form/group-hooks.tsx`
- Core: `createFormGroups()` registry (`register(group, source)`, `unregister`, `getMembers(group)`, subscribe) — string membership, framework-agnostic. `reduceGroupState(fieldMeta, members) → {isValid, isDirty, isTouched, isValidating, errors}` pure reducer.
- React: `FormGroupsProvider`, `useFormGroup(name)` (subscribe `form.store.state.fieldMeta` for members via `useSelector` + reduce), input auto-registration into the ambient group. Do NOT adopt form-core FieldGroupApi.
- Tests: registry, reducer matrix (valid/invalid/dirty/touched aggregation), membership changes notify, useFormGroup selector isolation.

**W2-T2 — react: FilterLiveForm** `packages/react/src/form/filter-live-form.tsx`
- `useFilterForm({resource?, debounce?})` / `<FilterLiveForm>`: read `{filter, setFilters}` from list context; standalone form-controller seeded `defaultValues=filter`, `resetOnSuccess:false`; on value change → `setFilters(merged, undefined, /*debounced*/true)` (delegate debounce to the list-controller); mirror external `filter` back with a `hasJustBeenModifiedByUser` guard; filter-flavored SourceContext. No save pipeline/notifications; validity gate `if (!canSubmit) return`.
- Tests: types into filter form → setFilters called debounced; external filter change reflects back without clobbering active typing; validity gating; getFilterFormValues all-keys-present.

**W2-T3 — react: warnWhenUnsavedChanges** `packages/react/src/form/warn-unsaved-changes.tsx`
- `useWarnWhenUnsavedChanges(enable, formRootPathname?)`: dirty = `!isDefaultValue` (form-context slice, NOT sticky isDirty); `shouldBlock = enable && dirty && !justSubmitted`; call the W1 `useBlocker` with the inside-form predicate (`nextLocation.pathname.startsWith(formRootPathname)` && not `/show`); on blocked → drive a headless confirm decision (proceed/reset); ship `beforeunload` unconditionally (pure DOM). Confirm UI shadcn-native in P7; logic headless here.
- Tests: blocks on dirty nav, allows inside-form nav, allows after successful submit, beforeunload registration, isDefaultValue (not isDirty) drives it, useCanBlock guard.

**W2-T4 — react: WizardForm** `packages/react/src/form/wizard-form.tsx`
- `<WizardForm>` + `useWizardForm`: form-controller + `useState` step index + steps children array; `next()` runs `Promise.all(members.map(s => form.validateField(s,'submit')))`, advances only if all pass; `{currentStep, hasNext, hasPrev, goToStep, next, prev}`. Renders active step (CSS-hide others to preserve mount + cross-step validation + single submit). Uses FormGroups (W2-T1) for per-step membership/validity. No router.
- Tests: step nav, validate-before-advance (invalid step blocks next), all-steps-mounted (cross-step values survive), single submit collects all.

**W2-T5 — react: TabbedForm** `packages/react/src/form/tabbed-form.tsx`
- `<TabbedForm syncWithLocation?>`: default `syncWithLocation=true` → each tab a nested route via the W1 router (Routes/Route/useLocation/useMatchPath/splat-base), deep-linkable; `false` → `useState`. All tabs' inputs mounted (cross-tab validation + single submit); tab headers subscribe `useFormGroup(tabName)` for the validity dot. Uses FormGroups (W2-T1).
- Tests: URL-synced tab nav (location drives active tab, back-button), useState variant, per-tab validity badge, all-tabs-mounted, single submit.

**W2-T6 — react+core: SSR/server-entry seam** `packages/react/src/ssr/{hydration,router-factory}.tsx` (+ core option-factory audit)
- Re-export/thin-wrap `dehydrate`/`hydrate`/`HydrationBoundary` from `@tanstack/react-query`; a `createCheloneRouter(...)`-style factory (router created outside the tree, per-request-capable) + confirm QueryClient is app-provided (factory-capable); a documented `loader → ensureQueryData(getListOptions(...)) → useQuery` example (test, not prose only). Audit: DataProvider params/results serializable; no module-global router/queryClient in the shell. NO server-fn code.
- Tests: dehydrate a client after a getList, hydrate into a fresh client, component reads cache without refetch (option-factory cache-hit); `<Admin>` accepts a factory-created router + external queryClient; node-importable.

**W2 Probes (parallel)** — 1) **form-leftovers-lifecycle** (FormGroups registration churn, FilterLiveForm debounce-race, WizardForm/TabbedForm mount preservation, unsaved-changes blocker churn); 2) **form-leftovers-parity** (black-box §0c behaviors); 3) **ssr-seam** (dehydrate/hydrate round-trip, factory-createability, no window-at-import). 

**W2 barrels + ledger** — export every new public symbol + `UseXResult`/type from both barrels (P2/P4/P5 lesson); full uncached gate; P6 ledger entry.

**FINAL opus review** — MERGE-READY bar across all of P6 (shell + router + form leftovers + SSR seam). §11 #14 auth edge flows closed; the user's slot-passing gripe resolved (children-composable façade); router never owned; 4R/registration lifecycle discipline; type surface any-free; both adapters satisfy the interface; SSR seam preserved without over-building.

---

## 3. Conventions (carried from P0–P5)
- Zero `any` (core + react); `unknown`/generics; interfaces over type-aliases for object shapes.
- No React/router-lib imports in core (Biome boundary rule extended in W1-T1).
- Notifications are i18n keys (translate-fallback pattern); new keys (`chelone.message.unsaved_changes`, auth/nav keys) added to the default catalog.
- Vitest: core jsdom-lean; react via @testing-library/react; type tests in `*.test-d.ts`.
- `.superpowers/` git-excluded (now in committed `.gitignore` too); briefs/reports under `.superpowers/sdd/p6/`.
- Commits straight to main, Conventional Commits, no push.
