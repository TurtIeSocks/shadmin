# shadcn Cleanup — Refactor Workspace

Status: **in progress** (delegate mode, autonomous run 2026-06-09).
Owner decision locked: **full migration of admin inputs to shadcn `ui/field.tsx`**.

This single doc covers the systematic-refactor artifacts (trace / goals / assessment / old→new map) plus the executable task list. Written for review on return.

---

## 1. Trace (condensed — from audit)

`src/components/` splits into:

- `ui/` — 58 shadcn primitives (mostly canonical). Modern primitives present: `field`, `input-group`, `empty`, `spinner`, `item`, `kbd`, `button-group`, `native-select`. Plus one **non-shadcn** custom: `ui/color-picker/`.
- `admin/` — 161 react-admin wrappers (headless ra-core hooks + shadcn UI). The audit target.
- `extras/`, `block-editor/`, `mdx-editor/`, `monaco/`, `rich-text-input/`, `leaflet/`, `csv-import/`, `realtime/`, `supabase/` — feature add-ons; several contain inputs.

Form-field plumbing (the core finding): **three parallel systems**.

| System | File | Status |
|---|---|---|
| Modern shadcn `Field`/`FieldGroup`/`FieldError` | `ui/field.tsx` | installed, **unused** (only `demo/App.tsx`) |
| Legacy shadcn `FormField`/`FormItem` | `ui/form.tsx` | **dead** — 0 imports |
| ra-adapted fork | `admin/form.tsx` + `hooks/use-form-field.ts` | the one in use (~28 inputs) |

## 2. Goals + Constraints (delegated — see Assumptions §6)

