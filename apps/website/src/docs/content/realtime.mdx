---
title: Realtime
---

The realtime subsystem extends the `DataProvider` with `subscribe` / `publish` methods and ships hooks and components that turn any admin app into a live one. Pick a transport (WebSocket, SSE, BroadcastChannel, or the in-memory fake), wire it through `realtimeDataProvider()`, and swap your `<List>` / `<Edit>` / `<Show>` for the live variants.

## Quick start

```tsx
import {
  realtimeDataProvider,
  webSocketTransport,
} from "@/components/realtime";
import baseDataProvider from "./my-rest-data-provider";

const transport = webSocketTransport({ url: "wss://example.com/realtime" });
const dataProvider = realtimeDataProvider(baseDataProvider, transport);
```

Pass the resulting `dataProvider` to `<Admin>`, then swap the page components you want to keep live:

```tsx
import { ListLive, EditLive, ShowLive } from "@/components/realtime";

<Resource name="posts" list={PostListPage} edit={PostEditPage} show={PostShowPage} />

// inside PostListPage:
export const PostListPage = () => (
  <ListLive>
    <DataTable>...</DataTable>
  </ListLive>
);
```

## Pick a transport

| Transport | Direction | Cross-tab | Server needed | Use for |
|-----------|-----------|-----------|---------------|---------|
| `webSocketTransport` | bidirectional | yes | yes (WS server) | full realtime apps |
| `sseTransport` | server → client | yes | yes (SSE endpoint + optional publish endpoint) | dashboards, read-mostly apps |
| `broadcastChannelTransport` | bidirectional | yes (same browser) | no | small intranet apps + demos |
| `fakeTransport` | bidirectional | no | no | tests |

## Topic conventions

- `resource/<name>` — collection updates (created / updated / deleted events)
- `resource/<name>/<id>` — single-record updates
- `lock/<name>` — any lock event on the resource
- `lock/<name>/<id>` — lock event on a single record

Build topics with the helpers `resourceTopic`, `recordTopic`, `lockResourceTopic`, and `lockTopic` exported from `@/components/realtime`.

## CUD broadcast (`addEventsForMutations`)

Opt-in wrapper. Pass your data provider through `addEventsForMutations` so its own writes publish events back through the transport — useful for cross-tab demos and single-user apps:

```tsx
import {
  realtimeDataProvider,
  addEventsForMutations,
  broadcastChannelTransport,
} from "@/components/realtime";
import base from "./my-rest-data-provider";

const transport = broadcastChannelTransport({ channel: "my-app" });
const dp = realtimeDataProvider(base, transport);
const dataProvider = addEventsForMutations(dp, dp);
```

Skip it if your backend already broadcasts its own writes (Supabase, Pusher, Hasura, etc.) to avoid duplicate events.

## Locks

Locks are pluggable via the `LockProvider` interface. Pass a `locks` option to `realtimeDataProvider()` to enable the locking APIs:

```tsx
import { realtimeDataProvider, inMemoryLockProvider } from "@/components/realtime";

const dataProvider = realtimeDataProvider(base, transport, {
  locks: inMemoryLockProvider(),
});
```

The kit ships `inMemoryLockProvider()` for demos and tests. Production apps implement their own (REST endpoint, Redis, Postgres advisory locks, etc.). See the [`<LockOnMount>`](./lock-on-mount), [`<LockStatus>`](./lock-status), [`useLock`](./use-lock), [`useUnlock`](./use-unlock), and related pages.

## Custom transports

Implement the `RealtimeTransport` interface:

```ts
interface RealtimeTransport {
  subscribe(topic: string, cb: SubscriptionCallback): Unsubscribe;
  publish(topic: string, event: Omit<RealtimeEvent, "topic">): Promise<void>;
  connect?(): void;
  disconnect?(): void;
  onReconnect?(cb: () => void): Unsubscribe;
  onStatusChange?(cb: (status: RealtimeConnectionStatus) => void): Unsubscribe;
}
```

Only `subscribe` and `publish` are required. The WebSocket and SSE transports are reference implementations.

## Server protocol (WebSocket)

Clients send JSON frames with an `op` field:

```json
{ "op": "subscribe", "topic": "resource/posts" }
{ "op": "unsubscribe", "topic": "resource/posts" }
{ "op": "publish", "topic": "resource/posts", "event": { "type": "created", "payload": { "ids": [42] } } }
{ "op": "ping" }
```

Servers push event frames or a pong response:

```json
{ "topic": "resource/posts", "type": "created", "payload": { "ids": [42] } }
{ "op": "pong" }
```

See the [`webSocketTransport`](./websocket-transport) page for the full wire format and auth options.

## Pages in this subsystem

**Factory / transports**
- [`realtimeDataProvider`](./realtime-data-provider)
- [`addEventsForMutations`](./add-events-for-mutations)
- [`webSocketTransport`](./websocket-transport)
- [`sseTransport`](./sse-transport)
- [`broadcastChannelTransport`](./broadcast-channel-transport)
- [`fakeTransport`](./fake-transport)
- [`inMemoryLockProvider`](./in-memory-lock-provider)

**Hooks**
- [`useSubscribe`](./use-subscribe) · [`useSubscribeToRecord`](./use-subscribe-to-record) · [`useSubscribeToRecordList`](./use-subscribe-to-record-list) · [`useSubscribeCallback`](./use-subscribe-callback)
- [`usePublish`](./use-publish) · [`useOnReconnect`](./use-on-reconnect) · [`useRealtimeStatus`](./use-realtime-status)
- [`useGetListLive`](./use-get-list-live) · [`useGetOneLive`](./use-get-one-live) · [`useGetManyLive`](./use-get-many-live)
- [`useLock`](./use-lock) · [`useUnlock`](./use-unlock) · [`useGetLock`](./use-get-lock) · [`useGetLocks`](./use-get-locks)
- [`useGetLockLive`](./use-get-lock-live) · [`useGetLocksLive`](./use-get-locks-live) · [`useLockOnMount`](./use-lock-on-mount)

**Components**
- [`<ListLive>`](./list-live) · [`<EditLive>`](./edit-live) · [`<ShowLive>`](./show-live)
- [`<MenuLive>`](./menu-live) · [`<LockOnMount>`](./lock-on-mount) · [`<LockStatus>`](./lock-status)
