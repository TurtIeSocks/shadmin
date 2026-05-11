---
title: "Migrating from ra-ui-materialui"
---

This guide covers the API differences between Shadcn Admin Kit and the
[`ra-ui-materialui`](https://marmelab.com/react-admin/) package shipped with
react-admin. Most APIs are identical, but a handful of components have moved,
been renamed, or have slightly different surface area. This page also lists
features that are still pending and scheduled for Phase 2.

The current Phase 1 release ships 47 newly-ported components on top of the
existing Shadcn Admin Kit surface, bringing the kit close to feature parity
with `ra-ui-materialui`.

## `mutationMode` prop vs separate `*WithConfirm*` / `*WithUndo*` exports

Both forms are supported. Shadcn Admin Kit exposes a single `<DeleteButton>`
dispatcher that internally renders `<DeleteWithUndoButton>` or
`<DeleteWithConfirmButton>` based on the `mutationMode` prop. The dedicated
named exports are also available for direct use.

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

## Theme

Phase 1 ships a single shadcn-themed default driven by Tailwind CSS v4 with
oklch CSS custom properties for theming. The light and dark schemes live in
`src/index.css` and follow the shadcn `new-york` variant.

The 5 named themes from `ra-ui-materialui`
(`defaultTheme`, `bwTheme`, `nanoTheme`, `radiantTheme`, `houseTheme`), as
well as the `useTheme()` / `useThemesContext()` hooks, are **deferred to
Phase 2**.

If you need to customize the look of an installation, edit the CSS variables
in `src/index.css` (or your equivalent) and use Tailwind utilities on the
shadcn primitives in `src/components/ui/`.

## TranslatableFields / TranslatableInputs

The `<TranslatableFields>` and `<TranslatableInputs>` family (for editing
records with translations in multiple locales) is **deferred to Phase 2**.

For now, work with one locale at a time through the standard `<TextInput>`
/ `<TextField>` components, or use the i18n provider to switch the rendered
locale globally.

## Inspector / Configurable

The `<Inspector>` / `<Configurable>` components used in `ra-ui-materialui`
to let end-users tweak component appearance from a side panel are **deferred
to Phase 2**.

Existing user-customisable list views still work via `<ColumnsButton>`
(per-column show/hide for `<DataTable>`) and `<SavedQueries>` (saved filter
sets).

## Filter sidebar patterns

Both filter patterns from `ra-ui-materialui` are supported:

- `<FilterForm>` — a top-of-list toolbar form, driven by the `filters` prop
  of `<List>`. Filters get inlined above the data table.
- `<FilterList>` / `<FilterListItem>` / `<FilterLiveSearch>` — a sidebar of
  chip-style toggle filters and a live search box.

### Top toolbar pattern

```tsx
import {
  List,
  DataTable,
  TextInput,
  SelectInput,
} from "@/components/admin";

const postFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <SelectInput
    source="status"
    choices={[
      { id: "draft", name: "Draft" },
      { id: "published", name: "Published" },
    ]}
  />,
];

export const PostList = () => (
  <List filters={postFilters}>
    <DataTable>
      <DataTable.Col source="title" />
      <DataTable.Col source="status" />
    </DataTable>
  </List>
);
```

### Sidebar pattern

> **Important difference from `ra-ui-materialui`**: `<List>` in Shadcn Admin
> Kit does **not** have an `aside` prop. Render the sidebar as a flex sibling
> inside the `<List>` children instead.

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

## List utilities: `<Empty>` vs `<ListNoResults>`

Shadcn Admin Kit splits the empty-state UI of `ra-ui-materialui` into two
components for clarity:

- `<Empty>` — shown when the resource has no records **and** no filters are
  active. This is the cue to invite the user to create the first record.
- `<ListNoResults>` — shown when filters yield 0 results. Suggests clearing
  filters or trying a different search.

Both are wired into `<List>` and `<DataTable>` by default, so you only need
to override them if you want to customize the messaging.

```tsx
import { List, DataTable, Empty, ListNoResults } from "@/components/admin";

export const PostList = () => (
  <List empty={<Empty />}>
    <DataTable empty={<ListNoResults />}>{/* cols */}</DataTable>
  </List>
);
```

## `<SaveButton>` location

`<SaveButton>` has moved into its own file at
`src/components/admin/save-button.tsx`. Existing imports continue to work
via re-export:

```tsx
// All three forms work
import { SaveButton } from "@/components/admin";
import { SaveButton } from "@/components/admin/form";
import { SaveButton } from "@/components/admin/save-button";
```

No code changes are required when upgrading.

## `<ImageInput>`

`<ImageInput>` is now a separate export that wraps `<FileInput>` with
image-specific defaults (accepts images by default, renders thumbnail
previews). The underlying `<FileInput>` is still available for non-image
file uploads.

```tsx
import { ImageInput, ImageField } from "@/components/admin";

<ImageInput source="picture" label="Profile picture">
  <ImageField source="src" title="title" />
</ImageInput>;
```

## HTML rendering safety in `<RichTextField>`

`<RichTextField>` sanitizes content with `DOMPurify` and renders the
resulting DOM tree through `html-react-parser` before mounting it. This
means scripts, inline event handlers, and other risky markup are stripped
before reaching React — a safer default than the unsanitized HTML injection
used by upstream `ra-ui-materialui`.

```tsx
import { RichTextField } from "@/components/admin";

<RichTextField source="body" />;
```

If you need to preserve specific tags that DOMPurify strips, wrap the field
in a custom renderer or use the `WrapperField` to render the raw `body`
directly — and make sure the source is trusted.

## Phase 2 — pending components

The following items from `ra-ui-materialui` are **not yet ported** in
Phase 1 and are tracked for Phase 2:

- **i18n editing**: `TranslatableFields`, `TranslatableInputs`,
  `TranslatableFieldsTab`, `TranslatableFieldsTabContent`,
  `TranslatableInputsTab`, `TranslatableInputsTabContent`
- **Theming**: named themes (`defaultTheme`, `bwTheme`, `nanoTheme`,
  `radiantTheme`, `houseTheme`), `useTheme`, `useThemesContext`
- **Inspector**: `Configurable`, `Inspector`, `PageTitleConfigurable`
- **Inline editing**: `InPlaceEditor`, `DatagridInput`, `LoadingInput`
- **Auth scaffolding**: `AuthCallback`, `AuthError`, `AuthLayout`,
  `LoginWithEmail`, `LoginForm`, `AccessDenied`, `AuthenticationError`
- **Realtime/connectivity**: `CheckForApplicationUpdate`, `Offline`,
  `ApplicationUpdatedNotification`
- **Misc UI**: `KeyboardShortcut`, `HideOnScroll`, `LinearProgress`,
  `LoadingPage`, `CardContentInner`, `DeviceTestWrapper`, `Placeholder`,
  `ReferenceError`
- **DataTable internals**: fine-grained internal exports of `<DataTable>`
  (e.g. `DatagridHeader`, `DatagridRow`) — for now, customize via the
  documented public slots on `<DataTable>`.

If you depend on one of these components in your existing app, you can
either keep `ra-ui-materialui` installed alongside Shadcn Admin Kit until
Phase 2 ships, or fall back to the headless ra-core hooks and wire your
own UI on top of shadcn/ui primitives.
