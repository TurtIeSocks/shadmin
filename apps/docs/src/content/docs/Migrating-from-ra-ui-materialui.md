---
title: "Migrating from ra-ui-materialui"
---

Shadcn Admin Kit re-implements the UI surface of [`ra-ui-materialui`](https://marmelab.com/react-admin/) on top of shadcn/ui primitives while
reusing [`ra-core`](https://marmelab.com/react-admin/) for headless logic (data, auth, routing, i18n, state). Most upstream APIs translate
directly: the hooks are unchanged and component prop names are preserved whenever possible. This page documents the additions and intentional
deviations made during the port, plus the components that have no upstream equivalent.

If you are coming from `react-admin` / `ra-ui-materialui`, the short version is:

- **Hooks**: identical — `useListContext`, `useRecordContext`, `useInput`, `usePreferencesEditor`, `useTranslate`, etc. are all re-exported from
  `ra-core` and behave the same.
- **Components**: same names, same prop shapes most of the time. Some MUI-specific props (e.g. `sx`, `slotProps`, MUI theme overrides) have no
  equivalent — see the per-component notes below.
- **Themes**: instead of MUI theme objects, shadcn-admin-kit themes are plain objects mapping CSS custom property names to
  [oklch](https://oklch.com) values. They are applied at runtime via `documentElement.style.setProperty(...)`.
- **Imports**: every component is exported as a named export from `@/components/admin`.

## Ported components

Components grouped by area. Behaviour matches `ra-ui-materialui` unless an explicit deviation is called out below.

### Translatable family

Components added: `TranslatableFields`, `TranslatableFieldsTab`, `TranslatableFieldsTabContent`, `TranslatableFieldsTabs`, `TranslatableInputs`,
`TranslatableInputsTab`, `TranslatableInputsTabContent`, `TranslatableInputsTabs`.

These mirror the upstream `<TranslatableFields>` / `<TranslatableInputs>` APIs and accept the same `locales`, `defaultLocale`, `groupKey` and
`selector` props.

**Key differences**:

- The tab UI is built on top of Radix UI `Tabs` (via `@/components/ui/tabs`) rather than `@mui/material/Tabs`. Tab content panels mount with
  `forceMount` so every locale's form state is preserved as users switch tabs — matching the upstream behaviour even though Radix's default is
  to unmount inactive tabs.
- The default `<TranslatableFieldsTabContent>` renders an inline `<label>` above each field instead of wrapping children in the upstream
  `<Labeled>` component.

```tsx
import { TranslatableInputs, TextInput } from "@/components/admin";

<TranslatableInputs locales={["en", "fr"]} defaultLocale="en">
  <TextInput source="title" />
  <TextInput source="description" multiline />
</TranslatableInputs>;
```

### Themes

Components added: `defaultTheme`, `bwTheme`, `nanoTheme`, `radiantTheme`, `houseTheme`, plus `ThemesContext`, `useThemesContext` and the
`AdminTheme` type.

**Key difference**: shadcn-admin-kit themes are plain JS objects mapping CSS variable names → oklch values, applied at runtime by
`<ThemeProvider>` via `documentElement.style.setProperty(...)`. They do not contain MUI-specific component overrides. Where the upstream
`ra-ui-materialui` themes could re-style individual MUI components, shadcn themes are limited to the palette + border radius. Differences in
component appearance across themes are therefore confined to colours and corner radii.

```tsx
import { Admin, radiantTheme } from "@/components/admin";

<Admin dataProvider={dataProvider} theme={radiantTheme}>
  {/* ... */}
</Admin>;
```

See the [Themes](./themes/) page for the full catalogue and the `AdminTheme` shape.

### Preferences / Inspector

Components added: `Configurable`, `Inspector`, `InspectorRoot`, `InspectorButton`, `FieldsSelector`, `SimpleFormConfigurable`.

These compose the same way as their upstream counterparts: wrap a piece of UI in `<Configurable>` and provide an `editor`, then mount an
`<Inspector>` somewhere in the layout and let `<InspectorButton>` toggle edit mode. Persistence still flows through `ra-core`'s preferences
store, so `usePreference`, `usePreferenceKey` and friends work without changes.

**Key difference**: the Inspector panel is pinned to the top-right corner of the viewport. The upstream MUI `<Inspector>` is a draggable
dialog whose position is persisted in the store; that complexity is intentionally omitted here. If you relied on the drag-to-reposition
behaviour upstream, you'll need to provide it yourself by overriding the `<Inspector>` component.

```tsx
import { Admin, Inspector, InspectorButton } from "@/components/admin";

<Admin dataProvider={dataProvider}>
  <Inspector />
  {/* InspectorButton goes in your AppBar / Layout */}
</Admin>;
```

### Specialized inputs

Components added: `InPlaceEditor`, `DatagridInput`, `LoadingInput`.

- `<InPlaceEditor>` matches the upstream component — click a field in a list/show context to swap it for an inline form, save on blur.
- `<DatagridInput>` mirrors the upstream API (a checkbox-selectable table that emits an array of selected ids on form submit).
- `<LoadingInput>` is the low-level skeleton-shaped placeholder used by inputs while their data is loading.

### Auth pages

Components added: `AuthCallback`, `AuthError`, `AuthLayout`, `LoginForm`, `LoginWithEmail`.

The shape of these mirrors upstream, with a couple of refactors:

- `<LoginPage>` is now a thin composition of `<AuthLayout>` + `<LoginForm>`. Anything you can do with the upstream `<Login>` page you can do by
  composing your own page from `<AuthLayout>` + `<LoginForm>` (or your own form).
- `<AuthCallback>` and `<AuthError>` were extracted out of `authentication.tsx` into their own files. The original
  `@/components/admin/authentication` module now re-exports both for backward compatibility, so existing imports keep working:

  ```ts
  // Both of these still work:
  import { AuthCallback, AuthError } from "@/components/admin/authentication";
  import { AuthCallback } from "@/components/admin/auth-callback";
  ```

- `<LoginWithEmail>` is a minimal form for passwordless / magic-link flows. It calls `authProvider.login({ email })` and shows a success
  message.

### PWA — application updates and offline detection

Components added: `CheckForApplicationUpdate`, `ApplicationUpdatedNotification`, `Offline`.

- `<CheckForApplicationUpdate>` polls the current HTML document at a configurable interval and computes a sync **djb2-based content hash** on
  each response. When the hash changes, it shows `<ApplicationUpdatedNotification>` to prompt the user to reload. The upstream MUI version uses
  the same conceptual approach; the hashing strategy is identical in spirit (cheap, sync, no crypto) and a fully drop-in replacement at the prop
  level.
- `<Offline>` listens to `navigator.onLine` plus the browser `online` / `offline` events and renders its children when the user is offline.
  This is a lighter implementation than the upstream Service-Worker-aware variant — it does not consult the SW's `controller`. Pure
  online/offline signal only.

### Misc atoms

Small primitives needed by the page-level components above. These are intentionally low-API:

`KeyboardShortcut`, `AccessDenied`, `AuthenticationError`, `HideOnScroll`, `LinearProgress`, `LoadingPage`, `CardContentInner`,
`DeviceTestWrapper`, `Placeholder`, `ReferenceError`.

If you have customisations that depend on upstream MUI-specific atoms (`<LinearProgress>`'s MUI props, `<HideOnScroll>` mounted around an
`<AppBar>`, etc.), expect minor rewrites — they accept the same intent but the prop surface is shadcn-flavoured and the underlying DOM is
different.

### DataTable internals

Components added: `DataTableRoot`, `DataTableHead`, `DataTableBody`, `DataTableRow`, `DataTableHeadCell`, `DataTableCell`, `DataTableEmpty`,
`DataTableLoading`, `SelectPageCheckbox`, `SelectRowCheckbox`.

All **additive**. The public API of `<DataTable>` is unchanged — you can keep using it exactly as before. These exports exist so consumers who
want to drop down a level (custom row rendering, replacing the empty/loading state, building a non-standard layout) have the same building
blocks the default `<DataTable>` does. This matches the upstream `<Datagrid>` story where `<DatagridHeaderCell>` etc. are public.

## Behavioural differences worth knowing

These are the spots where porting code from `ra-ui-materialui` will require a small adjustment, even though the imports look the same.

### `mutationMode` prop vs separate `*WithConfirm*` / `*WithUndo*` exports

Both forms are supported. Shadcn Admin Kit exposes a single `<DeleteButton>` dispatcher that internally renders `<DeleteWithUndoButton>` or
`<DeleteWithConfirmButton>` based on the `mutationMode` prop. The dedicated named exports are also available for direct use.

```tsx
// Dispatcher form (recommended)
import { DeleteButton } from "@/components/admin";

<DeleteButton mutationMode="undoable" /> // default — optimistic update + undo toast
<DeleteButton mutationMode="pessimistic" /> // shows confirm dialog, awaits server
<DeleteButton mutationMode="optimistic" /> // optimistic, no undo

// Named-export form (also supported)
import {
  DeleteWithUndoButton,
  DeleteWithConfirmButton,
} from "@/components/admin";

<DeleteWithUndoButton />
<DeleteWithConfirmButton />
```

The same pattern applies to `<BulkDeleteButton>` and `<BulkUpdateButton>`.

### Filter sidebar — `<List>` has no `aside` prop

Both filter patterns from `ra-ui-materialui` are supported:

- `<FilterForm>` — a top-of-list toolbar form, driven by the `filters` prop of `<List>`. Filters get inlined above the data table.
- `<FilterList>` / `<FilterListItem>` / `<FilterLiveSearch>` — a sidebar of chip-style toggle filters and a live search box.

**Important difference from `ra-ui-materialui`**: `<List>` in Shadcn Admin Kit does **not** have an `aside` prop. Render the sidebar as a flex
sibling inside the `<List>` children instead.

```tsx
import { Card } from "@/components/ui/card";
import { Mail, Newspaper } from "lucide-react";
import {
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  List,
  DataTable,
} from "@/components/admin";

const PostFilterSidebar = () => (
  <Card className="min-w-48 p-4 hidden md:block">
    <FilterLiveSearch />
    <FilterList label="Status" icon={<Newspaper className="size-4" />}>
      <FilterListItem label="Published" value={{ status: "published" }} />
      <FilterListItem label="Draft" value={{ status: "draft" }} />
    </FilterList>
    <FilterList
      label="Subscribed to newsletter"
      icon={<Mail className="size-4" />}
    >
      <FilterListItem label="Yes" value={{ has_newsletter: true }} />
      <FilterListItem label="No" value={{ has_newsletter: false }} />
    </FilterList>
  </Card>
);

export const PostList = () => (
  <List>
    <div className="flex flex-row gap-4">
      <PostFilterSidebar />
      <div className="flex-1">
        <DataTable>
          <DataTable.Col source="title" />
          <DataTable.Col source="status" />
        </DataTable>
      </div>
    </div>
  </List>
);
```

A real example of this pattern lives in
[`src/demo/customers/CustomerList.tsx`](https://github.com/marmelab/shadcn-admin-kit/blob/main/src/demo/customers/CustomerList.tsx).

### `<Empty>` vs `<ListNoResults>`

Shadcn Admin Kit splits the empty-state UI of `ra-ui-materialui` into two components for clarity:

- `<Empty>` — shown when the resource has no records **and** no filters are active. This is the cue to invite the user to create the first
  record.
- `<ListNoResults>` — shown when filters yield 0 results. Suggests clearing filters or trying a different search.

Both are wired into `<List>` and `<DataTable>` by default, so you only need to override them if you want to customize the messaging.

```tsx
import { List, DataTable, Empty, ListNoResults } from "@/components/admin";

export const PostList = () => (
  <List empty={<Empty />}>
    <DataTable empty={<ListNoResults />}>{/* cols */}</DataTable>
  </List>
);
```

### `<ImageInput>`

`<ImageInput>` is a separate export that wraps `<FileInput>` with image-specific defaults (accepts images by default, renders thumbnail
previews). The underlying `<FileInput>` is still available for non-image file uploads.

```tsx
import { ImageInput, ImageField } from "@/components/admin";

<ImageInput source="picture" label="Profile picture">
  <ImageField source="src" title="title" />
</ImageInput>;
```

### HTML rendering safety in `<RichTextField>`

`<RichTextField>` sanitizes content with `DOMPurify` and renders the resulting DOM tree through `html-react-parser` before mounting it. This
means scripts, inline event handlers, and other risky markup are stripped before reaching React — a safer default than the unsanitized HTML
injection used by upstream `ra-ui-materialui`.

```tsx
import { RichTextField } from "@/components/admin";

<RichTextField source="body" />;
```

If you need to preserve specific tags that DOMPurify strips, wrap the field in a custom renderer or use the `WrapperField` to render the raw
`body` directly — and make sure the source is trusted.

### `<SaveButton>` location

`<SaveButton>` has its own file at `src/components/admin/save-button.tsx`. Existing imports continue to work via re-export:

```tsx
// All three forms work
import { SaveButton } from "@/components/admin";
import { SaveButton } from "@/components/admin/form";
import { SaveButton } from "@/components/admin/save-button";
```

No code changes are required when upgrading.

## Beyond `ra-ui-materialui`

Shadcn Admin Kit ships several component families that have no upstream equivalent. They are not migration concerns, but worth knowing about
when you plan a port — you may be able to drop a hand-rolled feature in favour of a built-in.

### Map (Leaflet) stack

A complete Leaflet integration for working with geographic data inside CRUD forms. All components live under `@/components/admin` and accept
GeoJSON-shaped record fields.

- **Container**: `<LeafletAdmin>` — wraps an `<Admin>` with map-aware defaults. `<LeafletOsm>` adds an OpenStreetMap tile layer.
- **Search and geocoding**: `<MapWithSearch>`, `<GeocodingInput>`, `<ReverseGeocodeField>`.
- **Geometry pairs** (one Field + one Input per GeoJSON geometry type): `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`,
  `MultiPolygon`, `GeometryCollection`, `Feature`, `FeatureCollection`, `GeoJson` (any-of), `BBox`, `LatLng`.
- **Editing**: `<OsmFeatureAdd>` and `<OsmFeatureSubtract>` for union / difference on existing features. `<SimplifyInput>` for Douglas–Peucker
  simplification.
- **Hooks**: `useGeomanRHF()` for wiring Geoman draw controls into React Hook Form.

Each component is documented under the **Map (Leaflet)** section of the sidebar.

### Extras

Higher-level views and widgets that go beyond classic CRUD. All optional, all under `@/components/admin`.

`Assistant`, `CalendarList`, `CommandMenu`, `DashboardCharts`, `DiffViewer`, `InPlaceEditor`, `KanbanBoard`, `OnboardingTour`,
`PermissionMatrix`, `PivotGrid`, `PresenceBar`, `RecordTimeline`, `TreeList`, `WizardForm`.

Each component is documented under the **Extras** section of the sidebar.

## Conventions

A handful of project-wide conventions apply to every component:

- **File names are kebab-case**. The component `TranslatableFieldsTab` lives in `translatable-fields-tab.tsx`. The upstream MUI convention of
  PascalCase file names was dropped to match the shadcn ecosystem.
- **Named exports only**. There is no `export default` anywhere in `src/components/admin/`. Import with curly braces:

  ```ts
  import { TranslatableInputs, Inspector } from "@/components/admin";
  ```

- **JSDoc on every public component** with at least one `@example` block and a `@see` link back to the docs page. This drives the in-IDE
  tooltip experience for consumers, and the `@see` links are the bridge between the source and the published documentation.
- **No `@mui/*` imports anywhere**. The codebase has zero MUI runtime dependencies — anything that previously came from `@mui/material`,
  `@mui/icons-material`, `@mui/lab` or `@mui/x-*` is reimplemented with shadcn/ui primitives plus `lucide-react` icons.

If you spot a component whose behaviour diverges from its upstream counterpart in a way that isn't documented here, please open an issue —
deviations should be intentional and documented.
