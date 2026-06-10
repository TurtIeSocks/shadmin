---
title: inMemoryLockProvider
---

`inMemoryLockProvider` creates a `LockProvider` that stores locks in a JavaScript `Map`. It is intended for demos and tests — not for production use.

:::warning
`inMemoryLockProvider` has **no persistence** and **no cross-instance synchronisation**. Every page reload starts with an empty lock store, and two server instances share no state. Use it only in demos, Storybook stories, and unit/integration tests.
:::

## Usage

```tsx
import {
  realtimeDataProvider,
  inMemoryLockProvider,
  fakeTransport,
} from "@/components/realtime";

const transport = fakeTransport();
const dataProvider = realtimeDataProvider(base, transport, {
  locks: inMemoryLockProvider({ publisher: transport }),
});
```

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `publisher` | `Pick<RealtimeTransport, "publish">` | — | When provided, the lock provider publishes `locked` / `unlocked` events to `lock/<resource>/<id>` and `lock/<resource>` topics so live lock-status components update in real time |

## Behaviour

| Method | What happens |
|--------|-------------|
| `lock(resource, params)` | Creates a lock. If the record is already locked by a different identity, throws `LockConflictError`. Re-locking by the same identity returns the existing lock. |
| `unlock(resource, params)` | Removes the lock. Throws if no lock exists or if the caller's identity differs from the lock holder. |
| `getLock(resource, params)` | Returns the `Lock` or `null` |
| `getLocks(resource)` | Returns all locks for the resource |

## Notes

- Pass `{ publisher: transport }` to enable live status updates. Without a publisher, locking works but other clients/tabs won't receive events until they poll.
- For production, implement a custom `LockProvider` backed by your server (REST endpoint, Redis `SET NX`, Postgres advisory locks, etc.) and pass it as `options.locks` to `realtimeDataProvider`.
- `LockConflictError` carries the `existingLock` on its `.existingLock` property — useful for rendering "Locked by X" messages.
