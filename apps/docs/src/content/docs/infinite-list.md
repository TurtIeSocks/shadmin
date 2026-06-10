---
title: "InfiniteList"
---

An infinite-scroll variant of [`<List>`](./list), backed by `useInfiniteListController` from `ra-core`.

`<InfiniteList>` renders the same chrome as `<List>` (breadcrumb, title, filters, actions) but replaces page-based pagination with a "Load more" affordance: as the user scrolls, the next page of records is fetched automatically — or they can press the button rendered at the bottom of the list.

## Usage

`<InfiniteList>` is a drop-in replacement for `<List>` in most cases — children, filters, actions, sort, and permanent filters all work identically.

```tsx
import { DataTable, InfiniteList } from "@/components/admin";

export const PostList = () => (
  <InfiniteList perPage={20}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="published_at" />
    </DataTable>
  </InfiniteList>
);
```

It pairs nicely with [`<SimpleList>`](./simple-list) for mobile-friendly screens:

```tsx
import { InfiniteList, SimpleList } from "@/components/admin";

export const PostList = () => (
  <InfiniteList perPage={20}>
    <SimpleList
      primaryText={(record) => record.title}
      secondaryText={(record) => record.author}
    />
  </InfiniteList>
);
```

## Props

| Prop                      | Required   | Type                                        | Default                  | Description                                                    |
| ------------------------- | ---------- | ------------------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `children`                | Optional\* | `ReactNode`                                 | -                        | Component(s) that display the records                          |
| `render`                  | Optional\* | `(ctx) => ReactNode`                        | -                        | Alternate render function receiving the list context           |
| `actions`                 | Optional   | `ReactNode`                                 | default action bar       | Custom actions area (right side of header)                     |
| `aside`                   | Optional   | `ReactNode`                                 | -                        | Side panel rendered alongside the list content                 |
| `component`               | Optional   | `ElementType`                               | `"div"`                  | Override the root element wrapping the list content            |
| `empty`                   | Optional   | `ReactNode \| false`                        | `<Empty />`              | Replacement for the default empty-state component              |
| `debounce`                | Optional   | `number`                                    | `500`                    | Debounce (ms) for filter & sort changes                        |
| `disableAuthentication`   | Optional   | `boolean`                                   | `false`                  | Skip auth check for this page                                  |
| `disableBreadcrumb`       | Optional   | `boolean`                                   | `false`                  | Hide the default breadcrumb                                    |
| `disableSyncWithLocation` | Optional   | `boolean`                                   | `false`                  | Keep list params local (not in the URL)                        |
| `exporter`                | Optional   | `false \| Exporter`                         | -                        | Custom export logic (set `false` to hide Export button)        |
| `filters`                 | Optional   | `ReactElement[]`                            | -                        | Array of filter input elements (displayed inline)              |
| `filter`                  | Optional   | `object`                                    | -                        | Permanent filters always applied                               |
| `filterDefaultValues`     | Optional   | `object`                                    | -                        | Initial filter form values                                     |
| `pagination`              | Optional   | `ReactNode`                                 | `<InfinitePagination />` | Custom pagination component                                    |
| `perPage`                 | Optional   | `number`                                    | `10`                     | Records per page                                               |
| `queryOptions`            | Optional   | `object`                                    | -                        | Extra TanStack Query options                                   |
| `resource`                | Optional   | `string`                                    | inferred                 | Resource name, defaults to the current `<ResourceContext>`     |
| `sort`                    | Optional   | `{ field: string; order: 'ASC' \| 'DESC' }` | -                        | Initial sort                                                   |
| `storeKey`                | Optional   | `string \| false`                           | derived                  | Storage key for persisted params; `false` disables persistence |
| `title`                   | Optional   | `string \| ReactNode \| false`              | resource plural label    | Page title                                                     |

`*` Provide either `children` or `render`.

## `empty`

When the list has no records and no active filters, `<InfiniteList>` renders the default [`<Empty>`](./empty) component. Pass a custom node to replace it, or `false` to suppress:

```tsx
import { InfiniteList, DataTable } from "@/components/admin";

export const PostList = () => (
  <InfiniteList
    empty={
      <p className="text-center py-8 text-muted-foreground">No posts yet.</p>
    }
  >
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </InfiniteList>
);
```

## `component`

By default, `<InfiniteList>` wraps the list content in a `<div>`. Pass any React element type to `component` to replace it:

```tsx
import { InfiniteList, DataTable } from "@/components/admin";
import { Card } from "@/components/ui/card";

export const PostList = () => (
  <InfiniteList component={Card}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </InfiniteList>
);
```

## `aside`

Pass any React node as `aside` to display a side panel next to the infinite list content:

```tsx
import { InfiniteList, DataTable } from "@/components/admin";

const ListHelp = () => (
  <div className="p-4 bg-muted rounded text-sm w-64">
    <p className="font-medium mb-2">Tips</p>
    <p>Scroll down to load more records automatically.</p>
  </div>
);

export const PostList = () => (
  <InfiniteList aside={<ListHelp />}>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
    </DataTable>
  </InfiniteList>
);
```

## `pagination`

By default, `<InfiniteList>` renders an [`<InfinitePagination>`](./infinite-pagination). Override it to customize the loader or hide it entirely:

```tsx
import { InfiniteList, InfinitePagination } from "@/components/admin";

<InfiniteList pagination={<InfinitePagination className="py-8" />}>
  {/* ... */}
</InfiniteList>;
```

## When to choose `<InfiniteList>` vs `<List>`

- Prefer `<InfiniteList>` for activity feeds, search results, mobile-first views, and any UI where the user mostly scans down a single column.
- Prefer `<List>` for tables that need direct access to a known page (e.g. "go to page 12"), bulk actions across all records, or `total`-aware UI.
