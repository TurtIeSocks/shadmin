// Realtime UI components (live-updating List/Edit/Show/Menu, lock status/mount).
// The headless realtime logic — hooks, transports, topics, types, and the
// realtime data-provider wrapper — now lives in `shadmin-core`; these components
// consume it from there. The non-component API is re-exported below so the old
// `@/components/realtime` barrel surface is preserved.

export { ListLive } from "./list-live";
export { EditLive } from "./edit-live";
export { ShowLive } from "./show-live";
export {
  MenuLive,
  MenuLiveItemLink,
  type MenuLiveProps,
  type MenuLiveItemLinkProps,
} from "./menu-live";
export { LockOnMount, type LockOnMountProps } from "./lock-on-mount";
export { LockStatus, type LockStatusProps } from "./lock-status";

// Headless realtime API (now sourced from shadmin-core).
export {
  realtimeDataProvider,
  addEventsForMutations,
  resourceTopic,
  recordTopic,
  lockResourceTopic,
  lockTopic,
  fakeTransport,
  broadcastChannelTransport,
  webSocketTransport,
  sseTransport,
  inMemoryLockProvider,
  LockConflictError,
  useSubscribe,
  useSubscribeToRecord,
  useSubscribeToRecordList,
  useSubscribeCallback,
  usePublish,
  useOnReconnect,
  useRealtimeStatus,
  useGetListLive,
  useGetOneLive,
  useGetManyLive,
  useLock,
  useUnlock,
  useGetLock,
  useGetLocks,
  useGetLockLive,
  useGetLocksLive,
  useLockOnMount,
} from "shadmin-core";
export type {
  RealtimeEvent,
  RealtimeEventType,
  SubscriptionCallback,
  Unsubscribe,
  Lock,
  LockParams,
  UnlockParams,
  GetLockParams,
  GetLocksParams,
  RealtimeConnectionStatus,
  RealtimeTransport,
  RealtimeTransportError,
  RealtimeTransportErrorKind,
  LockProvider,
  RealtimeDataProvider,
  RealtimeDataProviderOptions,
  FakeTransport,
  FakeTransportConfig,
  BroadcastChannelTransportConfig,
  WebSocketTransportConfig,
  WebSocketReconnectConfig,
  SSETransportConfig,
  SSEReconnectConfig,
  InMemoryLockProviderOptions,
  UseLockOnMountOptions,
} from "shadmin-core";
