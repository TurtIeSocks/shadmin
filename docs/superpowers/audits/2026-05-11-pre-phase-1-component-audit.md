# Pre-Phase-1 Component Audit

**Date:** 2026-05-11 · **Branch:** `full-claude` · **Method:** 7 parallel read-only audit subagents (Batches A-G) comparing pre-Phase-1 shadcn-admin-kit components against their `ra-ui-materialui` upstream counterparts at `/Users/rin/GitHub/react-admin/packages/ra-ui-materialui/`.

## Scope

- **In scope:** ~70 pre-Phase-1 components in `src/components/admin/` with an upstream MUI counterpart.
- **Out of scope:** shadcn-specific files with no MUI source (`admin.tsx`, `app-sidebar.tsx`, `theme-provider.tsx`, `theme-mode-toggle.tsx`, `breadcrumb.tsx`), `rich-text-input/` (TipTap), and components touched by Phase 1 (`delete-button.tsx`, `bulk-delete-button.tsx`, `form.tsx`, `layout.tsx`, `tabbed-form.tsx`).

## What "feels wrong" means here

Per user direction: bugs, stale patterns, accessibility gaps, internal inconsistencies, performance smells, security concerns, TypeScript laxness on hot paths. **Not** drift to ignore: missing/renamed props, visual differences, deliberate simplifications.

## Triage summary

| Severity | Count | Action |
|---|---|---|
| 🐛 **Critical** (bug — wrong output, silent data loss, security, crashes) | **24** | Fix before Phase 2 |
| ⚠️ **Important** (smell — a11y gaps, missing edge cases, perf, TS laxness) | **48** | Fix during Phase 2 or as a batch |
| 📝 **Minor** (note, cleanup opportunity, dead code) | **34** | Backlog |

Highlights below; full per-component findings in §1-§7.

## Critical issues (must-fix shortlist)

### Security / data integrity
- **`url-field.tsx:62`** — `href={value}` accepts raw record value. `javascript:` URLs execute on click. No scheme validation.
- **`number-input.tsx:49-55`** — Clearing the field writes `0` to the form (silent data corruption). User's `onChange`/`onBlur` are double-invoked because both `useInput(props)` and `handleChange` fire them.
- **`select-input.tsx:178-191, 270, 298`** — Lossy `.toString()` on value: numeric ids submitted as strings (`"3"` instead of `3`). API rejects on type mismatch.
- **`autocomplete-input.tsx:130-132`**, **`autocomplete-array-input.tsx:107`**, **`radio-button-group-input.tsx:140-152`** — Id type coercion: strict `===` comparison between string `field.value` and numeric `getChoiceValue()` silently breaks selection.
- **`autocomplete-array-input.tsx:107, 116, 127, 130`** — Crashes when `field.value` is `undefined` (no `?? []` coalesce).

### Crashes / silent failures
- **`date-time-input.tsx:259-262`** — `new Date('').toISOString()` throws `RangeError` when user clears the field.
- **`select-all-button.tsx:36`** — Once `isSelected` flips true, button is unmounted forever; clearing selection externally doesn't bring it back.
- **`edit-button.tsx:54-58`**, **`show-button.tsx:54-58`** — Render `/<resource>/undefined/edit` when no `RecordContext`. Upstream returns `null` if no record.
- **`record-field.tsx:64`** — `useRecordContext({ recordProp })` passes the wrong key. The `record` prop is silently ignored.
- **`reference-many-count.tsx:67`** — `record[source]` fails for nested/dotted paths; upstream uses `lodash/get`.
- **`reference-many-count.tsx:59`** — On error, renders the literal string `"error"`.
- **`saved-queries.tsx:134-141`** — `removeQuery` with `findIndex` returning `-1` corrupts the saved queries list (duplicates last entry, drops it).
- **`columns-button.tsx:89, 97`** — `resource` prop leaks into DOM as an HTML attribute (React warning + invalid HTML).
- **`file-input.tsx:329-337`** — Blob URLs never revoked (memory leak). Cleanup reads `file.preview` but FileInput stores it as `file.src`.

### Data table issues
- **`data-table.tsx:108-137`** — Empty state replaces the table wrapper entirely → `ColumnsSelector` popover empty, `BulkActionsToolbar` portal never mounts.
- **`data-table.tsx:148-160`** — `onCheckedChange` typed as `(checked: boolean)` but Checkbox sends `boolean | "indeterminate"`. Clicking an indeterminate checkbox falls into the "select all" branch unconditionally. Also `isRowSelectable` not honored.
- **`data-table.tsx:271-277`** — Row checkbox double-fire: `TableCell` `onClick` AND `Checkbox` `onClick` both call `handleToggle` → toggles then re-toggles.
- **`data-table.tsx:111`** — Loading state hard-coded to `null` → blank page during initial fetch.

### Pagination
- **`list-pagination.tsx:63`** — `count = total ? Math.ceil(total / perPage) : 1` mis-renders when `total === 0` (shows count = 1).
- **`list-pagination.tsx:59, 141`** — `pageEnd` becomes `undefined` for partial pagination, displayed as `"1-undefined of undefined"`.
- **`list-pagination.tsx:63-98`** — Partial pagination (`total == null`) renders no page numbers; only prev/next chevrons work.

### Detail views
- **`edit.tsx:112`**, **`show.tsx:111`** — Return `null` when record is missing → blank page on 404s, no breadcrumb/title/feedback. Upstream renders empty `<CardContent>` keeping page chrome.
- **`edit-guesser.tsx:41-47`**, **`show-guesser.tsx:35-41`** — Drop all base-controller props (`id`, `resource`, `mutationMode`, `queryOptions`, `redirect`, `transform`). `<EditGuesser mutationMode="optimistic" redirect={false} />` silently no-ops.

### Notifications / auth
- **`notification.tsx:61-75, 96-97`** — Undoable mutations double-fire: `onDismiss` and `onAutoClose` both call `mutation({ isUndo: false })`. After clicking "Undo", `mutation({ isUndo: true })` runs first, then `mutation({ isUndo: false })` runs second.
- **`notification.tsx:40-101`** — No `currentNotification` one-at-a-time guard; fast successive `notify()` calls can race-drain the queue.
- **`notification.tsx:85-86`** — `autoHideDuration === 0` passed straight to sonner (interpreted as "auto-dismiss now", not "never"). Upstream distinguishes `undefined`/`null`/`0` properly.
- **`login-page.tsx:87-89`** — Hardcoded demo credentials shipped in library default: `"Try janedoe@acme.com / password"`.
- **`text-input.tsx:42-72`** — `validate`/`format` destructures are dead (full `props` still passed to `useInput`). `{...rest}` spread leaks `source`, `resource`, `validate`, etc. as DOM attributes.

