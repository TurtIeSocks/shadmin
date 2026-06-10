---
title: useUnlock
---

`useUnlock` returns an `unlock` function for releasing a record lock.

## Usage

```tsx
import { useUnlock } from "@/components/realtime";

function UnlockButton({ resource, id }: { resource: string; id: number }) {
  const { unlock, isLoading, error } = useUnlock();

  return (
    <button onClick={() => unlock(resource, { id })} disabled={isLoading}>
      Release lock
    </button>
  );
}
```

## Params

None.

## Returns

| Field | Type | Description |
|-------|------|-------------|
| `unlock` | `(resource, params) => Promise<Lock>` | Releases a lock |
| `isLoading` | `boolean` | `true` while the call is in flight or identity is loading |
| `error` | `Error \| null` | The last error |

### `unlock` signature

```ts
unlock(
  resource: string,
  params: { id: Identifier; identity?: Identifier; meta?: Record<string, unknown> }
): Promise<Lock>
```

## Notes

- If `identity` is omitted, falls back to `useGetIdentity()`. If no identity is available, the call throws.
- Throws if no lock exists for the record or if the caller's identity does not match the lock holder.
- `useLockOnMount` calls `useUnlock` automatically on component unmount — use it instead when you want lock-cleanup handled for you.
