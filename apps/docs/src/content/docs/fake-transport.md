---
title: fakeTransport
---

`fakeTransport` creates an in-memory `RealtimeTransport` designed for tests. It delivers events synchronously within the same process, exposes a log of all published events, and lets you trigger reconnect callbacks on demand.

## Usage

```tsx
import { fakeTransport, realtimeDataProvider } from "@/components/realtime";
import base from "./my-rest-data-provider";

const transport = fakeTransport();
const dataProvider = realtimeDataProvider(base, transport);
```

### In tests

```ts
import { fakeTransport } from "@/components/realtime";

const transport = fakeTransport();

// Publish an event to a topic
await transport.publish("resource/posts", { type: "created", payload: { ids: [1] } });

// Inspect all published events
console.log(transport.publishedEvents);
// [{ topic: "resource/posts", event: { type: "created", payload: { ids: [1] } } }]

// Simulate a reconnect (fires all onReconnect listeners)
transport.simulateReconnect();
```

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `delayMs` | `number` | `0` | Artificial async delay between publish and delivery — useful for testing loading states |
| `onError` | `(err: RealtimeTransportError) => void` | — | Called when a subscriber callback throws |

## `FakeTransport` interface

Beyond the standard `RealtimeTransport` methods, `fakeTransport` returns a `FakeTransport` with two extra members:

| Member | Type | Description |
|--------|------|-------------|
| `publishedEvents` | `ReadonlyArray<{ topic: string; event: Omit<RealtimeEvent, "topic"> }>` | Ordered log of every `publish()` call |
| `simulateReconnect()` | `() => void` | Calls all `onReconnect` listeners, as if the connection dropped and came back |

## Notes

- Events are delivered synchronously (unless `delayMs > 0`) — no `await` needed between `publish` and checking subscriber side-effects in most test frameworks.
- `publishedEvents` grows indefinitely; create a new `fakeTransport()` instance per test to avoid cross-test contamination.
- `fakeTransport` has no `onStatusChange` implementation. `useRealtimeStatus` returns `"idle"` when used with this transport.
- Use `simulateReconnect()` to test that components invalidate their queries and recover correctly after a connection drop.