## Cross-cutting patterns

A few systemic issues that show up across many files:

1. **Id type coercion** — at least 4 components (`autocomplete-input`, `autocomplete-array-input`, `select-input`, `radio-button-group-input`) use strict `===` for id comparison. Recommend a shared `areIdsEqual(a, b)` helper.
2. **`value == null` vs upstream `!value`** — shadcn fields treat only `null`/`undefined` as empty; empty strings sneak through. `text-field`, `email-field`, `url-field`, `badge-field` all render broken anchors / empty wrappers for `""` values.
3. **Invalid Tailwind classes silently dead** — `loading.tsx` has `width-9 height-9 color-muted`; `error.tsx` has `text-xls`; `authentication.tsx` has `w-2em h-2em`. None apply styles.
4. **Missing `aria-label` on icon-only buttons** — `refresh-button`, `locales-menu-button`, `bulk-actions-toolbar` unselect, `user-menu` trigger.
5. **`process.env.NODE_ENV` in a Vite project** — `list-guesser.tsx:97`, `edit-guesser.tsx`, `show-guesser.tsx`, `error.tsx:45`. Should be `import.meta.env.DEV`.
6. **No URL sanitization** — `url-field`, `file-field`, `image-field` accept user-supplied URLs without scheme validation.

---

# Per-batch findings

## §1. Batch A — Buttons (13 components)

### Issues found

| Component | Status | Issue | Severity | File:Line | Recommendation |
|---|---|---|---|---|---|
| `bulk-export-button.tsx` | 📝 note | Redundant `role="button"` on native `<button>` | Minor | `bulk-export-button.tsx:65` | Fix |
| `bulk-export-button.tsx` | ⚠️ smell | `sanitizeRestProps` does not strip `exporter` from `props`; spread leaks function prop to DOM | Important | `bulk-export-button.tsx:86-94` | Fix |
| `bulk-export-button.tsx` | ⚠️ smell | `handleClick` recreated every render, not wrapped in `useCallback` | Minor | `bulk-export-button.tsx:57-60` | Fix |
| `cancel-button.tsx` | ⚠️ smell | `navigate(-1)` no-ops when there's no history (opened in new tab) | Important | `cancel-button.tsx:38` | Fix — fallback to list/show |
| `columns-button.tsx` | 🐛 bug | `rest` spread still contains `resource` → DOM attribute on `<button>`, React warning | Critical | `columns-button.tsx:89, 97` | Fix |
| `columns-button.tsx` | ⚠️ smell | Hand-rolled `hidden`-toggle popover wrapper; not Radix-idiomatic | Minor | `columns-button.tsx:103-114` | Fix |
| `columns-button.tsx` | ⚠️ smell | `setInterval` polling (100ms × 5) to find portal target is fragile | Important | `columns-button.tsx:147-165` | Fix |
| `columns-button.tsx` | 📝 note | Stale `@ts-ignore` for `diacritic` import | Minor | `columns-button.tsx:10-11` | Fix |
| `create-button.tsx` | ⚠️ smell | When `resource === undefined`, `createPath` produces `/undefined/create` | Important | `create-button.tsx:40-46` | Fix |
| `create-button.tsx` | ⚠️ smell | No `className` / extra props / ref forwarding | Important | `create-button.tsx:12-15, 38, 57-67` | Fix |
| `edit-button.tsx` | 🐛 bug | `createPath({ id: record?.id })` yields `/<resource>/undefined`. No `useCanAccess`. | Critical | `edit-button.tsx:54-58` | Fix |
| `edit-button.tsx` | ⚠️ smell | No `className`/extra-props passthrough | Important | `edit-button.tsx:15-19, 68-77` | Fix |
| `export-button.tsx` | ⚠️ smell | `resources.${resource}.action.export` with `resource` possibly undefined | Important | `export-button.tsx:57-58` | Fix |
| `export-button.tsx` | ⚠️ smell | `if (!getData) throw` in click handler (runtime trap) vs render-time guard. Upstream falls back to `dataProvider.getList(...)`. | Important | `export-button.tsx:70-90` | Fix |
| `export-button.tsx` | 📝 note | Hardcoded English `"HTTP Error"` notification | Minor | `export-button.tsx:89` | Fix |
| `icon-button-with-tooltip.tsx` | ⚠️ smell | Tooltip only opens on mouse, not keyboard focus | Important | `icon-button-with-tooltip.tsx:66-67` | Fix |
| `icon-button-with-tooltip.tsx` | 📝 note | Wraps each instance in own `<TooltipProvider>` | Minor | `icon-button-with-tooltip.tsx:54` | Fix |
| `locales-menu-button.tsx` | ⚠️ smell | No `aria-label`; trigger announces just "E N" | Important | `locales-menu-button.tsx:41-43` | Fix |
| `locales-menu-button.tsx` | 📝 note | Drops upstream `languages` prop | Minor | `locales-menu-button.tsx:23` | Fix |
| `refresh-button.tsx` | ⚠️ smell | Not `disabled` while `loading === true`; clicks queue up | Important | `refresh-button.tsx:22-29` | Fix |
| `refresh-button.tsx` | ⚠️ smell | No `aria-label` on icon-only button | Important | `refresh-button.tsx:22-29` | Fix |
| `select-all-button.tsx` | 🐛 bug | Once `isSelected` flips true, button unmounted forever; doesn't react to external deselect | Critical | `select-all-button.tsx:36, 50-55` | Fix |
| `select-all-button.tsx` | ⚠️ smell | Missing upstream guards (`total === selectedIds.length`, `limit` check) | Important | `select-all-button.tsx:53-55` | Fix |
| `select-all-button.tsx` | ⚠️ smell | Default `limit` missing (upstream defaults to 250) | Important | `select-all-button.tsx:30, 42` | Fix |
| `show-button.tsx` | 🐛 bug | Same `/<resource>/undefined` as edit-button; no `useCanAccess` | Critical | `show-button.tsx:54-58` | Fix |
| `sort-button.tsx` | ⚠️ smell | `useResourceContext(props)` returning undefined → key `resources.undefined.action.sort_by` | Important | `sort-button.tsx:59, 86` | Fix |
| `sort-button.tsx` | ⚠️ smell | `arePropsEqual` typed `any` and only compares `fields`; `label`/`icon` won't re-render | Important | `sort-button.tsx:146-147` | Fix |
| `sort-button.tsx` | 📝 note | In mobile/icon mode, previously-sorted field invisible | Minor | `sort-button.tsx:93-112` | Skip |
| `toggle-filter-button.tsx` | ⚠️ smell | `getIsSelected` + `toggleFilter` recompute `pickBy + matches` per render | Minor | `toggle-filter-button.tsx:41, 60-78` | Fix |
| `toggle-filter-button.tsx` | 📝 note | `value: any`, `filters: any` despite typed `FilterPayload` available | Minor | `toggle-filter-button.tsx:1, 31-37` | Fix |
| `toggle-filter-button.tsx` | 📝 note | No `aria-pressed={isSelected}` on toggle button | Important | `toggle-filter-button.tsx:44-57` | Fix |

