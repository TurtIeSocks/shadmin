---
title: useRealtimeStatus
---

`useRealtimeStatus` returns the current connection status of the realtime transport. Use it to show a connectivity indicator in the UI.

## Usage

```tsx
import { useRealtimeStatus } from "@/components/realtime";

function ConnectionBadge() {
  const { status } = useRealtimeStatus();

  const colors: Record<string, string> = {
    connected: "bg-green-500",
    reconnecting: "bg-yellow-500",
    disconnected: "bg-red-500",
    idle: "bg-gray-300",
  };

  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />
  );
}
```

## Params

None.

## Returns

| Field | Type | Description |
|-------|------|-------------|
| `status` | `RealtimeConnectionStatus` | Current connection state |
| `lastError` | `RealtimeTransportError \| null` | Most recent transport error (currently always `null`; reserved for future use) |

### `RealtimeConnectionStatus` values

| Value | Meaning |
|-------|---------|
| `"connected"` | Transport is open and healthy |
| `"reconnecting"` | Connection was lost; a reconnect attempt is in progress |
| `"disconnected"` | Transport is not connected and not attempting to reconnect |
| `"idle"` | Transport does not implement `onStatusChange` (e.g. BroadcastChannel, fake) |

## Notes

- Returns `"idle"` when the transport does not implement `onStatusChange`. This includes `broadcastChannelTransport` and `fakeTransport`.
- `webSocketTransport` does not currently call `onStatusChange`, so status stays at `"disconnected"` until that is added. Use `onReconnect` as a proxy for reconnect events today.
- The initial value is `"disconnected"` for transports that declare `onStatusChange`, and `"idle"` for those that don't.
