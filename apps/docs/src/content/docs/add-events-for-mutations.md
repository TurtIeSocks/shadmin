---
title: addEventsForMutations
---

`addEventsForMutations` wraps a data provider so that its own write operations (`create`, `update`, `updateMany`, `delete`, `deleteMany`) automatically publish realtime events through a publisher (usually the same `RealtimeDataProvider`). This enables cross-tab data sync for apps where the backend does not broadcast writes itself.

## Usage

```tsx
import {
  realtimeDataProvider,
  addEventsForMutations,
  broadcastChannelTransport,
} from "@/components/realtime";
import base from "./my-rest-data-provider";

const transport = broadcastChannelTransport({ channel: "my-app" });
const rt = realtimeDataProvider(base, transport);

// Wrap so that writes publish events back through the transport
const dataProvider = addEventsForMutations(rt, rt);
```

Pass the result to `<Admin dataProvider={dataProvider}>`.

## Params

| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `baseDataProvider` | Required | `DataProvider \| RealtimeDataProvider` | The provider whose write methods you want to intercept |
| `publisher` | Required | `{ publish: RealtimeDataProvider["publish"] }` | Typically the same `RealtimeDataProvider` |

## Returns

A new `DataProvider` where each write method:

| Method | Events published |
|--------|-----------------|
| `create` | `resource/<name>` — type `created`, payload `{ ids: [newId] }` |
| `update` | `resource/<name>/<id>` — type `updated`; also `resource/<name>` with `{ ids: [id] }` |
| `updateMany` | `resource/<name>` — type `updated`, payload `{ ids: [...] }` |
| `delete` | `resource/<name>/<id>` — type `deleted`; also `resource/<name>` with `{ ids: [id] }` |
| `deleteMany` | `resource/<name>` — type `deleted`, payload `{ ids: [...] }` |

## Notes

- Skip this wrapper if your backend already broadcasts writes (e.g. Supabase realtime, Pusher webhooks, Hasura subscriptions) — wrapping in that case would emit duplicate events.
- The wrapper is transparent: all non-write methods (`getList`, `getOne`, etc.) are forwarded unchanged.
- The `publisher` argument accepts any object with a `publish` method, so you can point it at a different transport than the one used for subscriptions if needed.