### Batch A notes
- Recurring pattern: `create-button`, `edit-button`, `show-button` dropped the upstream `useCanAccess` + `!record` guard → render broken `/resource/undefined/...` URLs in contexts where they previously rendered nothing.
- Icon-only buttons (`refresh-button`, `locales-menu-button`) missing `aria-label`s.
- Memoization wrappers (`sort-button`, `create-button`/`show-button`) compare only a subset of props.

---

## §2. Batch B — Fields (18 components)

### Issues found

| Component | Status | Issue | Severity | File:Line | Recommendation |
|---|---|---|---|---|---|
| `record-field.tsx` | 🐛 bug | `useRecordContext<RecordType>({ recordProp })` passes wrong key — `record` prop silently ignored | Critical | `record-field.tsx:64` | Fix |
| `reference-many-count.tsx` | 🐛 bug | `record[source]` direct property access; fails for nested paths. Upstream uses `lodash/get` | Critical | `reference-many-count.tsx:67` | Fix |
| `reference-many-count.tsx` | 🐛 bug | On error, renders literal `"error"` string | Critical | `reference-many-count.tsx:59` | Fix |
| `count.tsx` | ⚠️ smell | `<CircleX color="error" />` — Lucide `color` expects CSS color, `"error"` invalid | Important | `count.tsx:66` | Fix |
| `count.tsx` | ⚠️ smell | When `link && total === undefined`, renders empty anchor | Important | `count.tsx:67-69` | Fix |
| `reference-many-count.tsx` | ⚠️ smell | No loading indicator (returns `""`); causes layout shift | Important | `reference-many-count.tsx:59` | Fix |
| `reference-many-count.tsx` | ⚠️ smell | Uses `isLoading` not `isPending`; inconsistent with upstream | Important | `reference-many-count.tsx:46` | Fix |
| `reference-many-count.tsx` | 📝 note | `timeout?: number` prop declared but never used | Minor | `reference-many-count.tsx:91` | Fix |
| `file-field.tsx` | 🐛 bug | Array branch: `srcValue` falls back to `title`, not `src` → `href={undefined}` | Important | `file-field.tsx:74` | Fix |
| `file-field.tsx` | ⚠️ smell | `useFieldValue({...props, source: title})` — `title` may collide with record path | Important | `file-field.tsx:46-51` | Fix |
| `image-field.tsx` | 🐛 bug | `srcValue = src ? get(file, src, title) : title` — falls back to title text → broken `<img src="My Photo">` | Important | `image-field.tsx:67` | Fix |
| `image-field.tsx` | ⚠️ smell | `<img alt={undefined}>` when `title` unset → a11y warning | Important | `image-field.tsx:72-73` | Fix |
| `boolean-field.tsx` | ⚠️ smell | When `TrueIcon`/`FalseIcon` is null, renders empty `<div />` inside `TooltipTrigger asChild` — no aria-label | Important | `boolean-field.tsx:54-62` | Fix |
| `boolean-field.tsx` | ⚠️ smell | No `aria-label`/`role` on icon; SR users miss state | Important | `boolean-field.tsx:53-62` | Fix |
| `reference-field.tsx` | ⚠️ smell | When `id == null`, returns `empty` without rendering `ReferenceFieldBase`; user-provided `loading` never shown | Important | `reference-field.tsx:51-57` | Fix |
| `reference-field.tsx` | ⚠️ smell | Forwards full `props` to `useFieldValue` (`reference`, `link`, etc. ignored) | Minor | `reference-field.tsx:48` | Fix |
| `reference-field.tsx` | 📝 note | `queryOptions` typed `UseQueryOptions<RaRecord[], Error>` but single reference | Minor | `reference-field.tsx:74-77` | Fix |
| `reference-array-field.tsx` | ⚠️ smell | Error UI silently swallowed when `errorElement` not set | Important | `reference-array-field.tsx:128-130` | Fix |
| `reference-array-field.tsx` | 📝 note | `errorElement` vs `error` naming inconsistency | Minor | `reference-array-field.tsx:111` | Fix |
| `reference-many-field.tsx` | ⚠️ smell | Error state renders `undefined` when no `errorElement` | Important | `reference-many-field.tsx:96-98` | Fix |
| `reference-many-field.tsx` | 📝 note | Empty defaults to `undefined`; no string-form translation path | Minor | `reference-many-field.tsx:110` | Fix |
| `text-field.tsx` | ⚠️ smell | Empty string `""` not treated as empty (vs upstream `!value`) | Important | `text-field.tsx:39` | Fix |
| `email-field.tsx` | ⚠️ smell | Empty string renders `<a href="mailto:">` — broken link | Important | `email-field.tsx:18` | Fix |
| `url-field.tsx` | 🐛 bug | `href={value}` no scheme validation; `javascript:` URLs execute | Important | `url-field.tsx:62` | Fix (security) |
| `url-field.tsx` | ⚠️ smell | Empty string → `<a href="">` (current page) | Important | `url-field.tsx:47` | Fix |
| `url-field.tsx` | 📝 note | Missing `rel="noopener noreferrer"` for `target="_blank"` | Minor | `url-field.tsx:60-67` | Fix |
| `file-field.tsx` | 📝 note | Same `rel` issue for `target="_blank"` | Minor | `file-field.tsx:78-87` | Fix |
| `date-field.tsx` | ⚠️ smell | Invalid date silently renders blank | Important | `date-field.tsx:46-72` | Fix |
| `number-field.tsx` | ⚠️ smell | `transform` may yield non-number; renders verbatim | Minor | `number-field.tsx:41, 62` | Fix |
| `number-field.tsx` | ⚠️ smell | `NaN` renders as "NaN" string | Minor | `number-field.tsx:44` | Fix |
| `array-field.tsx` | 📝 note | No empty-state fallback | Minor | `array-field.tsx:43, 59` | Skip |
| `single-field-list.tsx` | ⚠️ smell | `key={index}` instead of `record.id` | Minor | `single-field-list.tsx:56` | Fix |
| `single-field-list.tsx` | ⚠️ smell | No loading/empty handling | Minor | `single-field-list.tsx:55` | Fix |
| `badge-field.tsx` | ⚠️ smell | `value.toString()` on objects/arrays → `"[object Object]"` | Minor | `badge-field.tsx:56` | Fix |
| `badge-field.tsx` | ⚠️ smell | Redeclares `variant` instead of inheriting `BadgeProps.variant` | Minor | `badge-field.tsx:63` | Fix |
| `select-field.tsx` | 📝 note | `choices.find(...)` uses `any` cast | Minor | `select-field.tsx:74` | Fix |

