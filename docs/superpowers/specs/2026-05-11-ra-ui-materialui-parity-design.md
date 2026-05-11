# ra-ui-materialui Parity Design

**Status:** Approved · **Date:** 2026-05-11 · **Owner:** shadcn-admin-kit · **Branch:** `full-claude`

## 1. Goal

Bring `shadcn-admin-kit` to 1:1 component parity with the upstream `ra-ui-materialui` package (`/Users/rin/GitHub/react-admin/packages/ra-ui-materialui`). For every public export in `ra-ui-materialui`, there should be a matching component in `shadcn-admin-kit` with the same name and a compatible prop API, implemented on top of shadcn/ui primitives and Tailwind v4.

`ra-core` is consumed as-is (no upstream changes). The work is purely a UI port.

## 2. Non-goals

- No changes to `ra-core`, data providers, auth providers, or i18n providers.
- No Material UI runtime dependency.
- No backward-incompatible changes to existing public components in `shadcn-admin-kit`.
- No 1:1 file-name parity for internals — where shadcn-admin-kit consolidates what `ra-ui-materialui` splits across many files (e.g., DataTable internals), we keep the consolidated style.
- No new providers, no new data layer features.

## 3. Phasing

The spec covers the **full** eventual parity surface. Implementation is split into two phases. Phase 1 is built in this session via subagent-driven development. Phase 2 is deferred to a future session.

- **Phase 1 — core, non-enterprise.** 47 new files plus a layout refactor.
- **Phase 2 — enterprise/advanced.** Translatable fields/inputs, multiple themes, configurable/inspector preferences, OAuth pages, PWA components, miscellaneous helpers.

Between phases, work pauses. Phase 2 starts in a new session with this spec as the source of truth.

## 4. Phase 1 scope (this session)

### 4.1 Buttons — 8 new files + 8 named re-exports

New files under `src/components/admin/`:

| File | Component | Notes |
|---|---|---|
| `clone-button.tsx` | `CloneButton` | Navigates to `create` route prefilled with current record state |
| `list-button.tsx` | `ListButton` | Navigates to the resource's list view |
| `prev-next-buttons.tsx` | `PrevNextButtons` | Navigates between adjacent records in current list scope |
| `save-button.tsx` | `SaveButton` | Form submit button (extracted from existing `toolbar.tsx`); `saving` state, disabled while submitting |
| `refresh-icon-button.tsx` | `RefreshIconButton` | Icon-only refresh — distinct from existing `refresh-button.tsx` |
| `skip-navigation-button.tsx` | `SkipNavigationButton` | A11y skip link to main content |
| `update-button.tsx` | `UpdateButton` | Mutates one record with a fixed payload; supports `mutationMode` prop |
| `bulk-update-button.tsx` | `BulkUpdateButton` | Same for bulk action toolbar context |

Re-exports added as **named exports inside existing files** (no new files):

| Existing file | Add named exports |
|---|---|
| `delete-button.tsx` | `DeleteWithConfirmButton`, `DeleteWithUndoButton` (thin wrappers fixing `mutationMode`) |
| `bulk-delete-button.tsx` | `BulkDeleteWithConfirmButton`, `BulkDeleteWithUndoButton` |
| `update-button.tsx` (new above) | `UpdateWithConfirmButton`, `UpdateWithUndoButton` |
| `bulk-update-button.tsx` (new above) | `BulkUpdateWithConfirmButton`, `BulkUpdateWithUndoButton` |

The consolidated `*-button.tsx` continues to accept `mutationMode: 'pessimistic' | 'optimistic' | 'undoable'`. The `*WithConfirm*` and `*WithUndo*` exports are 4-line wrappers that hard-code that prop, for import-surface parity with `ra-ui-materialui`.

### 4.2 Fields — 6 new files

| File | Component | Behavior |
|---|---|---|
| `chip-field.tsx` | `ChipField` | Renders a single record value as a shadcn `<Badge>` |
| `function-field.tsx` | `FunctionField` | Renders an arbitrary `render(record) => ReactNode`; for ad-hoc display |
| `reference-one-field.tsx` | `ReferenceOneField` | Reverse one-to-one reference via `useGetManyReference` with limit 1 |
| `rich-text-field.tsx` | `RichTextField` | Display-only HTML renderer for fields stored as HTML. Sanitizes input using DOMPurify before render — never renders unsanitized HTML. |
| `text-array-field.tsx` | `TextArrayField` | Array of strings rendered as a chip stack |
| `wrapper-field.tsx` | `WrapperField` | No-op wrapper field used to opt subtrees into field-context behaviors (label, sortability) |