Drivers (picked on user's behalf, delegate mode):
- **Readability / maintainability** — collapse to one shadcn-native form system.
- **Dependency/indirection reduction** — kill the fork + double-subscription.
- **Convention adoption** — `Field`, `data-icon`, `Spinner`, semantic tokens.

Constraints:
- Breaking changes to the **public input API** (`source`, `label`, `helperText`, `validate`, …): **not allowed**. Props and rendered behavior stay identical; only internals change.
- Migration strategy: **strangler** — repoint inputs one family at a time onto `ui/field.tsx` while the fork still exists; delete fork only once nothing imports it.
- No push / no merge to `main` autonomously. Work lands on branch `c/nostalgic-almeida-09c189`, committed per phase, left for review.

## 3. Assessment (verdicts)

| Module | Verdict | Why |
|---|---|---|
| `ui/form.tsx` | **Delete** | dead, 0 imports |
| `admin/form.tsx` | **Delete (after migration)** | fork of shadcn form; superseded by `ui/field.tsx` |
| `hooks/use-form-field.ts` | **Delete (after migration)** | only `admin/form.tsx` consumes it |
| `admin/input-helper-text.tsx` | **Keep, repoint** | translation shim; swap `FormDescription`→`FieldDescription` |
| ~28 input components | **Port + redesign** | onto `Field`/`FieldLabel`/`FieldError`/`FieldDescription` |
| `admin/labeled.tsx` | **Defer** | field-display (read view), not an input; separate pass |
| `ui/color-picker/` | **Defer / flag** | non-shadcn custom component; size-* nits fixed in sweep, deeper review later |

## 4. Old→New Map — the canonical input pattern

Every input keeps `useInput()` from ra-core but renders shadcn `Field`. The fork's `FormItemContext` + `useFormField` re-subscription is removed; error comes straight from `useInput().fieldState`.

### 4a. Text-like (text, number, password, search, date, time, date-time, autocomplete, + extras: color, cron, currency, duration, phone, webhook, subscription-plan-picker; + editors: rich-text, mdx, monaco-json, block-editor)

```tsx
const resource = useResourceContext(props);
const { id, field, fieldState, isRequired } = useInput({ ...props, type });
const invalid = fieldState.invalid;
const err = fieldState.error?.root?.message ?? fieldState.error?.message;

return (
  <Field className={className} data-invalid={invalid || undefined}>
    {label !== false && (
      <FieldLabel htmlFor={id}>
        <FieldTitle label={label} source={source} resource={resource} isRequired={isRequired} />
      </FieldLabel>
    )}
    <Input id={id} aria-invalid={invalid || undefined} {...sanitizeInputRestProps(rest)} {...field} />
    <InputHelperText helperText={helperText} />
    <FieldError>{invalid && err ? <ValidationError error={err} /> : null}</FieldError>
  </Field>
);
```

Notes:
- Preserve ra translation of validation messages by passing `<ValidationError>` as `FieldError` **children** (FieldError renders children verbatim). Do NOT use FieldError's `errors=` default rendering — it would skip translation.
- `data-invalid` on `Field` (styling), `aria-invalid` on the control (a11y + Input's destructive ring). Matches shadcn forms rule.
- Use `id` directly for label/control wiring; drop the old `formItemId` indirection.

### 4b. Boolean (boolean, nullable-boolean) — horizontal Field

```tsx
<Field orientation="horizontal" data-invalid={invalid || undefined}>
  <Switch id={id} aria-invalid={invalid || undefined} checked={...} onCheckedChange={...} />
  <FieldLabel htmlFor={id}><FieldTitle .../></FieldLabel>
</Field>
// description + error below the Field
```
Replace `<div className="flex items-center gap-x-2">` with `Field orientation="horizontal"`. `gap-x-2`→component gap.

### 4c. Choice groups (radio-button-group, checkbox-group, select, select-array) — FieldSet + FieldLegend

```tsx
<FieldSet data-invalid={invalid || undefined}>
  <FieldLegend variant="label"><FieldTitle .../></FieldLegend>
  <RadioGroup ...>
    {choices.map((c) => (
      <Field key={...} orientation="horizontal" data-disabled={isDisabled || undefined}>
        <RadioGroupItem id={optId} value={...} disabled={isDisabled} />
        <FieldLabel htmlFor={optId}>{getChoiceText(c)}</FieldLabel>
      </Field>
    ))}
  </RadioGroup>
  <InputHelperText helperText={helperText ?? fetchError?.message} />
  <FieldError>{...}</FieldError>
</FieldSet>
```
Drops the manual `opacity-50 cursor-not-allowed` on each option label — `data-disabled` on `Field` dims `FieldLabel` via the component's own `group-data-[disabled]` rule. `gap-x-2`→`gap-*`. (`SelectInput`/`select-array` keep the trigger but wrap label/desc/error in `Field`, not `FieldSet`, since the menu isn't a visible option list.)

### 4d. Composite (array-input + simple-form-iterator, datagrid-input, file-input, image-input, translatable-inputs) — nested FieldGroup
Wrap sub-fields in `FieldGroup`; per-row controls follow the relevant pattern above. Highest-touch; do last.

### 4e. `Form` provider
`admin/form.tsx` exports `Form = FormProvider`. Repoint live consumers to ra-core's `Form` (or RHF `FormProvider`) before deleting the fork. Verify `simple-form.tsx` / `form.tsx` during exec.

---

## 5. Task list (ordered)

### Phase 1 — Safe mechanical sweeps (no design calls; do first)
- [ ] P1.1 Delete dead `ui/form.tsx` (confirm 0 imports first).
- [ ] P1.2 `animate-pulse` skeletons → `<Skeleton>`: `data-table.tsx:1088,1099`, `prev-next-buttons.tsx:60`. (`linear-progress` is a progress bar — leave or use `Progress`.)
- [ ] P1.3 Raw colors → semantic tokens: `simple-form-iterator.tsx` (`text-red-500`→`text-destructive`), `ready.tsx`, `configurable.tsx`, `auth-layout.tsx`, `image-field.tsx` JSDoc.
- [ ] P1.4 `space-y/x` → `flex flex-col gap`: `saved-queries.tsx`, `login-form.tsx`, `login-with-email.tsx`, `simple-list-loading.tsx`.
- [ ] P1.5 `ui/color-picker` equal-dim `w-N h-N` → `size-N`.
- [ ] P1.6 Manual disabled styling removal (`opacity-50 cursor-not-allowed`, Button already handles): `save-button.tsx` + 6 others.
- [ ] P1.7 Button spinner → `Spinner` + `data-icon`; drop `Loader2`/manual `animate-spin`/`mr-2` (6 files).
- [ ] P1.8 `data-icon` adoption + drop manual icon `size-*` inside buttons (~30 files). Largest sweep.
- **Verify:** lint + typecheck + affected specs.

### Phase 2 — Form migration (strangler, by family)
- [ ] P2.0 Build reference migration on `text-input.tsx`; TDD green (its spec + new a11y assertions). Establishes the pattern.
- [ ] P2.1 Repoint `input-helper-text.tsx`: `FormDescription`→`FieldDescription` from `ui/field`.
- [ ] P2.2 Text-like family (admin) — remaining text-likes.
- [ ] P2.3 Boolean family.
- [ ] P2.4 Choice-group family (FieldSet/FieldLegend).
- [ ] P2.5 Reference family (reference-input, reference-array-input).
- [ ] P2.6 Extras family (color, cron, currency, duration, phone, webhook, subscription-plan-picker, rating).
- [ ] P2.7 Editors family (rich-text, mdx, monaco-json, block-editor-input).
- [ ] P2.8 Composite family (array+iterator, datagrid, file, image, translatable).
- [ ] P2.9 Repoint `Form` provider consumers; delete fork: `admin/form.tsx`, `hooks/use-form-field.ts` (+ its spec), update `admin/index.ts` exports.
- **Verify per family:** the family's `.spec.tsx` suite. **Final:** full `pnpm test` + lint + typecheck.

### Phase 3 — Finish
- [ ] Full suite green, lint clean, typecheck clean.
- [ ] Commits per phase on branch. Leave for user review (no push/merge).

---

## 6. Assumptions (delegate-mode judgement calls — review these)

1. **Scope = all ~28 inputs** (admin + extras + editors), not just core 16 — they all import the fork; partial migration would leave it alive.
2. **Public input props unchanged.** Internal-only refactor. If any spec asserts on the old `*-form-item` id suffix or DOM structure, I update the spec to the new structure (behavioral assertions preserved).
3. **`input-helper-text.tsx` kept** as a translation shim (repointed), rather than inlining `FieldDescription` in 28 files.
4. **`labeled.tsx` and field-display (read views) deferred** — this pass is inputs only.
5. **`ui/color-picker` kept**, only nit-fixed — replacing it with a registry component is a separate decision.
6. **No autonomous push or merge to `main`.** Work committed on the feature branch, left for review.
7. **`linear-progress` animate-pulse left as-is** — it's an indeterminate progress indicator, not a skeleton.
