---
title: useOnReconnect
---

`useOnReconnect` registers a callback that fires whenever the realtime transport reconnects after a dropped connection. Use it to re-fetch or invalidate queries so the UI recovers from any missed events.

## Usage

```tsx
import { useOnReconnect } from "@/components/realtime";
import { useQueryClient } from "@tanstack/react-query";

function PostList() {
  const queryClient = useQueryClient();

  useOnReconnect(() => {
    queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === "posts" });
  });

  return <div>...</div>;
}
```

## Params

| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `callback` | Required | `() => void` | Called when the transport reconnects |

## Returns

`void`

## Notes

- The callback ref is updated on every render — you do not need to memoize it.
- This hook is a no-op when the `DataProvider` in context does not implement `onReconnect` (e.g. when using `broadcastChannelTransport` or `fakeTransport`). It never throws.
- `<ListLive>`, `<EditLive>`, and `<ShowLive>` all call `useOnReconnect` internally to invalidate queries on reconnect. Use this hook directly when building custom live views.