### Batch B notes
- Reference fields silently swallow errors when consumer doesn't provide `errorElement`.
- Empty/null/empty-string handling is inconsistent across the field family.
- Multiple URL-bearing fields lack scheme sanitization.

---

## §3. Batch C — Text / Numeric / File Inputs (9 components)

### Issues found

| Component | Status | Issue | Severity | File:Line | Recommendation |
|---|---|---|---|---|---|
| `boolean-input.tsx` | 🐛 bug | Wrong handler signature: passes `boolean` to `field.onChange` but `useInput({ type: 'checkbox' })` expects an event | Critical | `boolean-input.tsx:69-76` | Fix |
| `boolean-input.tsx` | ⚠️ smell | Asymmetric `onBlur`/`onFocus`: one through `useInput`, other forwarded raw | Important | `boolean-input.tsx:43-44, 84` | Fix |
| `boolean-input.tsx` | 📝 note | `field.ref` never attached to `<Switch>`; RHF can't `setFocus()` | Minor | `boolean-input.tsx:78-101` | Fix |
| `date-input.tsx` | ⚠️ smell | `onBlur` prop never forwarded to `useInput` | Important | `date-input.tsx:65-78` | Fix |
| `date-time-input.tsx` | 🐛 bug | `new Date('').toISOString()` throws RangeError on clear | Critical | `date-time-input.tsx:259-262` | Fix |
| `date-time-input.tsx` | ⚠️ smell | `className` lands on both `FormField` and inner `<Input>` | Important | `date-time-input.tsx:189-194` | Fix |
| `date-time-input.tsx` | 📝 note | `useRef<HTMLInputElement>(undefined)` should be `null` | Minor | `date-time-input.tsx:71` | Fix |
| `date-time-input.tsx` | 📝 note | `handleChange`/`handleBlur` not wrapped in `useEvent` (DateInput is) | Minor | `date-time-input.tsx:108-161` | Fix |
| `file-input.tsx` | 🐛 bug | Blob URL never revoked (memory leak) — cleanup reads `file.preview` but FileInput stores it as `file.src` | Critical | `file-input.tsx:329-337` | Fix |
| `file-input.tsx` | ⚠️ smell | Rejected files silently dropped; no error feedback | Important | `file-input.tsx:150-169` | Fix |
| `file-input.tsx` | ⚠️ smell | `onBlur` not wired through `useInput` | Important | `file-input.tsx:128-147` | Fix |
| `file-input.tsx` | 📝 note | Custom `<input>` attrs may collide with `getInputProps()` spread | Minor | `file-input.tsx:242-248` | Fix |
| `file-input.tsx` | 📝 note | Dead `alwaysOn` destructure (filter-only concept) | Minor | `file-input.tsx:63` | Remove |
| `number-input.tsx` | 🐛 bug | Clearing field writes `0` to form (`numberValue ?? 0`); silent data corruption | Critical | `number-input.tsx:49-55` | Fix |
| `number-input.tsx` | 🐛 bug | `useInput(props)` + manual `handleChange` → user `onChange`/`onBlur` invoked twice | Critical | `number-input.tsx:47, 49-55` | Fix |
| `number-input.tsx` | ⚠️ smell | `{...field}` spread then overridden by manual handlers; fragile | Important | `number-input.tsx:93-101` | Fix |
| `number-input.tsx` | ⚠️ smell | `parseFloat(target.value)` loses precision; should use `target.valueAsNumber` | Important | `number-input.tsx:49-55, 119-126` | Fix |
| `search-input.tsx` | ⚠️ smell | Uses `useFormContext` instead of `useInput` (inconsistent); throws if rendered outside form | Important | `search-input.tsx:38-44` | Fix |
| `text-input.tsx` | 🐛 bug | `_validateProp`/`_formatProp` destructures dead (full `props` still passed to `useInput`); `{...rest}` spreads `source`, `validate`, etc. to DOM | Critical | `text-input.tsx:42-72` | Fix |
| `text-input.tsx` | ⚠️ smell | `type` default missing; upstream sets `type: 'text'` explicitly in `useInput` | Important | `text-input.tsx:53` | Fix |
| `input-helper-text.tsx` | ⚠️ smell | Renders `null` when no text; layout jumps when error appears | Important | `input-helper-text.tsx:14-16` | Fix |
| `input-helper-text.tsx` | 📝 note | Doesn't accept `error` prop (split from `FormError`); easy to miscompose | Minor | `input-helper-text.tsx:11` | Doc |
| `simple-form-iterator.tsx` | 📝 note | `<TooltipProvider>` per button; perf cost on long arrays | Minor | `simple-form-iterator.tsx:283-300, 403-415, 440-461` | Fix |

