# Chelone P5 — Forms (TanStack form-core integration)

**Date:** 2026-07-02 · **Repo:** `chelone` (commits to main) · **Charter:** shadcn-admin-kit `docs/brainstorming/specs/2026-06-23-chelone-charter.md` §5.3/§7/§11

**Charter commitments this phase closes:**
- §7 P5: `@tanstack/form-core` + rebridge the input/form-layout LOGIC (headless — shadcn UI ports are P7).
- §11 #4/#13: server-validation `ValidationError.fieldErrors` → form state; post-save form↔cache reconciliation; large-form perf budget with field-level subscription isolation, acceptance-tested.
- §11 #20: scalar-array field mode + row `index`/`name` exposure.
- §11 #16: choices/reference-input controller resolving selected records via `getList` filter when the lookup key isn't `id`.

---

## 0. Research ground truth (2026-07-02, form-core 1.33.0 probed from installed source + node scripts)

Implementers: these facts were empirically verified; trust them over training data. Re-verify only if the installed version differs.

1. **`new FormApi(opts)` is INERT** — creates stores + binds methods, no timers/subscriptions/globals/validation. Safe in a discarded React render (react-form itself constructs in a `useState` initializer). `form.mount(): () => void` is the acquisition (devtools listeners + `onMount` validator); cleanup unmounts. `new FieldApi({form, name, ...})` also inert; `field.mount()` seeds field defaultValue, registers instance in `form.getFieldInfo(name).instance` (REQUIRED — `handleSubmit`/`validateAllFields` only validate registered instances), runs field onMount. Field unmount cleanup clears debounce timers + aborts in-flight async-validation AbortControllers, resets field errorMap but PRESERVES isTouched/isBlurred/isDirty. Double mount/unmount (StrictMode) safe.
2. **Stores are @tanstack/store 0.11** (alien-signals rewrite): `store.subscribe(fn)` returns `{unsubscribe()}` (an OBJECT, not a function — adapt for uSES); `store.state`/`store.get()` read without subscribing; no `Derived.mount()` needed anymore. `field.store` is derived from `form.store` **with identity memoization** — probed: `setFieldValue('a')` fires field-a subscribers 1×, field-b 0×, field-b state keeps referential identity. Per-field render isolation falls out of subscribing to `field.store`.
3. **React bridge without @tanstack/react-form is fully supported**: `useForm` CANNOT accept an existing FormApi (always constructs its own) — so we bridge ourselves with `@tanstack/react-store` (`useStore(store, selector)` = `useSyncExternalStoreWithSelector` over `.subscribe`/`.get`; works with any Store/ReadonlyStore). react-form's useField does: FieldApi in useState (recreate on form/name change), SEVEN `useStore(field.store, selector)` slices (value — or `meta._arrayVersion` in array mode — isTouched, isBlurred, isDirty, errorMap, errorSourceMap, isValidating), `useIsomorphicLayoutEffect(field.mount, [field])`, `field.update(opts)` every render. Mirror that shape.
4. **Server errors — use the `onSubmit` errorMap key, NEVER `onServer` for fields.** `form.setErrorMap({onSubmit: {form: <global>, fields: {'email': 'taken', 'items[0].x': 'bad'}}})` distributes `fields` entries onto mounted fields' meta and auto-clears each on the next passing change/blur validation (probed). Field-level `onServer` NEVER auto-clears (probed: persisted through handleChange) — it's SSR-hydration-only internally. The alternative canonical channel (form `validators.onSubmitAsync` returning `{form?, fields}`) runs inside handleSubmit before `options.onSubmit` — either works; we standardize on `setErrorMap` after our own save fails (keeps the mutation flow ours).
5. **Validators:** every sync slot accepts a function OR a StandardSchemaV1 (zod ≥3.24 and zod 4 both work — our `zod ^3.24` fine, probed 3.25.76). Form-level fn may return `{form?, fields: Record<DeepKeys, unknown>}`. errorMap keys = onMount/onChange/onBlur/onSubmit/onServer/onDynamic. `ValidationError = unknown`; schema errors are `StandardSchemaV1Issue[]` (`.message`/`.path`), fn errors typically strings — normalize at the boundary. **Revalidation modes** live in the new `onDynamic` + `validationLogic` machinery (`revalidateLogic({mode, modeAfterSubmission})` or similar — implementer verifies the exact export) — this is how we get ra-style "validate on submit, re-validate on change". Fallback if that API is unstable: schema on `onSubmit` only + accept clear-on-edit-without-recheck (document).
6. **Arrays:** core FormApi ops `pushFieldValue/insertFieldValue/replaceFieldValue/removeFieldValue/swapFieldValues/moveFieldValues/clearFieldValues(field, ...)`; FieldApi mirrors (pushValue/removeValue/…). Scalar arrays WORK (probed `{tags: string[]}`; row field name `tags[1]` binds/validates, zod errors address `tags[1]`). Ops bump `meta._arrayVersion` (subscribe to it instead of value for row-structure re-render). `removeFieldValue` deletes trailing meta + revalidates from the removed index. NO row identity provided — positional; wrapper generates stable row ids. Every op takes `{dontUpdateMeta?, dontValidate?, dontRunListeners?}`.
7. **Reset/dirty:** `form.reset(values)` sets values, clears ALL meta+errors, AND mutates `options.defaultValues = values` → `isDefaultValue: true`. This IS the post-save reconciliation call. `reset(v, {keepDefaultValues: true})` keeps old baseline. `state.isDirty` is STICKY (ever-modified); `state.isDefaultValue`/per-field `meta.isDefaultValue` is the deep-equality check — use `!isDefaultValue` for unsaved-changes semantics. `form.update(newOptions)` REPLACES options wholesale (never pass a partial patch — you'd drop validators); an UNTOUCHED form auto-applies new defaultValues from `update()` (the async-record-arrives path); a touched form needs explicit `reset()`.
8. **Programmatic writes** (`setFieldValue`) default to marking touched+dirty — record hydration MUST pass `{dontUpdateMeta: true}` or the untouched-defaults path breaks forever.
9. **SSR-safe:** import+construct+mount+validate+submit all run in pure node; devtools event bus no-ops without window; no persistent timers.
10. **Gotchas:** `field.validate(cause)` no-ops while `!meta.isTouched` (programmatic validation needs `validateAllFields` which force-touches); `handleSubmit` RETHROWS `options.onSubmit` exceptions (wrapper catches); `canSubmit` is true on pristine invalid forms by design; form-level-schema errors duplicate into both `form.state.errors` and field metas (render one, not both); `reset()` clears server errors too.
11. **Deps/versions:** form-core 1.33.0 → `@tanstack/store ^0.11`, plus devtools-event-client + pacer-lite (transitive, inert in node). `@tanstack/react-form` 1.33 → `@tanstack/react-store ^0.11` (uSES shim). Store 0.x minors are breaking (0.7 Derived-class → 0.11 atoms; subscribe return changed) — do NOT re-export @tanstack/store types in our public API beyond opaque usage.

## 0b. ra-core parity digest (what "inputs rebridge cleanly" means)

From the parity sweep of ra-core's form layer + shadmin's actual consumption (~24 useInput inputs, choice inputs on ChoicesContext, iterator on ArrayInput contexts, 6 files using RHF context directly for watch/setValue/getFieldState/formState/fieldArray):

- **useInput contract** (the workhorse): in `{source, defaultValue, format, parse, validate, isRequired, id, onChange, onBlur}`; out `{id (auto via useId fallback), field: {name, value: format(raw) every render, onChange (writes parse(v) then chains user handler), onBlur}, fieldState: {invalid, isTouched, isDirty, error}, isRequired}`. Default `format: v == null ? '' : v`; default `parse: v === '' ? null : v` (clearing a text input stores null). isRequired detection: `isRequired` prop OR the RAW validate prop (or any array member) tagged `.isRequired === true` (`required()` tags itself).
- **Validator contract:** `(value, allValues, meta) => string | {message, args} | nullish | Promise<same>`; array composition short-circuits on first error, sync stays sync. Built-ins (required/minLength/maxLength/minValue/maxValue/number/regex/email/choices) all skip empty values except required, all return translatable payloads. ra smuggles `{message, args}` through RHF's string-only error slot via `'@@react-admin@@'+JSON` — **we don't need that hack**: form-core errors are `unknown`, translatable payloads flow natively. Improvement, note in docs.
- **defaultValues precedence:** field default = record value at source, else input defaultValue (field-level overrides form-level); form init = deep-merge defaultValues then record, RECORD WINS. Record identity drives reset: same id → soft (keep dirty values option), id change → hard reset dropping dirty. Reinit from record must NOT dirty the form.
- **Server errors (ra shape):** save RETURNS (not throws) an object mirroring form shape, leaves = messages; `{root: {serverError}}` = global. Chelone equivalent is already built: P4 `save()` resolves `ValidationError.fieldErrors: Record<string, string | string[]>` (flat dot/bracket paths). We reserve the key `root` for the form-level message.
- **sanitizeEmptyValues** (opt-in): TOP-LEVEL keys only; `null | ''` → `null` if key exists on record else key OMITTED; `0`/`false` kept.
- **Iterator contracts:** iterator: `{total, source, add(item?), remove(index) (+ scalar ghost-error revalidate), reOrder(from, to), clear()}`; row: `{index, total, remove(), reOrder(newIndex)}`; scalar mode = single sourceless child binding `${arraySource}[${index}]`, new scalar item `''`; object new item = first row's keys nulled + child defaults. Source scoping composes (`orders[0].items[0].reference`); labels scope WITHOUT the index.
- **ChoicesContext:** list-like base (page/perPage/sort/filterValues/setFilters(filters, displayed?, debounce?=500ms)/setPage/setPerPage/setSort/refetch/resource=REFERENCE/source/isFromReference) + union arms (pending/error/refetch-error-with-stale-data/success) over `allChoices` (page merged with selected — selected prepended + total+1 when missing, deduped by id), `availableChoices` (page only), `selectedChoices`. Selected resolution in ra is ID-ONLY via getMany — **the #16 gap we close with lookupKey**. `q` search lives input-side (`filterToQuery`, default `q => ({q})`) calling `setFilters` — controller stays generic. `enableGetChoices(filterValues)` gates the choices query ONLY (selected still resolves).
- **Deferred consumers to keep in mind (NOT P5):** FormGroups/tabbed/wizard validity badges (form-core 1.33 has FormGroupApi — evaluate in P6), warnWhenUnsavedChanges router blocking (P6; P5 exposes the dirty signal), FilterLiveForm (P6 — composes list+form controllers), create-suggestion flow + TranslatableInputs UI (P7). shadmin's RHF-direct usages (watch/setValue/getFieldState/formState/fieldArray) map to `form.store` selectors + `form.setFieldValue` + `form.getFieldMeta` + array ops — all present.

---

## 1. Design decisions (assumptions — user reviews these as the checkpoint)

| # | Decision | Why |
|---|----------|-----|
| D1 | `@chelone/core` gains peer `@tanstack/form-core ^1.33.0` (+ devDep). Core wraps FormApi in vanilla controllers; NO React anywhere in core (boundary lint already enforces). | Charter substrate rule; matches query-core precedent. |
| D2 | `@chelone/react` gains peer `@tanstack/react-store ^0.11.0` (+ devDep). We bridge externally-created FormApi/FieldApi with `useStore(store, selector)` — we do NOT depend on `@tanstack/react-form` (its useForm can't accept an external FormApi; everything it adds beyond the bridge is component sugar we rebuild in P7 shadcn-natively). | Framework-agnostic core owns the FormApi; react-store is the sanctioned selector bridge (identity-memoized field.store ⇒ field isolation for free). |
| D3 | Form binding follows the ratified 4R lifecycle: controller construction INERT; `form.mount()` on first subscriber, unmount on last unsubscribe; NO destroy effect in React bridges; `destroy()` for vanilla consumers. | P4 pattern-gate lesson; form-core's inert constructor makes it a clean fit. |
| D4 | Server field errors map via `form.setErrorMap({onSubmit: {form, fields}})` — `onSubmit` key for auto-clear-on-edit; `onServer` banned for field errors (never clears). `fieldErrors.root` = reserved form-level key. | Probe-verified semantics; matches user expectation (error clears when you fix the field). |
| D5 | Post-save reconciliation (#13): on successful save, `form.reset(savedRecord)` — form shows server truth, `isDefaultValue` true, no stale revert. Opt-out via option. | reset(values) rebaselines defaults — the exact primitive. |
| D6 | Zod resource schema (registry `defineResources`) = DEFAULT form validator when present (opt-in registry stays opt-in); user validators compose. Submit-then-change revalidation via form-core's `validationLogic`/`revalidateLogic` if stable, else onSubmit-only fallback. | Charter "point at a Zod schema, get 95%". |
| D7 | Validator contract keeps ra's `(value, allValues, meta)` shape + ported built-ins (skip-empty, `.isRequired` tagging) BUT errors are native translatable payloads (`string | {message, args}`) — no string-smuggling. | Migration familiarity; form-core's unknown-typed errors make ra's hack unnecessary. |
| D8 | Array row identity: wrapper-generated stable row ids tracked through push/insert/remove/swap/move (form-core is positional). Scalar arrays first-class (#20). | React keying + focus retention; probed positional identity moves on swap. |
| D9 | Choices controller supports `lookupKey` (default `'id'`): id → getMany; non-id → `getList(reference, {filter: {[lookupKey]: value}})` (#16). | Charter §11 commitment. |
| D10 | Composed controllers: `createEditFormController` / `createCreateFormController` = P4 record controllers + form controller wired (record→hydrate, save→fieldErrors→setErrorMap, success→reset). Standalone `createFormController` stays public (bulk-edit-drawer-class custom forms). | Money path convenience without welding layers. |
| D11 | `sanitizeEmptyValues` opt-in, top-level-only (exact ra semantics). Default parse `'' → null`, format `null/undefined → ''`. | Parity; least surprise for migrators. |
| D12 | P5 delivers HEADLESS logic only. Deferred: FormGroups (P6, evaluate upstream FormGroupApi), router-blocking unsaved-changes (P6 — P5 exposes `isDefaultValue`-based dirty signal), FilterLiveForm (P6), create-suggestion + translatable UI (P7). | Scope discipline; §7 phasing. |

---

## 2. Task plan (sequential SDD; each task = implementer + reviewer unless marked skip-review; TDD RED→GREEN; biome --write before commits; Conventional Commits; both suites + typecheck + lint green per task)

### T1 — core: form controller foundation
`packages/core/src/form/form-controller.ts` (+ deps wiring)
- Add `@tanstack/form-core` peer `^1.33.0` + devDep to core package.json; reconcile lockfile.
- `createFormController<TRecord>(options: FormControllerOptions<TRecord>): FormController<TRecord>`:
  - Options: `{defaultValues?, schema? (StandardSchemaV1), validate? (form-level fn, ra contract), save (data) => Promise<FieldErrors | undefined>, sanitizeEmptyValues?, resetOnSuccess? = true, onSuccess?, translate?}` — exact shape refined by implementer, but `save` MUST be the P4 contract (resolves fieldErrors, never rejects for provider errors).
  - Construction INERT: `new FormApi(...)` only (ground-truth #1). Controller exposes `form` (the FormApi), refcounted `subscribe(listener): () => void` (adapts store-0.11 `{unsubscribe}` objects; first subscriber → `form.mount()`, last unsub → unmount cleanup; re-entrant attach/detach), `getSnapshot()` (stable — `form.store.state` getter), `destroy()` (imperative teardown, idempotent).
  - `normalizeFormError(err: unknown): string | {message: string; args?} ` boundary helper (string | StandardSchemaV1Issue | {message,args} | other → String()).
- Type strategy (ground-truth: FormApi has 12 generics): generic in the DATA type only; internal widened alias (e.g. `AnyFormApi`-based) — public surface must not leak `any` (registry types stay precise via `DeepKeys`).
- Tests: inert construction (no mount side effects — spy on onMount validator + listeners), refcount attach/detach cycles (StrictMode order sub/unsub/sub), snapshot stability, destroy idempotence + destroy-while-attached, subscribe-after-destroy no-op, normalizeFormError matrix.

### T2 — core: save pipeline + server errors + reconciliation + composed controllers
`packages/core/src/form/save-pipeline.ts` + `form-controller.ts` growth + `edit-create-form.ts`
- `controller.submit()`: run form validation (schema via D6 wiring + validate fn); invalid → notify `chelone.message.invalid_form` (or `fieldErrors.root` message) via injected notifications (i18n keys, translate-fallback pattern from P4); valid → `sanitizeEmptyValues` if opted-in (exact ra semantics: top-level, null-if-on-record, omit-otherwise, keep 0/false) → `await save(values)` → fieldErrors returned? `form.setErrorMap({onSubmit: {form: fieldErrors.root, fields: <rest>}})` + invalid-form notify with root message; success → `resetOnSuccess && form.reset(saved)` (D5) then onSuccess.
- Wrap `form.handleSubmit` rethrow (ground-truth #10) — controller submit never rejects.
- `createEditFormController(ctx, resource, {id, mutationMode?, transform?, formOptions})`: composes P4 `createEditController` + form controller. Record hydration: untouched form → `form.update({...full options, defaultValues: merge(defaults, record)})` (record wins, deep merge); record id CHANGE → hard `form.reset(merged)`; same-id refetch → soft (keep dirty values — document). Hydration must NOT dirty the form (dontUpdateMeta paths, ground-truth #8). Save = edit controller's `save` (fieldErrors contract flows through). Attach/detach: ONE subscription lifecycle spanning both controllers (subscribing the form controller attaches the record controller too).
- `createCreateFormController(ctx, resource, {defaultValues?, transform?, ...})` similarly on `createCreateController`.
- Zod default: when `ctx`/options carry a resource schema (registry), wire per D6 (`validationLogic`/`revalidateLogic` — verify export; fallback documented).
- Tests: full submit matrix (invalid client-side, server fieldErrors incl. `root` + array paths `items[0].x`, success reset + isDefaultValue, resetOnSuccess:false), server-error auto-clear on field edit (pin probe semantics), sanitizeEmptyValues matrix (null/''/0/false × on-record/absent), edit hydration (async record arrives untouched vs touched, id-change hard reset, no-dirty invariant), create defaults, schema wiring (zod error lands on field, revalidation mode behavior).

### T3 — core: input binding contract
`packages/core/src/form/input-binding.ts` + `validators.ts` + `source.ts`
- `composeValidators` (ra contract D7: sequential, first-error short-circuit, sync-stays-sync, async awaited); built-ins: `required` (tags `.isRequired`), `minLength/maxLength/minValue/maxValue/number/regex/email/choices` — skip-empty (undefined/null/''/[]) except required; translatable payload returns (`{message: 'chelone.validation.*', args}`).
- `isRequired(validate)` detection on RAW prop (fn or array member `.isRequired === true`).
- `defaultFormat` (`v == null ? '' : v`) / `defaultParse` (`v === '' ? null : v`).
- Source composition: `composeSource(parent, child)` + scoped-source helper for iterator rows (`items[0]` / `items[0].x` bracket convention — form-core's own path syntax) and label scoping WITHOUT indices. Vanilla, context-free (React context wrapper in T4).
- Field-binding factory: `createFieldBinding(form, {source, defaultValue, format?, parse?, validate?, schema?})` → inert `new FieldApi({form, name: source, validators: wired, defaultValue})` + helpers (`getValue: format(raw)`, `setValue: parse + handleChange`, blur, refcounted mount lifecycle mirroring T1). Field validator wiring passes `(value, form.state.values, meta)` per D7.
- Tests: validator composition matrix, isRequired detection, format/parse defaults (''↔null, 0/false preserved), source composition incl. nested arrays, field binding lifecycle (inert, mount seeds default, unmount preserves touched/dirty per ground-truth #1), scalar-array field name `tags[0]` binds + validates.

### T4 — react: form + input bridges
`packages/react/src/form-hooks.ts` (+ context)
- Add `@tanstack/react-store` peer `^0.11.0` + devDep to react package.json.
- `useFormController(controller)` / `useForm(options)` (lazy `useState` construction from `useCheloneContext`, EXACT P4 binding doc-block pattern: inert lazy init, uSES/useStore attach on commit, NO destroy effect, options-after-mount ignored — remount with key).
- `useEditForm(resource, {id, ...})` / `useCreateForm(resource, {...})` — composed controllers bridged; snapshot slices via `useStore(form.store, selector)`; expose `{form, submit, saving, record-state slices, isDefaultValue, canSubmit, ...}`.
- `useInput({source, defaultValue, format, parse, validate, isRequired, id, onChange, onBlur})` → consumes ambient FormContext + SourceContext (React contexts provided by `<CheloneFormProvider>` or the form hooks): FieldApi via T3 factory in lazy useState (recreate on form/name change like react-form), mount via layout-effect-free refcounted subscribe (uSES on field.store slices — mirror react-form's 7-slice pattern; mount must happen commit-phase: wire through the binding's refcounted subscribe, NOT a bare effect, so Activity/Suspense semantics match D3), `field.update(opts)` freshness per render. Returns ra-parity shape `{id (useId fallback), field: {name, value: format(raw), onChange, onBlur}, fieldState: {invalid, isTouched, isDirty, error (normalized)}, isRequired}`.
- `SourceContext` provider + `useSourceContext`/`useWrappedSource` equivalents.
- Tests: field isolation smoke (typing field A doesn't re-render field B consumer — full budget test is T9), useInput contract (format applied every render, parse on change, chained user handlers, checkbox-style value handling), id fallback, StrictMode double-mount, useEditForm end-to-end (record loads → values appear → edit → save → server error on field → fix → clears → save → reset).

### T5 — PATTERN GATE (halt semantics — same as P4)
Adversarial probe agent attacks the T4 binding BEFORE anything builds on it:
- Discarded-render leaks: Suspense sibling suspending + initial-hidden `<Activity>`/thrown-after-init render across useForm/useEditForm/useInput — assert zero mounted FormApis/FieldApis (no registered field instances, no devtools listeners, no debounce timers), zero query observers from composed controllers, zero KV writes.
- StrictMode mount→cleanup→remount: form state survives, no double-mount validator runs beyond spec, field meta correct.
- Activity hide/show: detach aborts in-flight async validation (AbortController fired), re-attach revalidates correctly, values survive.
- Zombie writes: detached form's setFieldValue works (allowed) but mounts nothing.
- VERDICT PASS → continue; FAIL → halt, redesign addendum, second sitting (P4 protocol).

### T6 — core: array layer
`packages/core/src/form/array-binding.ts`
- `createArrayBinding(form, {source, defaultValue = []})` → iterator contract `{rows (stable ids!), total, add(item?), remove(index), reOrder(from, to), clear()}` + per-row `{id, index, name (scalar: source[i]; object base for children), remove(), reOrder(to)}`.
- Stable row ids (D8): internal id array mirroring every op (push/insert/remove/swap/move) — ids follow VALUES, not positions.
- Scalar mode (#20): detected/declared; new-item default `''`; remove revalidates the array field (ghost-error parity fix); object mode new-item = first-row-keys-nulled + provided defaults.
- Row re-render isolation: expose `_arrayVersion`-based subscription point (ground-truth #6) so React maps rows without deep-value subscription.
- Tests: id stability across full op matrix (incl. swap/move keeping id↔value pairing), scalar push/remove/ghost-error revalidate, object defaults, nested arrays (`orders[0].items[1].sku` naming), remove-trailing-meta behavior.

### T7 — core: choices controller
`packages/core/src/form/choices-controller.ts` (4R lifecycle via MicroStore onSubscribed — the P4 list-controller pattern)
- `createChoicesController(ctx, {reference, lookupKey = 'id', filter (permanent), page=1, perPage=25, sort={field:'id',order:'DESC'}, enableGetChoices?, debounceMs=500, meta?})`.
- Choices query: QueryObserver over P2 `getListOptions` (dynamic filters merged UNDER permanent filter; keepPreviousData-equivalent). `setFilters(filters, debounce?)` (removeEmpty + debounce timer cleared on detach), `setPage/setPerPage/setSort` (sort reset page to 1), `setValue(value | value[])` feeds selected resolution.
- Selected resolution (D9/#16): `lookupKey === 'id'` → getMany (batched key, null-filtered); else → `getList(reference, {filter: {[lookupKey]: value}})` per distinct value set. Enabled only for non-empty values; `enableGetChoices` gates CHOICES only.
- Merge rules (parity): `allChoices` = page + missing selected prepended (dedupe by lookupKey, total+1 single / unadjusted array), `availableChoices` = page, `selectedChoices`; state union pending/error/refetch-error-stale/success; `isPending` never blocked by valueless selected query.
- Tests: fetch params, q-style filter via setFilters + debounce (fake timers), non-id lookupKey single + array, merge matrix (selected in/absent/empty page), enableGetChoices gating, union transitions, 4R lifecycle (inert, attach fetches, detach releases both observers + debounce timer).

### T8 — react: array + choices bridges
`packages/react/src/array-hooks.ts` + `choices-hooks.ts`
- `useArrayInput({source, ...})` → T6 binding bridged; rows with stable keys; row context provider (`useIteratorItem` → {index, total, remove, reOrder}) + source-scoped SourceContext per row (labels unscoped).
- `ChoicesContextProvider` + `useChoicesContext(options)` (props-over-context: inline `choices` array — string[] → {id,name} — synthesizes client-side list, pagination off, isFromReference:false) + `useChoices({optionText='name', optionValue='id', disableValue, translateChoice})` → getChoiceText (string path | fn; translated with `{_: name}` fallback via i18n hooks) / getChoiceValue (get(choice, optionValue, choice.id)) / getDisableValue.
- `useReferenceInput(props)` → choices controller bridged (4R binding pattern), provides ChoicesContext.
- Tests: row keying stability under reorder (React reconciliation — assert DOM/fiber identity via testid), scalar rows render+edit, choices context union rendering, inline-choices synthesis, useChoices matrix, reference input end-to-end vs fake provider (search debounce, non-id lookupKey).

### T9 — perf + parity acceptance (§11 #4 budget)
`packages/react/src/form-perf.test.tsx` + `form-parity.test.tsx`
- **Perf budget (pinned as tests):** 300-field form; typing 5 chars into one field → that field's consumer re-renders ≤ 5+mount, EVERY other field consumer re-renders 0, form-shell (canSubmit/isDefaultValue subscriber) re-renders ≤ 2 (first-dirty + validity flip), array of 100 rows: push/remove re-renders iterator once + affected rows only. Render counting via profiler-callback or counter refs (the zustand-benchmark methodology). Mount time NOT wall-clock-asserted (CI flake) — document measured number in report instead.
- **Parity edges:** defaultValue precedence (record > input default > form defaults; null record value blocks input default; 0/''/false never overwritten), '' → null on clear + submit, hydration-not-dirty, server-error clear-on-edit, sticky isDirty vs isDefaultValue unsaved-changes signal, scalar-array ghost errors, checkbox value handling.

### T10 — barrels + exports + ledger (skip-review if mechanical; self-verify)
- Core barrel: form module exports (controllers, bindings, validators, types); react barrel: hooks + providers + `UseXResult` types (P4 Minor lesson: keep type symmetry).
- Full gate: both suites, typecheck, lint, uncached.
- `.superpowers/sdd/progress.md` P5 entry.

### Probes (parallel, after T10)
1. **Lifecycle attack:** T5 scenarios re-run fresh + churn (50× attach/detach with async validation in flight, post-destroy no-ops, composed edit-form full lifecycle under Suspense discard).
2. **Perf attack:** adversarially try to break isolation (form-level schema + per-field subscriptions; array version subscription; selector identity) — verify budget tests actually catch regressions (mutate a hook to subscribe wide, confirm test fails, revert).
3. **Parity probe:** independent agent runs the §0b checklist against the shipped API (no implementation reading first — black-box), reports gaps.
4. **Gate probe:** fresh clone-state uncached full pipeline (frozen lockfile, no .superpowers leak, boundary lint still walls React out of core — form-core import in core is ALLOWED, react-form/react-store in core is NOT: extend the Biome boundary rule).

### Final: opus review (MERGE-READY bar; 0 Critical/Important to close)

---

## 3. Conventions (carried from P0–P4)
- Zero `any` (core + react); `unknown`/generics; interfaces over type aliases for object shapes.
- No React imports in core (Biome boundary rule — extend banned list with `@tanstack/react-form`, `@tanstack/react-store` for core).
- Notifications are i18n keys (translate-fallback pattern); new keys under `chelone.validation.*` / `chelone.message.invalid_form` added to default catalog.
- Vitest: core jsdom-free where possible (`NODE_OPTIONS=--no-experimental-webstorage` already in core test script); react tests via @testing-library/react; type tests in `*.test-d.ts`.
- `.superpowers/` stays git-excluded; briefs/reports archived under `.superpowers/sdd/p5/`.
- Commits straight to main, Conventional Commits, no push.
