---
title: "WebhookEndpointField"
---

Displays a webhook endpoint's URL and last-delivery status badge. The signing
secret is never rendered.

## Usage

```tsx
import { WebhookEndpointField } from '@/components/admin';

<WebhookEndpointField source="endpoint" />
```

## Storage shape

```ts
interface WebhookEndpoint {
  url: string;
  secret: string;
  eventTypes: readonly string[];
  lastDelivery?: { status: "ok" | "failed" | "pending"; at: string };
}
```

## Status badge

| Status     | Color  | Source |
| ---------- | ------ | ------ |
| `ok`       | green  | `lastDelivery.status === "ok"` |
| `failed`   | red    | `lastDelivery.status === "failed"` |
| `pending`  | muted  | `lastDelivery` is missing or `status === "pending"` |
