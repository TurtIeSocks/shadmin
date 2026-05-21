---
title: ListLive
---

`<ListLive>` is a drop-in replacement for `<List>` that subscribes to realtime events for the resource. When a `created`, `updated`, or `deleted` event arrives on the `resource/<name>` topic — or when the transport reconnects — the list is automatically refreshed.

## Usage

Replace `<List>` with `<ListLive>` on any list page where you want live updates:

```tsx
import { DataTable } from "@/components/admin";
import { ListLive } from "@/components/realtime";

export const PostList = () => (
  <ListLive>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col source="title" />
      <DataTable.Col source="author" />
    </DataTable>
  </ListLive>
);
```

No other changes are required — `<ListLive>` accepts all the same props as `<List>`.

## Props

`<ListLive>` accepts every prop that `<List>` accepts. See the [`<List>` documentation](./list) for the full prop reference.

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `children` | Optional* | `ReactNode` | — | Components that render the records (e.g. `<DataTable>`) |
| `render` | Optional* | `(ctx) => ReactNode` | — | Alternate render function |
| `...listProps` | Optional | — | — | All `<List>` props are forwarded unchanged |

`*` Provide either `children` or `render`.

## Notes

- Internally renders `<List>` plus a hidden `<ListLiveSubscription>` that calls `useSubscribeToRecordList` and `useOnReconnect`.
- Invalidates all TanStack Query entries keyed by the resource name, so all active queries for the resource (different pages, filters) are refreshed together.
- Requires the data provider to be wrapped with `realtimeDataProvider()`. Renders normally if the subscription cannot be established (no error thrown).
