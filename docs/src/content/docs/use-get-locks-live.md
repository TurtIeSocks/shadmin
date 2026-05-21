---
title: useGetLocksLive
---

`useGetLocksLive` fetches all locks for a resource and re-fetches automatically when any `locked` or `unlocked` event arrives on `lock/<resource>`, or when the transport reconnects.

## Usage

```tsx
import { useGetLocksLive } from "@/components/realtime";

function LiveLockedList() {
  const { data: locks, isPending } = useGetLocksLive("posts");

  if (isPending) return <p>Loading…</p>;
  if (!locks?.length) return <p>No locked records</p>;
  return (
    <ul>
      {locks.map((lock) => (
        <li key={String(lock.recordId)}>
          #{String(lock.recordId)} — locked by {String(lock.identity)}
        </li>
      ))}
    </ul>
  );
}
```

## Params

| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `resource` | Required | `string` | Resource name |

## Returns

| Field | Type | Description |
|-------|------|-------------|
| `data` | `Lock[] \| undefined` | All locks for the resource |
| `isLoading` | `boolean` | `true` on initial load |
| `isPending` | `boolean` | `true` while no data yet |
| `error` | `Error \| null` | Fetch error |

## Notes

- Subscribes to the resource-level lock topic `lock/<resource>` (catches all lock events on the resource, unlike `useGetLockLive` which targets a single record).
- `useOnReconnect` is called internally to recover missed lock state changes after reconnects.
