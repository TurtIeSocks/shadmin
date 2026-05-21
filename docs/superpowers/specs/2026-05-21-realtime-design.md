# Realtime extension for shadcn-admin-kit

**Status:** Design, approved (2026-05-21).
**Owner:** Rin
**Spec location:** this file.

## 1. Summary

Add a realtime subsystem to shadcn-admin-kit: a `DataProvider` extension, pluggable transports (WebSocket, SSE, BroadcastChannel, in-memory fake), a full hook surface (`useSubscribe`, `usePublish`, `useGetListLive`, `useGetOneLive`, `useGetManyLive`, lock hooks), and drop-in component wrappers (`<ListLive>`, `<EditLive>`, `<ShowLive>`, `<MenuLive>`, `<LockOnMount>`, `<LockStatus>`). All files live under a new `src/components/realtime/` feature folder. Record locking is part of v1, but its REST plumbing is plugged in through an optional `LockProvider` so backends without lock support can still use the rest of the surface.

This is a cleanroom implementation. The design draws on standard industry vocabulary (pub/sub, topics, subscribe/publish, locks) and on whatever is publicly observable in the react-admin documentation. No upstream proprietary source is used.

The kit ships only the client side. Server protocol is specified at the wire-format level so consumers can build matching backends; no reference server is included in this scope.

## 2. Goals

- Provide an ergonomic, familiar surface for users coming from any react-admin background, so apps moving onto shadcn-admin-kit don't have to rebuild their realtime layer.
- Make transport selection / replacement a one-line change.
- Surface a clean type contract throughout — zero `any` in this kit's own code; ra-core's loose types are not propagated.
- Demonstrate the full feature in the demo app using `BroadcastChannel` (no real backend needed).
- Provide a complete docs page per component and per hook.

## 3. Non-goals

