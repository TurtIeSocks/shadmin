---
title: useSubscribeToRecord
---

`useSubscribeToRecord` subscribes to the `resource/<name>/<id>` topic for a single record. It is a thin wrapper around `useSubscribe` that builds the correct topic string.

## Usage

```tsx
import { useSubscribeToRecord } from "@/components/realtime";

function PostWatcher({ id }: { id: number }) {
  useSubscribeToRecord("posts", id, (event) => {
    if (event.type === "updated") {
      console.log("post updated", event.payload);
    }
  });
  return null;
}
```

## Params

| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `resource` | Required | `string` | Resource name |
| `id` | Required | `Identifier \| undefined` | Record ID. When `undefined`, the subscription is skipped. |
| `callback` | Required | `(event: RealtimeEvent) => void` | Called for each event on the record topic |
| `options.enabled` | Optional | `boolean` | Default `true`. Set to `false` to pause the subscription |

## Returns

`void`

## Notes

- The subscription is automatically disabled when `id` is `undefined` or `null`, so it is safe to pass a record ID that may not be available yet.
- The topic format is `resource/<resource>/<id>` — constructed by the `recordTopic()` helper.