### Batch C notes
- `number-input` and `date-time-input` are the riskiest files: silent data corruption on clear, and crash on clear, respectively.
- `text-input` `{...rest}` leakage causes React dev warnings on every render.
- File input's blob URL leak is inherited from upstream but worth fixing here.

---

## §4. Batch D — Choice / Reference Inputs (8 components)

### Issues found

| Component | Status | Issue | Severity | File:Line | Recommendation |
|---|---|---|---|---|---|
| `autocomplete-input.tsx` | 🐛 bug | No debounce on `setFilters`; hits dataProvider per keystroke + late responses clobber newer ones | Critical | `autocomplete-input.tsx:243-253` | Fix |
| `autocomplete-array-input.tsx` | 🐛 bug | Same: no debounce | Critical | `autocomplete-array-input.tsx:199-209` | Fix |
| `autocomplete-input.tsx` | 🐛 bug | Strict `===` id comparison: numeric id vs URL-string id silently breaks selection | Critical | `autocomplete-input.tsx:130-132` | Fix |
| `autocomplete-array-input.tsx` | 🐛 bug | Same coercion bug across `includes`/`filter` | Critical | `autocomplete-array-input.tsx:107, 127, 130` | Fix |
| `autocomplete-array-input.tsx` | 🐛 bug | `field.value` assumed array; crashes when `undefined` | Critical | `autocomplete-array-input.tsx:107, 116, 127, 130, 242-245` | Fix |
| `autocomplete-array-input.tsx` | ⚠️ smell | Selection-on-blur race: `onBlur` closes listbox before `CommandItem.onSelect` runs | Important | `autocomplete-array-input.tsx:210-211` | Fix |
| `autocomplete-input.tsx` | ⚠️ smell | `value={getChoiceValue(choice)}` raw id; cmdk stringifies but loses fidelity. Trigger missing `aria-controls` | Important | `autocomplete-input.tsx:269, 222-227` | Fix |
| `autocomplete-input.tsx` | ⚠️ smell | Hardcoded English `"No matching item found"`; no loading state | Important | `autocomplete-input.tsx:256` | Fix |
| `autocomplete-array-input.tsx` | ⚠️ smell | Same: no `CommandEmpty`, no loading | Important | `autocomplete-array-input.tsx:218-256` | Fix |
| `autocomplete-input.tsx` | 📝 note | `filterValue` not reset after `create` dialog cancel | Minor | `autocomplete-input.tsx:155-179, 198-201` | Fix |
| `select-input.tsx` | 🐛 bug | `.toString()` on value + strict `===` find → submits `"3"` instead of `3` (string instead of number) | Critical | `select-input.tsx:178-191, 270, 298` | Fix |
| `select-input.tsx` | 📝 note | `createItem` may be `null`/`undefined` pushed into `finalChoices` | Minor | `select-input.tsx:233-237, 290-308` | Fix |
| `select-input.tsx` | ⚠️ smell | No `<FormError />` under SelectInput | Important | `select-input.tsx:312-313` | Fix |
| `select-input.tsx` | ⚠️ smell | Reset button is `<div role="button">` with no keyboard handler | Important | `select-input.tsx:280-287` | Fix |
| `radio-button-group-input.tsx` | 🐛 bug | `RadioGroupItem` requires string `value` but `getChoiceValue` returns raw id; selection lost for numeric ids | Critical | `radio-button-group-input.tsx:140-152` | Fix |
| `radio-button-group-input.tsx` | 📝 note | Reads `disabled`/`readOnly` from props instead of `field.disabled`/`field.readOnly` | Minor | `radio-button-group-input.tsx:143, 147` | Fix |
| `radio-button-group-input.tsx` | ⚠️ smell | Spreads `...rest` onto `RadioGroup`; InputProps leak as DOM attrs | Important | `radio-button-group-input.tsx:139` | Fix |
| `reference-array-input.tsx` | 📝 note | No `validate` guard (`<ReferenceInput>` has one) | Minor | `reference-array-input.tsx:33-50` | Fix |
| `reference-array-input.tsx` | ⚠️ smell | No `Offline`/`error` UI on fetch failure | Important | `reference-array-input.tsx:46-58` | Fix |
| `array-input.tsx` | 📝 note | Spreads `props` not `rest` to `<ArrayInputBase>`; double `validate` | Minor | `array-input.tsx:92` | Fix |
| `text-array-input.tsx` | ⚠️ smell | Auto-commit-on-blur silently swallows mid-edit text | Important | `text-array-input.tsx:163-168` | Fix |
| `text-array-input.tsx` | 📝 note | Duplicates allowed silently | Minor | `text-array-input.tsx:83-89` | Optional |
| `text-array-input.tsx` | 📝 note | No `Array.isArray` guard on `field.value` | Minor | `text-array-input.tsx:81, 131` | Fix |

### Clean components
- `reference-input.tsx`

### Batch D notes
- **Systemic id-type coercion** is the dominant bug — 4 components compare ids strictly. Recommend a shared `areIdsEqual` helper.
- Both autocomplete inputs lack debounce → server hammered + race conditions.
- Cmdk integration has consistent ARIA wiring gaps (no `aria-controls` on triggers).

---

## §5. Batch E — List / DataTable / Filter (8 components)

### Issues found