### 4.3 Inputs — 7 new files

| File | Component | Notes |
|---|---|---|
| `checkbox-group-input.tsx` | `CheckboxGroupInput` | Multi-select rendered as checkbox list; `choices` prop |
| `image-input.tsx` | `ImageInput` | Image-specific wrapper around dropzone; accepts `image/*` by default and renders previews |
| `nullable-boolean-input.tsx` | `NullableBooleanInput` | Tri-state (true/false/null) select; pairs with `NullableBooleanField` if added |
| `password-input.tsx` | `PasswordInput` | Password input with visibility toggle |
| `select-array-input.tsx` | `SelectArrayInput` | Multi-select dropdown (distinct from `AutocompleteArrayInput` which is searchable) |
| `time-input.tsx` | `TimeInput` | Time-of-day input (HH:MM); distinct from `DateInput` and `DateTimeInput` |
| `resettable-text-input.tsx` | `ResettableTextInput` | TextInput variant with a clear (×) button — internal building block, also exported for parity |

### 4.4 Filter sidebar family — 6 new files

| File | Component | Behavior |
|---|---|---|
| `filter-list.tsx` | `FilterList` | Collapsible filter section header + body (used in sidebar) |
| `filter-list-item.tsx` | `FilterListItem` | Chip-like toggle that sets a specific filter via `useListContext` |
| `filter-list-section.tsx` | `FilterListSection` | Groups `FilterListItem`s under a labeled heading |
| `filter-live-form.tsx` | `FilterLiveForm` | Form whose inputs update list filters on every change |
| `filter-live-search.tsx` | `FilterLiveSearch` | Debounced text input bound to the `q` (full-text) filter |
| `filter-button.tsx` | `FilterButton` | Toolbar dropdown that toggles which optional inputs appear in the top `FilterForm` (distinct from existing `filter-form.tsx`) |

These coexist with the existing `filter-form.tsx`. Both filter patterns (top-bar form and sidebar chips) are supported.

### 4.5 List variants — 5 new files

| File | Component | Behavior |
|---|---|---|
| `simple-list.tsx` | `SimpleList` | Mobile-friendly list view with `primaryText`/`secondaryText`/`tertiaryText`/`leftAvatar`/`rightIcon` slot props |
| `simple-list-item.tsx` | `SimpleListItem` | Single row used internally by `SimpleList`; also exported |
| `simple-list-loading.tsx` | `SimpleListLoading` | Skeleton loading state for `SimpleList` |
| `infinite-list.tsx` | `InfiniteList` | Drop-in `List` replacement using `useInfiniteGetList`; renders an `InfinitePagination` instead of paginated nav |
| `infinite-pagination.tsx` | `InfinitePagination` | "Load more" + intersection-observer auto-load button |

### 4.6 List utilities — 4 new files

| File | Component | Behavior |
|---|---|---|
| `empty.tsx` | `Empty` | Empty-state placeholder used when list returns 0 records and no filters are active |
| `list-no-results.tsx` | `ListNoResults` | Distinct from `Empty` — shown when filters are active and yield 0 results, with a "clear filters" action |
| `list-actions.tsx` | `ListActions` | Toolbar slot above list — typically `<CreateButton/><ExportButton/>` |
| `list-toolbar.tsx` | `ListToolbar` | Container that pairs `FilterForm` with `ListActions` (consumed by `List`) |

### 4.7 Layout split — 8 new files + refactor of `layout.tsx` and `app-sidebar.tsx`

Today, `layout.tsx` directly composes `SidebarProvider`, `AppSidebar`, an inline header with `LocalesMenuButton`/`ThemeModeToggle`/`RefreshButton`/`UserMenu`, plus Suspense + ErrorBoundary. `app-sidebar.tsx` directly renders the resource list inside the sidebar.

We extract:

| File | Component | Responsibility |
|---|---|---|
| `app-bar.tsx` | `AppBar` | Header row — locales/theme/refresh/user menu, sidebar trigger, breadcrumb anchor. Accepts children to override entirely. |
| `title.tsx` | `Title` | Declarative per-view page title (registers into a portal) |
| `title-portal.tsx` | `TitlePortal` | Portal target — placed inside `AppBar` |
| `menu.tsx` | `Menu` | Sidebar menu container. Default renders one `ResourceMenuItem` per registered resource. Accepts children to override. |
| `resource-menu-item.tsx` | `ResourceMenuItem` | Single resource link with icon + label |
| `menu-item-link.tsx` | `MenuItemLink` | Generic sidebar link for custom routes |
| `dashboard-menu-item.tsx` | `DashboardMenuItem` | Special-case home item shown at top of menu when dashboard exists |
| `top-toolbar.tsx` | `TopToolbar` | Small wrapper used by view-level `actions` slots (Create/Edit/Show) |

