---
title: sseTransport
---

`sseTransport` creates a `RealtimeTransport` backed by a Server-Sent Events connection. The SSE stream carries server-to-client events; publishing is done via a separate HTTP POST to `publishUrl`. Use this transport for dashboards and read-mostly apps where bidirectional communication is not required.

## Usage

```tsx
import { realtimeDataProvider, sseTransport } from "@/components/realtime";
import base from "./my-rest-data-provider";

const transport = sseTransport({
  url: "https://example.com/api/events",
  publishUrl: "https://example.com/api/events/publish",
  withCredentials: true,
});

const dataProvider = realtimeDataProvider(base, transport);
```

## Config

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `url` | `string` | — | SSE endpoint URL |
| `publishUrl` | `string` | — | HTTP POST endpoint for publishing. Required if `publish()` is called. |
| `getAuthToken` | `() => string \| Promise<string>` | — | Token factory; appended as `?token=…` to the SSE URL |
| `withCredentials` | `boolean` | `false` | Pass cookies on the `EventSource` request |
| `reconnect` | `SSEReconnectConfig` | see below | Reconnect behaviour |
| `idleDisconnectMs` | `number` | `30000` | Disconnect when no subscriptions remain for this long |
| `topicFilterParam` | `string` | `"topics"` | Query-param name used to tell the server which topics to stream |
| `onError` | `(err: RealtimeTransportError) => void` | — | Error callback |

### `reconnect`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable auto-reconnect |
| `initialDelayMs` | `number` | `1000` | First retry delay |
| `maxDelayMs` | `number` | `30000` | Cap on exponential back-off |
| `jitter` | `number` | `0.3` | Fraction added as random jitter |

## SSE frame format

The transport uses named events where the event name is the topic. Each `data` field contains a JSON object:

```
event: resource/posts
data: {"type":"created","payload":{"ids":[42]}}

event: resource/posts/42
data: {"type":"updated","payload":{"id":42,"data":{"title":"New title"}},"meta":{"requestId":"abc"}}
```

The `meta` field is optional.

## Publish wire format

`publish(topic, event)` sends an HTTP POST to `publishUrl` with:

```json
{
  "topic": "resource/posts",
  "event": { "type": "created", "payload": { "ids": [42] } }
}
```

## Notes

- Each time a new topic is subscribed, the transport re-opens the `EventSource` with an updated `topics=…` query param so the server knows which topics to filter. This means a brief reconnect on new subscriptions is expected.
- Calling `publish()` without a `publishUrl` throws immediately.
- The `EventSource` API does not support custom headers. Use `getAuthToken` for token-based auth (appended as a query param), or `withCredentials` for cookie-based auth.
- SSE is one-way (server → client) by design. If you need clients to push events directly to each other, consider `webSocketTransport` instead.