| Component | Status | Issue | Severity | File:Line | Recommendation |
|---|---|---|---|---|---|
| `data-table.tsx` | 🐛 bug | Empty state replaces table wrapper → `ColumnsSelector`/`BulkActionsToolbar` never mount | Critical | `data-table.tsx:108-137` | Fix |
| `data-table.tsx` | 🐛 bug | Select-all `onCheckedChange` typed `boolean`; receives `"indeterminate"` → falls into "select all" branch unconditionally; `isRowSelectable` not honored | Critical | `data-table.tsx:148-160` | Fix |
| `data-table.tsx` | 🐛 bug | Row checkbox double-fires: cell `onClick` + checkbox `onClick` both call `handleToggle` | Critical | `data-table.tsx:271-277` | Fix |
| `data-table.tsx` | ⚠️ smell | Shift-click range selection driven by cell click, not checkbox | Important | `data-table.tsx:235-242` | Fix |
| `data-table.tsx` | ⚠️ smell | Brittle `headerClassName?.includes("text-right")` string sniff | Important | `data-table.tsx:392, 406` | Fix |
| `data-table.tsx` | ⚠️ smell | `loading={null}` hardcoded → blank page during initial fetch | Important | `data-table.tsx:111` | Fix |
| `data-table.tsx` | 📝 note | `useStore` defaultHiddenColumns assumes always returns default (no `?? []`) | Minor | `data-table.tsx:356-357, 446-448` | Fix |
| `data-table.tsx` | 📝 note | `DataTableColumn` switch missing default case | Minor | `data-table.tsx:309-318` | Fix |
| `data-table.tsx` | 📝 note | `hiddenColumns.includes(source!)` — label-only columns always shown | Minor | `data-table.tsx:357, 448` | Fix |
| `data-table.tsx` | ⚠️ smell | Select-all and row checkboxes lack `aria-label` | Important | `data-table.tsx:169-178, 273-276` | Fix |
| `data-table.tsx` | ⚠️ smell | Header sort lacks `aria-sort` on `<TableHead>` | Important | `data-table.tsx:380-419` | Fix |
| `bulk-actions-toolbar.tsx` | 📝 note | `Translate` missing `_:` fallback | Minor | `bulk-actions-toolbar.tsx:74-79` | Fix |
| `bulk-actions-toolbar.tsx` | 📝 note | Unselect button has no `aria-label` | Minor | `bulk-actions-toolbar.tsx:65-72` | Fix |
| `field-toggle.tsx` | ⚠️ smell | `dropIndex.current` can be `null` but `!`-assertion lies; downstream coerces to 0 → silent move to position 0 | Important | `field-toggle.tsx:100-101` | Fix |
| `field-toggle.tsx` | 📝 note | Drag listener may leak if drag cancelled | Minor | `field-toggle.tsx:24-29` | Fix |
| `field-toggle.tsx` | 📝 note | `switch_${index}` ids collide if reused | Minor | `field-toggle.tsx:134-138` | Fix |
| `filter-form.tsx` | 📝 note | Throw inside `useEffect` swallowed by React | Minor | `filter-form.tsx:46-60` | Fix |
| `filter-form.tsx` | 📝 note | Dead MUI `size="small"` prop passed through | Minor | `filter-form.tsx:159` | Remove |
| `filter-form.tsx` | 📝 note | `createElement` instead of `cloneElement`; loses original key/ref | Minor | `filter-form.tsx:155-163` | Fix |
| `list.tsx` | 📝 note | `render` prop in `ListViewProps` but never read | Minor | `list.tsx:101-165` | Fix or remove |
| `list.tsx` | 📝 note | `FilterForm` always renders even when no filters | Minor | `list.tsx:158` | Fix |
| `list.tsx` | 📝 note | No empty-state `<Empty>` integration (DataTable handles it inline) | Minor | `list.tsx:130-165` | Optional (Empty added in Phase 1) |
| `list-guesser.tsx` | ⚠️ smell | `process.env.NODE_ENV` in Vite — fragile; use `import.meta.env.DEV` | Important | `list-guesser.tsx:97` | Fix |
| `list-pagination.tsx` | 🐛 bug | `total === 0` → `count = 1` (mis-renders); upstream returns null | Critical | `list-pagination.tsx:63` | Fix |
| `list-pagination.tsx` | 🐛 bug | `pageEnd` becomes `undefined` for partial pagination | Critical | `list-pagination.tsx:59, 141-145` | Fix |
| `list-pagination.tsx` | 🐛 bug | Partial pagination renders no page numbers — only prev/next chevrons work | Critical | `list-pagination.tsx:63-98` | Fix |
| `list-pagination.tsx` | 📝 note | `className` template literal can output `... undefined` | Minor | `list-pagination.tsx:108-109` | Fix |
| `list-pagination.tsx` | ⚠️ smell | Disabled prev/next uses different DOM elements; tab order may skip | Important | `list-pagination.tsx:152-172, 237-260` | Fix |
| `list-pagination.tsx` | 📝 note | Uses `<a href="#">` for page links; should be `<button>` | Minor | `list-pagination.tsx:151-241` | Fix |
| `saved-queries.tsx` | 🐛 bug | `removeQuery` with `findIndex === -1` corrupts the saved queries list | Critical | `saved-queries.tsx:134-141` | Fix |
| `saved-queries.tsx` | 📝 note | Dialog `onOpenChange` ignores `open` arg | Minor | `saved-queries.tsx:70, 145` | Fix |
| `saved-queries.tsx` | 📝 note | `queryName` not reset on Esc/backdrop close | Minor | `saved-queries.tsx:66-67` | Fix |
| `saved-queries.tsx` | 📝 note | Save button outside `<form>` element; submission paths diverge | Minor | `saved-queries.tsx:79-99` | Fix |
| `saved-queries.tsx` | 📝 note | No `SavedQueriesList` sidebar component (only dialogs implemented) | Minor | `saved-queries.tsx` | Feature gap |

### Batch E notes
- `data-table.tsx` is the riskiest file: 4 critical bugs around empty state + selection.
- `list-pagination.tsx` has cascading partial-pagination bugs (3 critical).
- `saved-queries.tsx` has a list-corruption bug in `removeQuery`.
- `process.env` usage is unsafe in Vite contexts.

---

## §6. Batch F — Detail / Form / Toolbar (10 components, excluding Phase 1 touched files)

### Issues found