Refactor: `layout.tsx` becomes a thin composition of `<SidebarProvider>` → `<AppBar>` + sidebar containing `<Menu>` + content slot + `<Notification>`. `app-sidebar.tsx` continues to exist but delegates its menu rendering to `<Menu>`. Public `Layout` import path unchanged; callers who never overrode internals see no diff.

### 4.8 Misc — 3 new files

| File | Component | Behavior |
|---|---|---|
| `link.tsx` | `Link` | Re-export of ra-core's typed link or thin wrapper that accepts `to={createPath('edit', 'posts', 1)}` |
| `loading-indicator.tsx` | `LoadingIndicator` | Small inline spinner with a11y label; distinct from full-page `loading.tsx` |
| `sidebar-toggle-button.tsx` | `SidebarToggleButton` | Standalone export of the sidebar trigger (currently inline in `layout.tsx`) |

### 4.9 Total Phase 1 deliverables

- **47 new files** across the 8 categories above (8 buttons + 6 fields + 7 inputs + 6 filter + 5 list variants + 4 list utilities + 8 layout + 3 misc = 47)
- **8 named re-exports** added inside existing button files
- **1 refactor** of `layout.tsx` + `app-sidebar.tsx`
- **A `.stories.tsx` file** alongside every new component
- **A docs page** under `docs/src/content/docs/` for every new component, following the Usage → Props → per-prop convention
- **Spec files** only for components with non-trivial logic — concretely: filter family, confirm/undo button variants, bulk update buttons, SimpleList/InfiniteList. Atomic fields/inputs skip tests in Phase 1.
- **Registry entries** added for every new component via `scripts/build_registry.mjs`

## 5. Phase 2 scope (new session, after Phase 1 pause)

These are deferred. Listed for reference so the spec captures full eventual parity.

### 5.1 Translatable
`TranslatableFields`, `TranslatableFieldsTab`, `TranslatableFieldsTabContent`, `TranslatableInputs`, `TranslatableInputsTab`, `TranslatableInputsTabContent`, `TranslatableInputsTabs`.

### 5.2 Themes
Named theme exports `defaultTheme`, `bwTheme`, `nanoTheme`, `radiantTheme`, `houseTheme`. `useTheme` hook. `ThemesContext` + `useThemesContext`. These wrap shadcn's CSS-variable theming so consumers can switch between named palettes at runtime.

### 5.3 Preferences / Inspector
`Configurable`, `Inspector`, `InspectorRoot`, `InspectorButton`, `FieldsSelector`, `SimpleFormConfigurable`. Live-edit panel for column visibility, form layout, etc., backed by `ra-core`'s `useStore`.

### 5.4 Specialized inputs
`InPlaceEditor`, `DatagridInput`, `LoadingInput`.

### 5.5 Auth pages
`AuthCallback`, `AuthError`, `AuthLayout`, `LoginWithEmail`, `LoginForm` (extracted from existing `login-page.tsx`).

### 5.6 PWA
`CheckForApplicationUpdate`, `ApplicationUpdatedNotification`, `Offline`.

### 5.7 Misc
`KeyboardShortcut`, `AccessDenied`, `AuthenticationError`, `PageTitleConfigurable`, `HideOnScroll`, `LinearProgress`, `LoadingPage`, `CardContentInner`, `DeviceTestWrapper`, `Placeholder`, `ReferenceError`, fine-grained `DataTable` internal exports (`DataTableBody`, `DataTableCell`, `DataTableColumn`, `DataTableHead`, `DataTableHeadCell`, `DataTableLoading`, `DataTableNumberColumn`, `DataTableRoot`, `DataTableRow`, `SelectPageCheckbox`, `SelectRowCheckbox`).

## 6. Conventions

Every new component follows the patterns already established in `shadcn-admin-kit`:

1. **Logic from ra-core hooks.** Use `useInput`, `useRecordContext`, `useListContext`, `useEditController`, etc. Never call APIs directly.
2. **UI from shadcn/ui primitives.** Import from `@/components/ui/`. Use `cn()` from `@/lib/utils` for class merging.
3. **Named exports only.** File name = kebab-case of PascalCase component name. No default exports.
4. **JSDoc with `@see` link.** Every public component has a JSDoc block summarizing purpose and a `@see {@link https://marmelab.com/shadcn-admin-kit/docs/<page>/ ... documentation}` link.
5. **Story file co-located.** `foo.stories.tsx` next to `foo.tsx`. Stories cover at minimum a `Basic` export. Storybook is already configured.
6. **Tests imported from stories.** Per `AGENTS.md`: spec files import story exports and render them, rather than setting up wrappers from scratch.
7. **Docs page in `docs/src/content/docs/`.** Markdown with structure: short blurb → Usage example → Props table → per-prop `## \`propName\`` sections describing each.
8. **Registry entry.** Add component to `scripts/build_registry.mjs`'s component list so it's installable via shadcn CLI.

