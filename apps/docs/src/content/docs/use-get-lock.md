---
title: useGetLock
---

`useGetLock` fetches the current lock for a single record. It is a one-time query — the result is not automatically refreshed when lock state changes. Use `useGetLockLive` for a live view.

## Usage

```tsx
import { useGetLock } from "@/components/realtime";

function LockInfo({ id }: { id: number }) {
  const { data: lock, isPending, error } = useGetLock("posts", { id });

  if (isPending) return <p>Checking lock…</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (lock) return <p>Locked by {String(lock.identity)}</p>;
  return <p>Unlocked</p>;
}
```

## Params

| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `resource` | Required | `string` | Resource name |
| `params.id` | Required | `Identifier` | Record ID |
| `params.meta` | Optional | `Record<string, unknown>` | Passed through to the `LockProvider` |

## Returns

| Field | Type | Description |
|-------|------|-------------|
| `data` | `Lock \| null \| undefined` | The lock (`null` = no lock, `undefined` = not yet loaded) |
| `isLoading` | `boolean` | `true` on initial load |
| `isPending` | `boolean` | `true` while there is no data yet |
| `error` | `Error \| null` | Fetch error |

## Notes

- Backed by TanStack Query with key `[resource, "lock", id]`.
- Requires a `LockProvider` configured on the data provider. Throws at render time if no `DataProvider` is in context.