| Component | Status | Issue | Severity | File:Line | Recommendation |
|---|---|---|---|---|---|
| `edit.tsx` | 🐛 bug | `return null` on `!context.record` swallows 404s; blank page | Critical | `edit.tsx:112-114` | Fix |
| `show.tsx` | 🐛 bug | Same: `return null` on missing record; `emptyWhileLoading` declared but never threaded through | Critical | `show.tsx:111-146, 74-78` | Fix |
| `edit.tsx` | ⚠️ smell | `actions={false}` not honored — defaults render anyway | Important | `edit.tsx:142-147` | Fix |
| `show.tsx` | ⚠️ smell | Same: `actions={false}` ignored | Important | `show.tsx:174-178` | Fix |
| `show.tsx` | 📝 note | `error` prop from base controller not forwarded | Minor | `show.tsx:53-83` | Optional |
| `edit-guesser.tsx` | 🐛 bug | Drops all base-controller props (`id`, `mutationMode`, `redirect`, etc.); `<EditGuesser mutationMode="optimistic">` silently no-ops | Critical | `edit-guesser.tsx:41-47` | Fix |
| `show-guesser.tsx` | 🐛 bug | Same: drops `id`, `resource`, `queryOptions`, `disableAuthentication` | Critical | `show-guesser.tsx:35-41` | Fix |
| `edit-guesser.tsx` | 📝 note | Missing `disableAuthentication` forward | Minor | `edit-guesser.tsx:43` | Fix |
| `tabbed-show-layout.tsx` | 📝 note | `OptionalRecordContextProvider` fed only `recordProp`; nested fields may miss record on splat route | Minor | `tabbed-show-layout.tsx:129-138` | Verify |
| `tabbed-show-layout.tsx` | ⚠️ smell | `<Labeled key={undefined}>` collisions; trailing divider after last field | Minor | `tabbed-show-layout.tsx:224-234` | Fix |
| `tabbed-show-layout.tsx` | ⚠️ smell | Duplicate `role="tabpanel"`/`aria-labelledby` between manual and Radix wiring | Important | `tabbed-show-layout.tsx:217-223, 290-293` | Fix |
| `confirm.tsx` | ⚠️ smell | No `autoFocus` on Confirm button → Enter cancels destructive action | Important | `confirm.tsx:132-140` | Fix |
| `confirm.tsx` | 📝 note | `CancelIcon = AlertCircle` (red error icon) on Cancel; semantic mismatch | Minor | `confirm.tsx:79` | Consider |
| `confirm.tsx` | 📝 note | `onClose: () => void` should be `MouseEventHandler` | Minor | `confirm.tsx:103, 157` | Fix |
| `simple-form.tsx` | 📝 note | `defaultFormToolbar = <FormToolbar />` module-level singleton | Note | `simple-form.tsx:95` | OK |
| `toolbar.tsx` | 📝 note | Default DeleteButton uses `variant="ghost"`; differs from upstream destructive styling | Note | `toolbar.tsx:58` | Doc |
| `labeled.tsx` | 📝 note | `showLabel` detection breaks through memo/forwardRef wrappers | Minor | `labeled.tsx:50-52` | Doc |
| `labeled.tsx` | 📝 note | Phantom wrapper when neither `label` nor `source` resolves | Minor | `labeled.tsx:60-70` | Fix |
| `simple-show-layout.tsx` | ⚠️ smell | No `useRecordContext` early-return; throws inside fields if rendered outside Show | Important | `simple-show-layout.tsx:33-43` | Fix |
| `simple-show-layout.tsx` | 📝 note | No `record` prop; only context-based | Minor | `simple-show-layout.tsx:45-48` | Fix |
| `show.tsx`/`edit.tsx` | 📝 note | `render` prop not threaded into views; chrome skipped | Minor | `show.tsx:66-83`, `edit.tsx:50-68` | Fix or doc |
| `edit-guesser.tsx`/`show-guesser.tsx` | 📝 note | `process.env.NODE_ENV` in Vite | Note | `edit-guesser.tsx:58`, `show-guesser.tsx:52` | Fix |
| `show-guesser.tsx` | 📝 note | `getRepresentation()` called twice | Note | `show-guesser.tsx:70, 100` | Fix |
| `tabbed-show-layout.tsx` | 📝 note | `tabsList` wrapped in `<Routes>` re-mounts on route change | Note | `tabbed-show-layout.tsx:247-253` | Fix |

### Batch F notes
- Top issue: `Edit`/`Show` silent 404 handling — most user-visible regression.
- `EditGuesser`/`ShowGuesser` drop all base-controller props silently.
- `Confirm` lacks `autoFocus` — destructive UX hazard.

---

## §7. Batch G — Layout / Auth / Notification / Misc (10 components, layout excluded)

### Issues found