## 7. Architectural details

### 7.1 Layout split design

After the split, `layout.tsx` will look approximately like:

```tsx
export const Layout = (props: CoreLayoutProps) => (
  <SidebarProvider>
    <AppSidebar>
      <DashboardMenuItem />
      <Menu />
    </AppSidebar>
    <main>
      <AppBar />
      <ErrorBoundary fallbackRender={...}>
        <Suspense fallback={<Loading />}>
          {props.children}
        </Suspense>
      </ErrorBoundary>
    </main>
    <Notification />
  </SidebarProvider>
);
```

Each extracted component lives in its own file and is independently overridable: `<Admin layout={MyLayout}>`, or a user-written `MyLayout` that uses `<AppBar>`/`<Menu>` directly.

`AppBar` accepts children. If none provided, it renders the default set (sidebar trigger, breadcrumb anchor, locales menu, theme toggle, refresh, user menu).

`Title` uses a portal pattern: views call `<Title title="Edit Post" />` and the value is portaled into `<TitlePortal />` inside `AppBar`. This avoids prop drilling.

`Menu` reads the resource registry from ra-core context and renders one `ResourceMenuItem` per resource by default. When children are provided, the children replace the default rendering — same composition pattern as upstream.

### 7.2 Filter sidebar design

`FilterList` is a sidebar section component, typically used like:

```tsx
<List aside={<FilterSidebar />}>
  <DataTable>...</DataTable>
</List>

const FilterSidebar = () => (
  <Card>
    <FilterLiveSearch />
    <FilterList label="Status" icon={<StatusIcon />}>
      <FilterListItem label="Published" value={{ status: 'published' }} />
      <FilterListItem label="Draft" value={{ status: 'draft' }} />
    </FilterList>
  </Card>
);
```

`FilterListItem` reads `useListContext()`, computes whether its `value` shape is currently a subset of the active `filterValues`, and renders a toggle. Clicking merges/removes the value from `filterValues`.

`FilterLiveSearch` debounces (default 500ms) and updates the `q` filter.

`FilterButton` is the toolbar dropdown that toggles which optional inputs appear in the existing `<FilterForm>`. Its UI is a shadcn `DropdownMenu`.

### 7.3 SimpleList / InfiniteList design

`SimpleList` is a render-prop-style list:

```tsx
<List>
  <SimpleList
    primaryText={(record) => record.title}
    secondaryText={(record) => record.body}
    leftAvatar={(record) => <Avatar src={record.avatar} />}
    linkType="show"
  />
</List>
```

`InfiniteList` replaces the standard `<List>` body. Internally it swaps `useListController` for an infinite-query variant exposed by ra-core, and pairs with `<InfinitePagination>` (a "Load more" button + intersection observer).

### 7.4 ImageInput vs FileInput

`FileInput` already exists. `ImageInput` is a thin wrapper that defaults `accept` to `image/*`, renders previews as `<img>` rather than file names, and accepts the same props otherwise. Both delegate to a shared internal `useDropzone` setup so behavior stays in sync.

### 7.5 SaveButton extraction

Today `toolbar.tsx` renders both Save and a delete action inline. `save-button.tsx` exports `SaveButton` as a standalone form-submit button. `toolbar.tsx` is refactored to use `<SaveButton />` internally and re-export it. No behavior change for existing consumers.

### 7.6 RichTextField sanitization

`RichTextField` displays HTML content stored in records. To avoid XSS, it sanitizes input with DOMPurify before rendering. Implementation:

1. Add `dompurify` and `@types/dompurify` to dependencies.
2. The component calls `DOMPurify.sanitize(value)` and renders the result into a `<div>` via React's HTML rendering mechanism with the sanitized string. No raw user-provided HTML reaches the DOM.
3. A `sanitizeOptions` prop allows callers to extend the allowlist if they trust the source. Default config matches DOMPurify defaults (no scripts, no event handlers).

## 8. Execution: subagent waves

Subagent-driven development is used. Waves run sequentially; subagents within a wave run in parallel.

### Wave 1 — leaf components (5 subagents in parallel)
No new-component-to-new-component dependencies. File namespaces don't overlap. All can run simultaneously.

