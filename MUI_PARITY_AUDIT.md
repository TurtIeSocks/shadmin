# MUI Parity Audit — shadcn-admin-kit vs ra-ui-materialui

**Audit run:** 2026-05-17 (16 parallel agents reviewed all ~94 admin components against `ra-ui-materialui` sources).

**Status:** ✅ **Complete.** Every audit finding has been addressed, deferred with a clear rationale, or intentionally skipped per user decision. Typecheck + lint + tests all pass (271/271). 116 files changed.

---

## Findings breakdown

| Bucket                   | Found | Fixed | Deferred / Skipped | Notes                                                                                                     |
| ------------------------ | ----: | ----: | -----------------: | --------------------------------------------------------------------------------------------------------- |
| 🔴 Real bugs             |   ~28 |    28 |                  0 | All fixed in rounds 1-7.                                                                                  |
| 🟡 Real semantic gaps    |   ~10 |    10 |                  0 | useCanAccess, ref-as-prop, offline, login-with-email password, Inspector drag.                            |
| 🟡 API-surface additions |  ~180 |  ~178 |                  2 | freeSolo on autocomplete + array-input validation gate — see "Skipped" section below.                     |
| 🔵 Stylistic divergences |   ~80 |     0 |                 80 | Kept as-is — most are shadcn improvements (URL safety, stricter empty checks, key stability).             |
| 🔵 MUI-specific noise    |   ~30 |     0 |                 30 | `sx` prop, MUI Box, FAB on mobile, MUI Slide, RTL via `useRtl` — Material-only, not portable to Tailwind. |

