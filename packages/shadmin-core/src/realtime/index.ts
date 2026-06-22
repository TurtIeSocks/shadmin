// shadmin-core realtime — headless realtime logic (hooks, transports, topics,
// types, the realtime data-provider wrapper). The UI components that consume
// these (ListLive, EditLive, etc.) live in the shadmin registry and import
// them from "shadmin-core".

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
} from "./types";
export { LockConflictError } from "./types";

export { realtimeDataProvider } from "./realtime-data-provider";
export { addEventsForMutations } from "./add-events-for-mutations";

export {
  resourceTopic,
  recordTopic,
  lockResourceTopic,
  lockTopic,
} from "./topics";

export {
  fakeTransport,
  type FakeTransport,
  type FakeTransportConfig,
} from "./transports/fake-transport";
export {
  broadcastChannelTransport,
  type BroadcastChannelTransportConfig,
} from "./transports/broadcast-channel-transport";
export {
  webSocketTransport,
  type WebSocketTransportConfig,
  type WebSocketReconnectConfig,
} from "./transports/websocket-transport";
export {
  sseTransport,
  type SSETransportConfig,
  type SSEReconnectConfig,
} from "./transports/sse-transport";
export {
  inMemoryLockProvider,
  type InMemoryLockProviderOptions,
} from "./transports/in-memory-lock-provider";

export { useSubscribe } from "./hooks/use-subscribe";
export { useSubscribeToRecord } from "./hooks/use-subscribe-to-record";
export { useSubscribeToRecordList } from "./hooks/use-subscribe-to-record-list";
export { useSubscribeCallback } from "./hooks/use-subscribe-callback";
export { usePublish } from "./hooks/use-publish";
export { useOnReconnect } from "./hooks/use-on-reconnect";
export { useRealtimeStatus } from "./hooks/use-realtime-status";
export { useGetListLive } from "./hooks/use-get-list-live";
export { useGetOneLive } from "./hooks/use-get-one-live";
export { useGetManyLive } from "./hooks/use-get-many-live";
export { useLock } from "./hooks/use-lock";
export { useUnlock } from "./hooks/use-unlock";
export { useGetLock } from "./hooks/use-get-lock";
export { useGetLocks } from "./hooks/use-get-locks";
export { useGetLockLive } from "./hooks/use-get-lock-live";
export { useGetLocksLive } from "./hooks/use-get-locks-live";
export {
  useLockOnMount,
  type UseLockOnMountOptions,
} from "./hooks/use-lock-on-mount";