| Subagent | Files |
|---|---|
| 1a — buttons | 8 new + 8 named re-exports inside 4 button files |
| 1b — fields | 6 new field files |
| 1c — inputs A | checkbox-group, password, nullable-boolean, time, select-array |
| 1d — inputs B | image-input, resettable-text-input |
| 1e — misc atoms | empty, list-no-results, list-actions, list-toolbar, link, loading-indicator, sidebar-toggle-button |

### Wave 2 — composites (2 subagents in parallel)
Depend on wave 1 atoms.

| Subagent | Files |
|---|---|
| 2a — filter sidebar | filter-list, filter-list-item, filter-list-section, filter-live-form, filter-live-search, filter-button |
| 2b — list variants | simple-list, simple-list-item, simple-list-loading, infinite-list, infinite-pagination |

### Wave 3 — layout split (1 subagent, serial)
Touches `layout.tsx` and `app-sidebar.tsx` directly. Serialized to avoid merge conflicts.

| Subagent | Files |
|---|---|
| 3 — layout | app-bar, menu, menu-item-link, resource-menu-item, dashboard-menu-item, title, title-portal, top-toolbar + refactor `layout.tsx` + refactor `app-sidebar.tsx` |

### Wave 4 — demo integration + final review (1 subagent)
Wires the composition-heavy components into the demo app for human-eyeball verification. Regenerates the registry.

| Step | Detail |
|---|---|
| Wire FilterList | Add `FilterSidebar` to demo customer list `aside` |
| Wire SimpleList | Switch demo reviews list to `SimpleList` on mobile |
| Wire FilterLiveSearch | Add to demo product list |
| Wire AppBar/Menu/Sidebar | Verify the split layout renders identically to today's demo |
| Wire Empty + ListActions | Demo orders list shows `Empty` when filter yields zero results |
| Registry | `pnpm registry:build` and visually inspect the output |
| Verification | `make typecheck` + `make lint` + `make test` + `make run` and click through |

## 9. Verification & "done" criteria

### Per-component (during waves 1–3)
- TypeScript clean: `make typecheck` passes
- ESLint clean: `make lint` passes
- A `.stories.tsx` file exists and renders in vitest+playwright headless
- A docs page exists under `docs/src/content/docs/` matching the Usage → Props → per-prop convention
- Component added to `scripts/build_registry.mjs`'s component manifest

### Per-wave
- All per-component criteria for every component in the wave
- Full test suite passes: `make test`

### Phase 1 complete
- All 47 components landed
- Demo app boots and primary flows (list/edit/create/show) for each demo resource work without regression
- `pnpm registry:build` succeeds
- Migration notes section appended to docs covering any unavoidable API divergence from upstream `ra-ui-materialui`
- Committed to `full-claude` branch

### Phase 2 trigger
- A new session is opened with the user
- This spec is the source of truth for Phase 2 scope
- Same conventions and wave-based execution apply

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Layout refactor breaks demo or third-party consumers | Public `Layout` import is unchanged. Demo gets visual smoke test in Wave 4. Existing `*.spec.tsx` files run unmodified. |
| Subagents conflict on shared files (e.g., delete-button.tsx) | Named re-exports added by the same subagent that owns the parent file (1a). No cross-subagent edits. |
| FilterList family overlaps confusingly with existing FilterForm | Document both patterns clearly. They cover different use cases (sidebar chips vs top-bar form) and coexist in upstream too. |
| Story files balloon to 45+ even for tiny components | Each story is minimal (`Basic` export only by default). Atomic components get one story; composites get 2–3. |
| Re-export wrappers cause duplicate type signatures | Wrappers are plain function components that delegate; types flow from the wrapped component automatically. |
| Some components in section 5 slip into Phase 1 because the boundary is fuzzy | Spec is the cut line. If a wave 1 subagent thinks a component crosses into Phase 2, they flag and we defer. |
| `RichTextField` ships an XSS vector | Mandatory DOMPurify sanitization; no raw-HTML escape hatch in Phase 1. |

## 11. Migration notes (to be authored in Wave 4)

When Phase 1 lands, append a "Migrating from ra-ui-materialui" section to the docs covering:

- The `mutationMode` prop vs separate `*WithConfirm*`/`*WithUndo*` button names (both supported — the named ones are wrappers).
- Theme — Phase 1 ships a single shadcn-themed default; named themes (bw/nano/radiant/house) ship in Phase 2.
- TranslatableFields/Inputs — not in Phase 1.
- Inspector / Configurable — not in Phase 1.
- Any prop renames or omissions discovered during implementation.