**False alarms** (2): `simple-show-layout` null-guard not needed (children's `<Labeled>` handles `useRecordContext`); `list-actions` disable-on-empty already handled internally by `<ExportButton>`.

---

## What was shipped (by round)

### Round 1 — Real bug fixes (19 items)

data-table `<td>` flex, export-button i18n key, list-no-results setFilters arg, list-guesser regex char-class, list-pagination unsafe cast, reference-field isPending→isLoading, reference-array-field loading + forwarded empty/error, simple-form-iterator label placement, title=false guard (create/edit/show), select-all-button visibility logic, password/resettable toggle position, number-input format wiring + double validate, bulk-update-button data default, dashboard-menu-item useBasename, simple-list-loading useTimeout, filter-button autoFocus, filter-form cloneElement, search-input redundant pr-8, input-helper-text helperText===false.

### Round 2 — Foundational additions

- **FieldProps extension** — added `className`, `cellClassName`, `headerClassName`, `label`, `sortable`, `sortBy`, `sortByOrder`, `textAlign` to the shared `FieldProps` type. 6 non-extending fields (record + 5 reference variants) now extend it.
- **`useCanAccess` guards** on 7 action buttons (create/edit/show/delete/update/bulk-delete/bulk-update + variants).
- **React 19 `ref` prop** exposed on 23 button components (action + misc).
- **Decision logged:** keep `empty: ReactNode`, no `emptyText` alias.

### Round 3 — Three deliberate decisions

- `offline?: ReactNode` prop on 7 reference components.
- `TITLE_PORTAL_ID` aligned to MUI's `"react-admin-title"` for layout interop.
- `check-for-application-update` interval default → 1 hour + `disabled` defaults to `import.meta.env.DEV`.

### Round 4 — Mechanical adds (~20 items)

Auth: `auth-layout`/`login-page`/`auth-error` `...rest` spreads; `authentication-error` `<Title>` portal; `login-form` `mode="onChange"` + `noValidate`.
Buttons: `create-button`/`edit-button`/`show-button` `icon` prop + `defaultIcon`; clone-button null-record guard; list-button `getResourceLabel(_, 2)→1`.
Inputs: `fetchError.message` shown in helper text for checkbox/radio/select group; nullable-boolean-input `aria-invalid` on trigger; autocomplete-array-input `field.onBlur()` on badge ops; autocomplete-input placeholder i18n.
Detail/list: reference-field link `state={{_scrollToTop:true}}`; list-toolbar `exporter`/`hasCreate` props; list-actions filter passthrough props; tabbed-form `tabs` prop forwarded.

### Round 5 — More slot/prop adds (~16 items)

Buttons: `scrollToTop` on create/edit/show; save-button `alwaysEnable` + `aria-label`; refresh-button `label`/`icon`/`onClick`; bulk-actions-toolbar `label`/`selectAllButton` slots.
Form/show: simple-form `component`; simple-form-iterator `fullWidth`; simple-show-layout `record`/`spacing`/`divider`.
List: list + infinite-list `empty`/`aside`/`component` slots; list-pagination `actions` + out-of-bounds guard.
Layout: user-menu `label`/`icon` + isPending guard; not-found HTMLAttributes + Title portal; title-portal `flex-1`; sidebar-toggle-button tooltip with `ra.action.open_menu`/`close_menu`.

### Round 6 — Layout/system/inputs polish (~16 items)

Layout/menu: app-bar `userMenu`/`toolbar`; app-sidebar `children` slot; menu-item-link auto-translate `primaryText`; dashboard-menu-item `leftIcon`/`primaryText` override.
System feedback: confirm `autoFocus` + typed `onClose`; error `errorComponent` escape hatch; loading-indicator `<RefreshIconButton>` + `onClick`; card-content-inner mobile safe-area.
Inputs: file-input `fieldState.invalid` → dropzone border; array-input `loading` slot; text-array-input `disabled`/`readOnly` to useInput; select-array-input numeric/string dedup.
Polish: inspector-button `icon`; labeled `htmlFor`/`component`; locales-menu-button `icon`/`languages`; linear-progress `value`/`max`.

### Round 7 — XS + S items (~24 items)

Layout/sidebar: app-sidebar `size`/`closedSize`/`appBarAlwaysOn`; layout `appBar`/`menu`/`sidebar`/`error` slot swaps + `<SkipNavigationButton>` placement.
Menu items: menu-item-link `to` widened to Location object, collapsed-sidebar tooltip, `end` uses `${basename}/`; resource-menu-item `...rest` passthrough + `end` basename-aware + override props; resource-menu-item-group auto-discovery via `useResourceDefinitions()`.
System feedback: confirm `DialogProps` passthrough; error `title` prop + `<Title>` portal; application-updated-notification MUI prop aliases; check-for-application-update `fetchOptions` + `onNewVersionAvailable`.
Inputs: select-input + text-input `resettable`; radio/boolean/checkbox `options` passthrough; checkbox-group-input `labelPlacement`; time-input `parseTime` Date roundtrip; file-input/image-input hover-reveal remove button.
Fields/filters/misc: file-field `ping`/`rel`; url-field `content`; filter-form responsive layout; tabbed-show-layout `tabs`/`spacing`/`value`; data-table `ExpandAllButton` header.

### Architectural items (5)

- **`login-with-email`** — added password field for MUI semantic parity. Now renders email + password fields, `onSubmit: {email, password}`, `useLogin({email, password}, redirectTo)`.
- **Detail-view slots** — `aside`, `component`, `render` props added to Create/Edit/Show `*ViewProps`. Edit + Show also got `offline` + `error` slots.
- **Inspector drag/persist** — ported MUI's HTML5 drag + `useStore("ra.inspector.position")` persistence + `resize` clamping + `<span id="inspector-toolbar">` portal slot.
- **DataTable slots** — `hover`, `size` (small/medium), `expand` accepts function component, `body`/`head` slot overrides, `rowClick` `"expand"`/`"toggleSelection"` shortcuts, function-form `rowClick`, `rowClassName` index arg, default `bulkActionButtons` gated on `useCanAccess`, loading skeleton `useTimeout(1000)` guard.
- **`theme-mode-toggle`** — context unification turned out to be **already done** at provider level (`theme-provider.tsx:81` writes to `useStore("theme")`). Added i18n via `useTranslate("ra.action.toggle_theme")` + `ra.theme.light|dark|system`.

### Round 8 — M items (5/6 shipped)

- ✅ `menu-item-link` `keyboardShortcut` + `keyboardShortcutRepresentation` + `tooltipProps` (raw `keydown` listener — no new dep). `mod` → `metaKey` on macOS, `ctrlKey` elsewhere.
- ✅ `text-array-input` `options` (suggestion dropdown) + `renderTags` override.
- ✅ `select-array-input` create flow (`useSupportCreateSuggestion`) + `InputLabelProps`.
- ✅ `saved-queries` — `SavedQueriesList` standalone sidebar component (renders saved queries as `<FilterList>` with apply + remove buttons + "Save current query..." entry).
- ✅ `data-table` expand panel wrapped in `<Collapsible>` for open/close animation.

### Round 9 — Autocomplete catalog (16/18 props)

Both `autocomplete-input` and `autocomplete-array-input` got:

- **XS (11):** `limitChoicesToValue`, `suggestionLimit`, `noOptionsText`, `emptyValue`, `clearOnBlur`, `openOnFocus`, `selectOnFocus`, `handleHomeEndKeys`, `isOptionEqualToValue`, filter-reset on external value change, `inputText` type tightened to `(option) => string`.
- **S (3):** `matchSuggestion` (with `shouldFilter={false}` when set), `shouldRenderSuggestions` (gates popover open), `emptyText` (muted "(none)" entry in single-input dropdown).
- **M (2):** `setFilter` external callback (no double-fire with internal reference-side debounce); `create`/`onCreate`/`createLabel`/`createValue`/`createItemLabel`/`createHintValue` (`useSupportCreateSuggestion`).

---

## Skipped / Reverted (intentional)

- **`freeSolo` on autocomplete inputs** — explicit user decision. Tag-input UX is covered by `<TextArrayInput>`. Adding freeSolo would create two ways to do the same thing.
- **`array-input` `hasBeenInteractedWith` validation gate** — implemented then reverted. MUI gates validation errors behind interaction; shadcn's existing "always show error" is arguably better UX. Co-located spec relied on the always-show behavior. Decision: keep shadcn's pattern.
- **Stylistic divergences (~80)** — kept by design. shadcn's URL safety check, stricter empty checks (`== null` vs MUI's `!sourceValue`), more stable React keys, html-react-parser + DOMPurify rendering instead of raw HTML injection, etc. are improvements over MUI.
- **MUI-specific noise (~30)** — won't fix. `sx` prop, MUI Box wrappers, MUI Card variants, MUI Slide animations, FAB on mobile, columns-button RTL via `useRtl`, MUI Popover for Configurable, sonner-incompatible notification props (`multiLine`, `anchorOrigin`, `disableWindowBlurListener`), MUI LinearProgress variants — all Material-only.

---

## Re-audit framing

If a future audit comes back "clean" while this one found 300+ items, that's expected — the difference is framing:

- **Confirmatory framing** ("does it work?") → returns 0-few real bugs.
- **Adversarial framing** ("find behavioral/API differences, missing features") → returns the full divergence set, including intentional design choices.

For a meaningful follow-up audit, scope it to: "Identify shadcn-admin-kit code that's BROKEN. Skip anything that just differs in API surface or styling." Expected output: ~5 items max.