- Server reference implementation.
- Authorization at the topic level (server's problem).
- Conflict resolution beyond locking (OT, CRDT, etc.).
- Multi-tab integration testing in the spec suite (demo covers it visually instead).

## 4. Decisions (the 9 Q&A locks)

| # | Decision | Choice |
|---|----------|--------|
| 1 | API shape | Adopt the standard `subscribe` / `publish` / `useSubscribe` / `useGetListLive` shape that's familiar to anyone who's used a react-admin realtime layer, but restructure the awkward parts (cleanup pattern, topic format) on our own terms. |
| 2 | `subscribe` cleanup | Sync `subscribe(topic, cb) => () => void`. Returned function unsubscribes. No separate `unsubscribe` on the dataProvider. |
| 3 | Topic format | Opaque strings on the wire; caller-facing helpers (`resourceTopic`, `recordTopic`, `lockTopic`, `lockResourceTopic`) generate them. |
| 4 | Surface scope | Full: transports + hooks + drop-in views + menu badge + record locks. |
| 5 | CUD broadcasting | Opt-in via separate `addEventsForMutations(baseDP, publisher)` wrapper. Not auto-applied by the factory. |
| 6 | Transport architecture | Transport-as-plugin: `realtimeDataProvider(baseDP, transport, opts?)`. Transports implement a small `RealtimeTransport` interface. |
| 7 | Connection lifecycle | Lazy connect on first subscribe. Idle-disconnect after last unsubscribe + 30s grace. Exponential backoff reconnect (1s→30s cap, ±30% jitter). On reconnect: server-supported event replay (SSE `Last-Event-ID`) or `onReconnect` invalidation signal. |
| 8 | Lock identity | Hooks pull from `authProvider.getIdentity()` (via `useGetIdentity`). Raw `dataProvider.lock(...)` takes explicit `identity`. Throws if no identity available. |
| 9 | Event payload + fake transport | Event shape `{ topic, type, payload, meta? }` with open `type` string union. Two fake transports: `fakeTransport()` (synchronous, in-memory, for `.spec.tsx`) + `broadcastChannelTransport()` (cross-tab, used in demo). |

## 5. Module layout

New feature folder, sibling of `admin/`. Layering: `realtime → admin → ui` (one-way; `admin/` never imports `realtime/`).

```
src/components/realtime/
├── types.ts
├── topics.ts
├── realtime-data-provider.ts
├── add-events-for-mutations.ts
├── transports/
│   ├── websocket-transport.ts
│   ├── sse-transport.ts
│   ├── broadcast-channel-transport.ts
│   ├── fake-transport.ts
│   └── in-memory-lock-provider.ts          # demo + tests only
├── hooks/
│   ├── use-subscribe.ts
│   ├── use-subscribe-callback.ts
│   ├── use-subscribe-to-record.ts
│   ├── use-subscribe-to-record-list.ts
│   ├── use-publish.ts
│   ├── use-on-reconnect.ts                 # internal helper
│   ├── use-realtime-status.ts
│   ├── use-get-list-live.ts
│   ├── use-get-one-live.ts
│   ├── use-get-many-live.ts
│   ├── use-lock.ts
│   ├── use-unlock.ts
│   ├── use-get-lock.ts
│   ├── use-get-locks.ts
│   ├── use-get-lock-live.ts
│   ├── use-get-locks-live.ts
│   └── use-lock-on-mount.ts
├── list-live.tsx
├── edit-live.tsx
├── show-live.tsx
├── menu-live.tsx                           # exports MenuLive + MenuLiveItemLink
├── lock-on-mount.tsx
├── lock-status.tsx
└── index.ts                                # flat barrel of public exports
```

Rationale: `src/components/admin/` is already a feature folder mixing `.ts` (e.g. `bw-theme.ts`, `default-theme.ts`) and `.tsx`. The realtime folder follows that precedent. `.ts` and `.tsx` are split per file to avoid `react-refresh/only-export-components` warnings. `src/hooks/` is reserved for cross-cutting browser/system hooks (`use-mobile`, `use-theme`) and is intentionally not used here; `src/lib/` is reserved for shared utilities consumed by multiple features.

## 6. Type contract

`src/components/realtime/types.ts` — single source of truth. Zero `any`.

```ts
import type { DataProvider, Identifier } from 'ra-core';

export type RealtimeEventType =
  | 'created' | 'updated' | 'deleted'
  | 'locked'  | 'unlocked'
  | (string & {});

export interface RealtimeEvent<P = unknown> {
  topic: string;
  type: RealtimeEventType;
  payload: P;
  meta?: Record<string, unknown>;
}

export type SubscriptionCallback<P = unknown> = (event: RealtimeEvent<P>) => void;
export type Unsubscribe = () => void;

export interface Lock {
  resource: string;
  recordId: Identifier;
  identity: Identifier;
  createdAt: string;                                       // ISO 8601
}

export interface LockParams   { id: Identifier; identity: Identifier; meta?: Record<string, unknown>; }
export interface UnlockParams { id: Identifier; identity: Identifier; meta?: Record<string, unknown>; }
export interface GetLockParams  { id: Identifier; meta?: Record<string, unknown>; }
export interface GetLocksParams { meta?: Record<string, unknown>; }

export class LockConflictError extends Error {
  readonly kind = 'LockConflictError' as const;
  constructor(public readonly existingLock: Lock) {
    super(`Resource ${existingLock.resource}/${existingLock.recordId} is locked by ${existingLock.identity}`);
  }
}

export type RealtimeConnectionStatus = 'connected' | 'reconnecting' | 'disconnected' | 'idle';

export type RealtimeTransportErrorKind =
  | 'connect_failed'
  | 'auth_failed'
  | 'send_failed'
  | 'parse_failed'
  | 'handler_threw';

export interface RealtimeTransportError {
  kind: RealtimeTransportErrorKind;
  topic?: string;
  cause?: unknown;
  retrying: boolean;
}

export interface RealtimeTransport {
  subscribe<P = unknown>(topic: string, cb: SubscriptionCallback<P>): Unsubscribe;
  publish<P = unknown>(topic: string, event: Omit<RealtimeEvent<P>, 'topic'>): Promise<void>;
  connect?(): void;
  disconnect?(): void;
  onReconnect?(cb: () => void): Unsubscribe;
  onStatusChange?(cb: (status: RealtimeConnectionStatus) => void): Unsubscribe;
}

export interface LockProvider<R extends string = string> {
  lock(resource: R, params: LockParams): Promise<Lock>;
  unlock(resource: R, params: UnlockParams): Promise<Lock>;
  getLock(resource: R, params: GetLockParams): Promise<Lock | null>;
  getLocks(resource: R, params?: GetLocksParams): Promise<Lock[]>;
}

export interface RealtimeDataProvider<R extends string = string> extends DataProvider<R> {
  subscribe<P = unknown>(topic: string, cb: SubscriptionCallback<P>): Unsubscribe;
  publish<P = unknown>(topic: string, event: Omit<RealtimeEvent<P>, 'topic'>): Promise<void>;
  lock(resource: R, params: LockParams): Promise<Lock>;
  unlock(resource: R, params: UnlockParams): Promise<Lock>;
  getLock(resource: R, params: GetLockParams): Promise<Lock | null>;
  getLocks(resource: R, params?: GetLocksParams): Promise<Lock[]>;
  // Pass-through from transport so React hooks can access reconnect / status
  // events without holding a direct transport reference.
  onReconnect?(cb: () => void): Unsubscribe;
  onStatusChange?(cb: (status: RealtimeConnectionStatus) => void): Unsubscribe;
}

export interface RealtimeDataProviderOptions<R extends string = string> {
  locks?: LockProvider<R>;
}

export function realtimeDataProvider<R extends string = string>(
  baseDataProvider: DataProvider<R>,
  transport: RealtimeTransport,
  options?: RealtimeDataProviderOptions<R>,
): RealtimeDataProvider<R>;
```

Type-design notes:

- `meta` is `Record<string, unknown>` everywhere we own the type. ra-core's own `DataProvider` keeps `meta?: any`; we don't widen our additions to match (per project memory `feedback-tighten-ra-core-types`).
- Subscriber payload type carried as generic `<P = unknown>`. Default `unknown` forces callers to narrow.
- `LockConflictError` is a class with discriminant `kind: 'LockConflictError'` for safe pattern-matching across module boundaries.

## 7. Factory + `addEventsForMutations`

```ts
// realtime-data-provider.ts
export function realtimeDataProvider<R extends string = string>(
  baseDataProvider: DataProvider<R>,
  transport: RealtimeTransport,
  options: RealtimeDataProviderOptions<R> = {},
): RealtimeDataProvider<R> {
  const requireLocks = (method: string): LockProvider<R> => {
    if (!options.locks) {
      throw new Error(
        `realtimeDataProvider: ${method}() called but no LockProvider was configured. ` +
        `Pass { locks } in the third argument to enable locking.`,
      );
    }
    return options.locks;
  };

  return {
    ...baseDataProvider,
    subscribe: (topic, cb) => transport.subscribe(topic, cb),
    publish: (topic, event) => transport.publish(topic, event),
    lock:     (resource, params) => requireLocks('lock').lock(resource, params),
    unlock:   (resource, params) => requireLocks('unlock').unlock(resource, params),
    getLock:  (resource, params) => requireLocks('getLock').getLock(resource, params),
    getLocks: (resource, params) => requireLocks('getLocks').getLocks(resource, params),
  };
}
```

Pure function. No state. Connection management is the transport's responsibility (lazy connect on first subscribe). The `...baseDataProvider` spread copies every existing dataProvider method; if the base happens to already implement `subscribe`/`publish`/`lock`/etc., the factory's own implementations overwrite them (intentional — we want the wrapped transport / lock-provider behavior, not whatever the base was doing).

```ts
// add-events-for-mutations.ts — opt-in
export function addEventsForMutations<R extends string = string>(
  baseDataProvider: DataProvider<R> | RealtimeDataProvider<R>,
  publisher: Pick<RealtimeDataProvider<R>, 'publish'>,
): DataProvider<R>;
```

`create` / `update` / `updateMany` / `delete` / `deleteMany` each await the underlying method, then publish:

- `create` → `resourceTopic(resource)` with `{ type: 'created', payload: { ids: [result.data.id] } }`.
- `update` → both `recordTopic(resource, id)` (`{ type: 'updated', payload: { id, data: result.data } }`) and `resourceTopic(resource)` (`{ type: 'updated', payload: { ids: [id] } }`).
- `updateMany` → `resourceTopic` only, with all affected ids.
- `delete` → both topics, type `'deleted'`, payload includes previous data on the record topic.
- `deleteMany` → `resourceTopic` only.

Documented warning: do not combine `addEventsForMutations` with a backend that already broadcasts its own writes (Supabase, Pusher) — events will duplicate. The opt-in nature makes this safe by default.

## 8. Topic helpers (`topics.ts`)

```ts
export const resourceTopic     = (resource: string)                  => `resource/${resource}`;
export const recordTopic       = (resource: string, id: Identifier)  => `resource/${resource}/${id}`;
export const lockResourceTopic = (resource: string)                  => `lock/${resource}`;
export const lockTopic         = (resource: string, id: Identifier)  => `lock/${resource}/${id}`;
```

No reverse parsers exported. Topics are opaque strings on the wire. Custom topics are also valid — `subscribe('chat/room-42', ...)` works.

## 9. Transports

All implement `RealtimeTransport`. Public `connect`/`disconnect` are optional; subscribe/publish must be implemented.

### 9.1 `webSocketTransport(config)`

```ts
export interface WebSocketTransportConfig {
  url: string | (() => string | Promise<string>);
  protocols?: string | string[];
  getAuthToken?: () => string | Promise<string>;
  authMode?: 'query' | 'subprotocol';                  // default 'query'
  reconnect?: {
    enabled?: boolean;                                  // default true
    initialDelayMs?: number;                            // default 1_000
    maxDelayMs?: number;                                // default 30_000
    maxAttempts?: number;                               // default Infinity (after auth_failed: 3)
    jitter?: number;                                    // default 0.3
  };
  idleDisconnectMs?: number;                            // default 30_000
  heartbeatMs?: number;                                 // default 30_000
  onError?: (error: RealtimeTransportError) => void;
}

export function webSocketTransport(config: WebSocketTransportConfig): RealtimeTransport;
```

**Wire protocol** (mandatory for server authors):

Client → server:
```
{ "op": "subscribe",   "topic": "resource/posts" }
{ "op": "unsubscribe", "topic": "resource/posts" }
{ "op": "publish",     "topic": "resource/posts", "event": { "type": "created", "payload": { "ids": [42] } } }
{ "op": "ping" }
```

Server → client:
```
{ "topic": "resource/posts", "type": "created", "payload": { "ids": [42] } }
{ "op": "pong" }
```

Reconnect behavior:
- On clean close (server-initiated, code 1000): no reconnect.
- On unclean close: exponential backoff with jitter, resubscribe all active topics on `open`, fire `onReconnect` listeners.
- Heartbeat: send `{ "op": "ping" }` every `heartbeatMs`; if no `pong` arrives within `heartbeatMs / 3` (matching idiomatic WS keepalive ratios), treat the connection as broken and reconnect. Set `heartbeatMs: 0` to disable for servers that don't implement the ping/pong opcodes.

### 9.2 `sseTransport(config)`

```ts
export interface SSETransportConfig {
  url: string | (() => string | Promise<string>);
  publishUrl?: string | (() => string | Promise<string>);
  getAuthToken?: () => string | Promise<string>;        // appended to URL
  withCredentials?: boolean;
  reconnect?: { enabled?: boolean; initialDelayMs?: number; maxDelayMs?: number; jitter?: number };
  idleDisconnectMs?: number;
  topicFilterParam?: string;                            // default 'topics'
  onError?: (error: RealtimeTransportError) => void;
}

export function sseTransport(config: SSETransportConfig): RealtimeTransport;
```

**Wire protocol**:

Server-Sent Events stream at `url`:

```
event: resource/posts
id: 12345
data: {"type":"updated","payload":{"ids":[42]}}

```

Client requests via the URL query string `?<topicFilterParam>=resource/posts,resource/comments`. On reconnect, the browser-native `EventSource` sets `Last-Event-ID` automatically; server is expected to replay from there.

Publish: POST to `publishUrl` (JSON body `{ topic, event }`) when configured. If unconfigured, `publish` rejects with `Error("sseTransport: publish requires publishUrl in config")`.

### 9.3 `broadcastChannelTransport(config)`

```ts
export interface BroadcastChannelTransportConfig {
  channel: string;
}

export function broadcastChannelTransport(config: BroadcastChannelTransportConfig): RealtimeTransport;
```

Single `BroadcastChannel` for cross-tab sync. No reconnect. `connect`/`disconnect` open/close the channel. `onReconnect` no-ops. `onStatusChange` no-ops (always `'connected'` while channel is open). Used in the demo.

### 9.4 `fakeTransport(config?)`

```ts
export interface FakeTransportConfig {
  delayMs?: number;                                     // default 0
}

export interface FakeTransport extends RealtimeTransport {
  simulateReconnect(): void;
  publishedEvents: ReadonlyArray<{ topic: string; event: Omit<RealtimeEvent, 'topic'> }>;
}

export function fakeTransport(config?: FakeTransportConfig): FakeTransport;
```

In-memory `Map<topic, Set<callback>>`. `publish` invokes subscribers synchronously (or after `delayMs`). `simulateReconnect()` invokes all `onReconnect` listeners. `publishedEvents` is an append-only log for assertions.

### 9.5 `inMemoryLockProvider()` — demo + tests only

```ts
export interface InMemoryLockProviderOptions {
  publisher?: Pick<RealtimeTransport, 'publish'>;       // if provided, publishes lock/unlock events
}

export function inMemoryLockProvider<R extends string = string>(
  options?: InMemoryLockProviderOptions,
): LockProvider<R>;
```

Pure-memory `Map<string, Lock>` keyed by `resource/recordId`. `lock` throws `LockConflictError(existingLock)` when held by another identity. Demo wires this up with the `broadcastChannelTransport` to make locks visible across tabs.

### 9.5b RealtimeDataProvider pass-through

The factory copies `onReconnect` and `onStatusChange` from the transport onto
the returned `RealtimeDataProvider` (when the transport defines them). Hooks
observe reconnect or connection-status events through
`useDataProvider<RealtimeDataProvider>()` — no separate transport context is
required, keeping consumer setup as a single `realtimeDataProvider(...)` call.

### 9.6 Cross-cutting transport rules

- `getAuthToken` is invoked fresh on each connect / reconnect, never cached.
- Topic strings are opaque to transports; no parsing.
- Subscriber callbacks are isolated by `try/catch`: a throwing handler fires `onError({ kind: 'handler_threw' })` and never affects siblings.
- After-auth-failure backoff caps at 3 attempts by default (configurable via `reconnect.maxAttempts`); after that, `onError({ kind: 'auth_failed', retrying: false })` fires and reconnection stops.
- Internal subscription registry types are widened to `Set<SubscriptionCallback<unknown>>`. Public-facing `subscribe<P>` casts the callback param at the boundary.

## 10. Hooks

All hooks live under `src/components/realtime/hooks/` and are exported through the flat barrel. Each is a thin wrapper.

### 10.1 Subscription hooks

```ts
export function useSubscribe<P = unknown>(
  topic: string,
  callback: SubscriptionCallback<P>,
  options?: { enabled?: boolean },
): void;

export function useSubscribeToRecord<P = unknown>(
  resource: string,
  id: Identifier | undefined,
  callback: SubscriptionCallback<P>,
  options?: { enabled?: boolean },
): void;

export function useSubscribeToRecordList<P = unknown>(
  resource: string,
  callback: SubscriptionCallback<P>,
  options?: { enabled?: boolean },
): void;

export function useSubscribeCallback(): <P = unknown>(
  topic: string,
  cb: SubscriptionCallback<P>,
) => Unsubscribe;

export function usePublish(): <P = unknown>(
  topic: string,
  event: Omit<RealtimeEvent<P>, 'topic'>,
) => Promise<void>;

export function useOnReconnect(callback: () => void, options?: { enabled?: boolean }): void;

export function useRealtimeStatus(): { status: RealtimeConnectionStatus; lastError: RealtimeTransportError | null };
```

- All read the dataProvider via `useDataProvider()` (ra-core).
- Callbacks are stashed in a ref; effect deps are `[topic, enabled]` only — no resub thrash on every render.
- `enabled: false` short-circuits before the effect runs. No spurious connections.
- `useSubscribeToRecord` no-ops if `id` is `undefined` (common during navigation).
- Throw a clear error at first call if the dataProvider doesn't implement `subscribe`/`publish`.

### 10.2 Live data hooks

```ts
export function useGetListLive<RecordType extends RaRecord = RaRecord>(
  resource: string,
  params?: GetListParams,
  options?: UseQueryOptions<GetListResult<RecordType>>,
): ReturnType<typeof useGetList<RecordType>>;

export function useGetOneLive<RecordType extends RaRecord = RaRecord>(
  resource: string,
  params: GetOneParams<RecordType>,
  options?: UseQueryOptions<GetOneResult<RecordType>>,
): ReturnType<typeof useGetOne<RecordType>>;

export function useGetManyLive<RecordType extends RaRecord = RaRecord>(
  resource: string,
  params: GetManyParams,
  options?: UseQueryOptions<GetManyResult<RecordType>>,
): ReturnType<typeof useGetMany<RecordType>>;
```

Behavior:

1. Calls the matching `useGetX` from ra-core (same return shape).
2. Subscribes to the appropriate topic (`resourceTopic`, `recordTopic`, or one `recordTopic` per id in `useGetManyLive`).
3. On any received event, invalidates the matching react-query cache:
   - `useGetListLive`: `queryClient.invalidateQueries({ predicate: q => q.queryKey[0] === resource })`.
   - `useGetOneLive`: same predicate (covers `getOne`, `getMany`, `getManyReference` for that record).
   - `useGetManyLive`: same predicate.
4. Also calls `useOnReconnect(invalidate)` — broad invalidation when the transport reconnects.

Query-key compatibility note: live hooks invalidate via the resource string at `queryKey[0]`. This matches ra-core's `useGetList`/`useGetOne` key layout as of ra-core 5.14. A spec asserts this assumption; if a future ra-core release changes the key shape, this spec breaks and we know to update.

### 10.3 Lock hooks

```ts
export function useLock<R extends string = string>(): {
  lock: (resource: R, params: Omit<LockParams, 'identity'> & { identity?: Identifier }) => Promise<Lock>;
  isLoading: boolean;
  error: Error | null;
};

export function useUnlock<R extends string = string>(): {
  unlock: (resource: R, params: Omit<UnlockParams, 'identity'> & { identity?: Identifier }) => Promise<Lock>;
  isLoading: boolean;
  error: Error | null;
};

export function useGetLock<R extends string = string>(
  resource: R,
  params: GetLockParams,
  options?: UseQueryOptions<Lock | null>,
): { data: Lock | null | undefined; isLoading: boolean; error: Error | null };

export function useGetLocks<R extends string = string>(
  resource: R,
  options?: UseQueryOptions<Lock[]>,
): { data: Lock[] | undefined; isLoading: boolean; error: Error | null };

export function useGetLockLive<R extends string = string>(
  resource: R,
  params: GetLockParams,
  options?: UseQueryOptions<Lock | null>,
): ReturnType<typeof useGetLock<R>>;

export function useGetLocksLive<R extends string = string>(
  resource: R,
  options?: UseQueryOptions<Lock[]>,
): ReturnType<typeof useGetLocks<R>>;

export function useLockOnMount<R extends string = string>(options?: {
  resource?: R;
  id?: Identifier;
  identity?: Identifier;
  meta?: Record<string, unknown>;
  onLockError?: (error: Error) => void;
}): { lock: Lock | null; isLocking: boolean; lockError: Error | null };
```

- `useLock` / `useUnlock` resolve `identity` from `useGetIdentity()` when the caller omits it. Throw if no identity is available.
- `useLockOnMount` resolves all three of `resource`, `id`, `identity` from context by default (`useResourceContext`, `useRecordContext`, `useGetIdentity`).
- Live variants combine `useGetLock`/`useGetLocks` with `useSubscribe(lockTopic(...))` and `useOnReconnect`. On any lock event, invalidate the corresponding lock query.

## 11. Components

Six `.tsx` files in `src/components/realtime/`.

### 11.1 `<ListLive>` / `<EditLive>` / `<ShowLive>`

Drop-in replacements that take the exact prop type of `<List>` / `<Edit>` / `<Show>` and render the underlying view with a zero-render subscription sibling inside the resource/record context.

```tsx
export function ListLive(props: ListProps) {
  return (
    <List {...props}>
      <ListLiveSubscription />
      {props.children}
    </List>
  );
}

function ListLiveSubscription() {
  const resource = useResourceContext();
  const queryClient = useQueryClient();
  const invalidate = () => {
    if (!resource) return;
    queryClient.invalidateQueries({ predicate: q => q.queryKey[0] === resource });
  };
  useSubscribeToRecordList(resource ?? '', invalidate, { enabled: !!resource });
  useOnReconnect(invalidate, { enabled: !!resource });
  return null;
}
```

`<EditLive>` and `<ShowLive>` follow the same pattern, using `useSubscribeToRecord(resource, id, …)` and reading the record id from context. None of the three add new props.

### 11.2 `<MenuLive>` / `<MenuLiveItemLink>`

```ts
export interface MenuLiveItemLinkProps {
  to: string;
  resource: string;
  primaryText: ReactNode;
  icon?: ReactNode;
  events?: RealtimeEventType[];                          // default: ['created']
  badgeLabel?: (count: number) => ReactNode;             // default: count capped at 99+
}

export function MenuLiveItemLink(props: MenuLiveItemLinkProps): ReactElement;

export interface MenuLiveProps {
  items: ReadonlyArray<MenuLiveItemLinkProps>;
}

export function MenuLive(props: MenuLiveProps): ReactElement;
```

- Subscribes to `resourceTopic(resource)`. Increments a per-resource counter stored via ra-core's `useStore('realtime.unread.<resource>', 0)` when the event type matches `events`.
- Resets count to 0 when `useLocation().pathname` starts with the menu item's `to` prop (so `to: '/posts'` matches both `/posts` and `/posts/42`).
- Renders the underlying menu item with a `<Badge>` from `components/ui/badge.tsx` appended when count > 0.

### 11.3 `<LockOnMount>`

```ts
export interface LockOnMountProps {
  children: ReactNode;
  resource?: string;
  id?: Identifier;
  identity?: Identifier;
  meta?: Record<string, unknown>;
  loading?: ReactNode;                                   // default: small Skeleton
  lockedBy?: (lock: Lock) => ReactNode;                  // default: alert "Locked by {identity}"
  onLockError?: (error: Error) => void;
}

export function LockOnMount(props: LockOnMountProps): ReactElement;
```

- Internally calls `useLockOnMount(...)`. Renders `loading` while pending; `children` when granted; `lockedBy(lock)` when conflict.
- Live lock state via `useGetLockLive` so the UI flips back to `children` if the conflicting holder releases.
- Best-effort unlock on unmount; failures go to `onLockError`.

### 11.4 `<LockStatus>`

```ts
export interface LockStatusProps {
  resource?: string;
  id?: Identifier;
  renderLock?: (lock: Lock) => ReactNode;                // default: "Locked by {identity}"
  renderFree?: () => ReactNode;                          // default: null
}

export function LockStatus(props: LockStatusProps): ReactElement | null;
```

Small badge for list rows. Reads `useGetLockLive` and renders accordingly.

### 11.5 Public exports (`index.ts`)

Single flat barrel exporting every type, factory, transport, hook, helper, and component. Consumers import everything from `@/components/realtime`. No deep imports needed.

`useOnReconnect` is marked "internal helper" in the module layout but is exported from the barrel because it's load-bearing for anyone authoring a custom Live-style component (e.g. `<DataTableLive>` or a custom dashboard widget). The "internal helper" label refers only to its origin as glue for `useGetListLive`/`useGetOneLive`, not to its export visibility.

## 12. Error handling

### 12.1 Transport errors

Non-fatal errors surface through `config.onError`. Fatal errors throw at the call site (e.g. `sseTransport` `publish` when no `publishUrl`).

| Kind | Trigger | Retry behavior |
|------|---------|----------------|
| `connect_failed` | Initial open or reconnect attempt threw | Backoff retry, up to `maxAttempts` (default Infinity). |
| `auth_failed` | Server replied 401/403, or rejected handshake | Backoff retry with refreshed token; cap at 3 by default. |
| `send_failed` (publish) | WS frame or HTTP POST failed | `publish` Promise rejects. `onError` fires informationally. |
| `send_failed` (subscribe frame) | WS frame failed to send | Buffered, re-sent on next open. |
| `parse_failed` | Received malformed event | Event dropped; transport continues. |
| `handler_threw` | Subscriber callback raised | Caught; other subscribers still fire. |

### 12.2 Reconnect flow

```
disconnect (unclean)
  ↓
delay = min(initialDelay * 2^attempts, maxDelay) * (1 ± jitter)
  ↓
attempts++; if attempts > maxAttempts → onError({kind, retrying: false}); stop
  ↓
sleep(delay)
  ↓
getAuthToken() → connect
  ↓
on open → resend all active subscribe frames → fire onReconnect listeners
  ↓
queries listening via useOnReconnect re-fetch fresh data
```

No general event-replay guarantee. SSE supports `Last-Event-ID` natively; WS does not. Consumers (`useGetListLive` etc.) handle gaps via query invalidation.

### 12.3 Lock conflicts

`LockProvider.lock` throws `LockConflictError(existingLock)` when another identity holds it. `useLockOnMount` catches and exposes the conflicting `Lock`; `<LockOnMount>` renders the `lockedBy` slot. Consumers writing custom `LockProvider`s must throw `LockConflictError` to integrate with the kit's UI.

### 12.4 Component-level UX

- `<ListLive>` / `<EditLive>` / `<ShowLive>` — silent on transport errors. The underlying views already surface data-fetch errors via ra-core's `notify`.
- `<LockOnMount>` — surfaces lock errors via `onLockError` AND renders the `lockedBy` slot on `LockConflictError`.
- `<MenuLive>` — silent; badge stops updating.
- `useRealtimeStatus()` — for apps that want a visible "reconnecting…" indicator. Returns `'idle'` if the transport doesn't implement `onStatusChange`.

## 13. Testing strategy

### 13.1 Test buckets

| Bucket | Files | Notes |
|--------|-------|-------|
| Pure logic | `topics.spec.ts`, `realtime-data-provider.spec.ts`, `add-events-for-mutations.spec.ts`, `fake-transport.spec.ts` | Run in the existing vitest+Playwright harness. |
| Transport adapters | `broadcast-channel-transport.spec.ts`, `websocket-transport.spec.ts`, `sse-transport.spec.ts` | See 13.3 for WS/SSE infra. |
| Hooks | One `*.spec.tsx` per hook | `vitest-browser-react`. Small `<TestHarness>` surfaces state to the DOM. |
| Components | One `*.spec.tsx` per `.tsx` | Import stories from `src/stories/realtime/*.stories.tsx`. |
| Integration | `realtime-integration.spec.tsx` | Full chain: `fakeTransport` + factory + `<Admin>` + `<ListLive>`. Publish event → list refresh visible. |

### 13.2 Test wrapper

Add `RealtimeStoryAdmin` to `src/stories/_test-helpers.tsx`, alongside the existing `StoryAdmin`. AGENTS.md's contract is that `StoryAdmin` lives there ("create if missing"); the implementation plan resolves this by checking the file once and creating both helpers in the same edit if `StoryAdmin` doesn't yet exist. Stories use `RealtimeStoryAdmin`; specs import the stories and render them.

### 13.3 WS/SSE infrastructure

- **WebSocket:** add `mock-socket` to devDependencies. Tests configure a `Server` matching the transport's URL and exchange real frames in-browser.
- **SSE:** extend `vitest.global-setup.ts` to spin up a tiny Node `http` server emitting SSE frames. Bound port exposed via env var; transport configured to point at it. Teardown closes the server. Real `EventSource` exercises real parser + reconnect behavior.

### 13.4 Coverage targets

- Every transport: subscribe/unsubscribe round-trip, publish round-trip, reconnect with backoff timing, `onError` for each kind.
- Every hook: enabled-false short-circuit, callback ref freshness, unsubscribe-on-unmount.
- Every component: drop-in compatibility (same props as non-live equivalent), live update on event, reconnect behavior.
- `addEventsForMutations`: one event per CUD method, correct topics, correct types, no double-publish.

### 13.5 Explicit non-coverage

- Real third-party realtime services (Pusher, Mercure, Hasura, etc.).
- Network jitter beyond `fakeTransport.delayMs`.
- Multi-tab `BroadcastChannel` sync (Playwright single-context limitation). Demo covers visually.

## 14. Demo

`src/demo/App.realtime-demo.tsx` — new entry point alongside existing demos.

- Transport: `broadcastChannelTransport({ channel: 'shadcn-admin-realtime-demo' })`.
- Lock provider: `inMemoryLockProvider({ publisher: transport })`.
- `addEventsForMutations(baseDP, baseDP)` wired in so CUD operations broadcast across tabs.
- Resources demonstrate `<ListLive>`, `<EditLive>` + `<LockOnMount>`, `<ShowLive>`.
- Sidebar uses `<MenuLive>` with badge on `created` events.
- App bar widget reads `useRealtimeStatus()`.

The two-tab cross-tab story is the headline narrative: open in two tabs, edit in one, watch the other live-refresh and show a "locked by X" banner.

## 15. Documentation

Per-component / per-hook `.md` page under `docs/src/content/docs/`, following the existing **Usage → Props/Params → per-prop sections** structure.

Pages to add (full list):

- `Realtime.md` — overview, architecture diagram, transport decision tree, custom-transport guide, server protocol reference.
- `realtime-data-provider.md`
- `add-events-for-mutations.md`
- `websocket-transport.md`
- `sse-transport.md`
- `broadcast-channel-transport.md`
- `fake-transport.md`
- `in-memory-lock-provider.md`
- `use-subscribe.md`, `use-subscribe-to-record.md`, `use-subscribe-to-record-list.md`, `use-subscribe-callback.md`, `use-publish.md`, `use-on-reconnect.md`, `use-realtime-status.md`
- `use-get-list-live.md`, `use-get-one-live.md`, `use-get-many-live.md`
- `use-lock.md`, `use-unlock.md`, `use-get-lock.md`, `use-get-locks.md`, `use-get-lock-live.md`, `use-get-locks-live.md`, `use-lock-on-mount.md`
- `list-live.md`, `edit-live.md`, `show-live.md`, `menu-live.md`, `lock-on-mount.md`, `lock-status.md`

Also:

- Append a "Realtime" paragraph to `docs/src/content/docs/Guides-And-Concepts.md` linking to `Realtime.md`.
- Append a Realtime section to `AGENTS.md` documenting the new `realtime/` folder and the layering rule `realtime → admin → ui`.
- Add a one-bullet "Realtime" item to `README.md` Features section.
- Add an `[Unreleased]` entry to `CHANGELOG.md`.

The Astro docs site's Mermaid-or-equivalent capability for `Realtime.md` diagrams is verified at implementation time. Fall back to ASCII if Mermaid is unavailable.

## 16. Registry

Add a new top-level block to `registry.json`:

```jsonc
{
  "name": "realtime",
  "type": "registry:block",
  "title": "Shadcn Admin Kit Realtime",
  "description": "WebSocket/SSE/BroadcastChannel realtime extension for the dataProvider — live views, menu badges, record locks.",
  "registryDependencies": ["admin"],
  "dependencies": ["ra-core", "@tanstack/react-query", "react"],
  "devDependencies": ["mock-socket"],
  "files": [
    // every file under src/components/realtime/, including .ts and .tsx
    // plus src/stories/realtime/*.stories.tsx
    // plus docs/src/content/docs/Realtime.md and per-component pages
  ]
}
```

- No new prod-side third-party deps (every transport uses browser globals).
- `mock-socket` is dev-only, for WS transport tests.
- Block installs as `npx shadcn add realtime`. Single folder lands in `src/components/realtime/` on the consumer side.

## 17. Out of scope

- Server reference implementation (separate repo or doc page).
- Topic-level authorization (server's job).
- Conflict resolution beyond locking (OT, CRDT).
- Cross-tab multi-context Playwright tests.

## 18. Risks

- **ra-core query-key compatibility.** `useGetListLive` invalidates via `queryKey[0] === resource`. If ra-core changes its key shape, our invalidation silently misses. Mitigation: dedicated spec that asserts the assumption against the version we ship against; visible test failure on ra-core upgrade.
- **WS heartbeat divergence.** Not every server implements `op: 'ping'/'pong'`. Document the contract; servers that don't implement it will trigger spurious reconnects every `heartbeatMs`. Workaround: `heartbeatMs: 0` to disable.
- **SSE `publish` confusion.** Users picking SSE may expect bidirectional realtime. The error message at `publish` call sites without `publishUrl` is explicit; the docs page leads with the constraint.
- **Lock identity coupling.** `useLockOnMount` requires an `authProvider`. Apps without auth must pass `identity` explicitly. Documented prominently in the lock pages.