| Component | Status | Issue | Severity | File:Line | Recommendation |
|---|---|---|---|---|---|
| `notification.tsx` | 🐛 bug | No one-at-a-time guard; fast `notify()` calls drain queue in one frame | Critical | `notification.tsx:40-101` | Fix |
| `notification.tsx` | 🐛 bug | `autoHideDuration === 0` passed to sonner as 0 (auto-dismiss now) instead of "never" | Critical | `notification.tsx:85-86` | Fix |
| `notification.tsx` | 🐛 bug | `mutation({ isUndo: false })` fires from both `onDismiss` and `onAutoClose` → double-fires after clicking Undo | Critical | `notification.tsx:61-75, 96-97` | Fix |
| `notification.tsx` | ⚠️ smell | `translate` in effect deps; would re-fire on locale change | Important | `notification.tsx:101` | Fix |
| `notification.tsx` | ⚠️ a11y | No `aria-live` override per notification type | Important | `notification.tsx:108-117` | Fix |
| `notification.tsx` | 📝 note | Queue doesn't clear on logout — cross-session leakage | Minor | `notification.tsx` | Fix |
| `notification.tsx` | 📝 note | `richColors` / `closeButton` / `position` not user-overridable due to prop spread order | Minor | `notification.tsx:111` | Fix |
| `login-page.tsx` | 🐛 bug | Hardcoded demo credentials in production library default: `"Try janedoe@acme.com / password"` | Critical | `login-page.tsx:87-89` | Fix |
| `login-page.tsx` | ⚠️ smell | Missing `autoComplete="email"`/`current-password` | Important | `login-page.tsx:92-103` | Fix |
| `login-page.tsx` | ⚠️ smell | No `autoFocus` on first input | Important | `login-page.tsx:92-97` | Fix |
| `login-page.tsx` | ⚠️ smell | Submit button shows no loading indicator (only `disabled`) | Important | `login-page.tsx:104-110` | Fix |
| `login-page.tsx` | 📝 note | No `useCheckAuth` redirect for already-authenticated users | Minor | `login-page.tsx:17-23` | Fix |
| `authentication.tsx` (`AuthError`) | 📝 note | Misleading `(error as Error) ? (error as Error).message : undefined` truthy cast | Minor | `authentication.tsx:30` | Fix |
| `authentication.tsx` | 📝 note | `role="alert"` on `<h1>` may double-announce via aria-live | Minor | `authentication.tsx:74` | Fix |
| `error.tsx` | ⚠️ smell | `<Translate i18nKey={errorMessage}>` — error messages with dots get resolved as i18n keys | Important | `error.tsx:53` | Fix |
| `error.tsx` | ⚠️ smell | Production hides error entirely; consider preserving React 19 `error.digest` | Important | `error.tsx:42-44` | Optional |
| `error.tsx` | 📝 note | "Shadcn Enterprise Edition" link points to marketing root | Minor | `error.tsx:87-93` | Fix or remove |
| `error.tsx` | 📝 note | `text-xls` (typo for `text-xs`) — invalid Tailwind class | Minor | `error.tsx:56` | Fix |
| `error.tsx` | 📝 note | `process.env.NODE_ENV` in Vite | Minor | `error.tsx:45` | Fix |
| `not-found.tsx` | 📝 note | `useAuthenticated()` redirects on 404 page — risk of redirect loops | Minor | `not-found.tsx:10` | Doc |
| `loading.tsx` | ⚠️ a11y | No `role="status"` / `aria-live="polite"` / `aria-busy="true"` | Important | `loading.tsx:21-32` | Fix |
| `loading.tsx` | 📝 note | Invalid Tailwind classes: `width-9 height-9 color-muted pt-1 pb-1` | Minor | `loading.tsx:23-25` | Fix |
| `loading.tsx` | 📝 note | Renamed `timeout` → `delay`; parity loss with upstream | Minor | `loading.tsx:18` | Doc or restore |
| `spinner.tsx` | 📝 note | `show: false` keeps spinner spinning under `hidden` class | Minor | `spinner.tsx:42-46` | Fix |
| `spinner.tsx` | 📝 note | No `role="status"` / `aria-label` | Minor | `spinner.tsx:42-46` | Fix |
| `user-menu.tsx` | ⚠️ a11y | `<AvatarImage role="presentation">` strips alt; trigger has no accessible name | Important | `user-menu.tsx:60` | Fix |
| `user-menu.tsx` | ⚠️ a11y | Trigger `<Button>` has no `aria-label` | Important | `user-menu.tsx:53-63` | Fix |
| `user-menu.tsx` | 📝 note | `logout()` errors silently swallowed | Minor | `user-menu.tsx:76` | Fix |
| `user-menu.tsx` | 📝 note | `useGetIdentity` fires query even when `!authProvider` | Minor | `user-menu.tsx:35-49` | Fix |
| `user-menu.tsx` | 📝 note | `forceMount` keeps menu mounted when closed | Minor | `user-menu.tsx:65` | Optional |
| `ready.tsx` | 📝 note | Hardcoded English copy | Minor | `ready.tsx:25-32` | Optional |
| `ready.tsx` | 📝 note | Hardcoded dark gradient won't adapt to dark mode | Minor | `ready.tsx:20-23` | Optional |

### Clean components
- `guesser-empty.tsx`

### Batch G notes
- **`notification.tsx` is the highest-risk file in this batch.** 3 critical bugs around undoable mutation handling. Worth a dedicated fix pass.
- **`login-page.tsx` ships demo credentials** in the library default — should be a prop or stripped.
- **A11y gaps cluster** around `user-menu`, `loading`, `spinner` (missing `aria-label`, `role="status"`).
- **Invalid Tailwind classes** silently dead in multiple files.

---

## Suggested fix groupings (for triage)

If the user picks subsets to fix before Phase 2, these natural groupings minimize cross-file thrash:

### Group 1: Security + data integrity (5 fixes, ~half day)
- `url-field.tsx` — scheme sanitization
- `number-input.tsx` — clear writes `null`, not `0`; remove double-invoke
- `select-input.tsx` — preserve numeric id type
- `autocomplete-input/array-input` — id coercion + `?? []` guard + debounce
- `radio-button-group-input` — string-coerce ids for Radix

### Group 2: Crash-on-edge-case fixes (6 fixes, ~half day)
- `date-time-input.tsx` — empty `Date('')` guard
- `select-all-button.tsx` — derive `isSelected` from props each render
- `edit-button`/`show-button` — `null` when no record + `useCanAccess`
- `record-field.tsx` — correct `useRecordContext` param
- `reference-many-count.tsx` — `lodash/get` + error UI
- `saved-queries.tsx` — `removeQuery` -1 guard

### Group 3: DataTable bug cluster (4 fixes, ~half day)
- Empty state inside wrapper (not replacing)
- `boolean | "indeterminate"` handling on select-all
- Row checkbox single-fire
- Loading skeleton instead of `null`

### Group 4: Pagination rewrite (1 fix, ~1 day)
- `list-pagination.tsx` — total=0 case, partial pagination support, `<button>` semantics

### Group 5: Detail view 404 handling (3 fixes, ~2-3 hours)
- `edit.tsx` / `show.tsx` — keep chrome, render empty card
- `edit-guesser` / `show-guesser` — forward base props

### Group 6: Notification overhaul (1 fix, ~half day)
- One-at-a-time queue guard
- `autoHideDuration === 0` handling
- Undo double-fire fix
- Clear queue on logout

### Group 7: Login + auth polish (~1-2 hours)
- Remove demo creds
- Add `autoFocus`, `autoComplete`, loading indicator
- Optional: `useCheckAuth` redirect

### Group 8: A11y sweep (~half day)
- Add `aria-label` to icon-only buttons (`refresh`, `locales`, `user-menu`, bulk unselect)
- Add `role="status"` to `loading`/`spinner`
- Fix `tabbed-show-layout` ARIA duplication
- Add `aria-pressed` to `toggle-filter-button`

### Group 9: TextInput rest-prop sanitization (~1 hour)
- Add `sanitizeInputRestProps` helper, apply to `text-input`, `radio-button-group-input`, `select-array-input`

### Group 10: Tailwind class fixes (~30 min)
- Fix dead classes in `loading.tsx`, `error.tsx`, `authentication.tsx`

**Total if all groups taken:** ~4-5 days of focused work. Likely 2-3 days with subagent parallelism.

---

## Recommendation

Before starting Phase 2, suggest fixing at minimum **Groups 1-3** (security + crashes + DataTable). These cover the highest-impact issues and would protect Phase 2 work from inheriting silent bugs.

Groups 4-10 can be batched as a "Phase 1.6 polish" pass either before or alongside Phase 2.
