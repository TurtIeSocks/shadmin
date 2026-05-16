---
title: "WebhookEndpointInput"
---

Composite input for a webhook endpoint. Edits the URL, signing secret, and
event-type subscriptions. Optionally renders a test-ping button.

## Usage

```tsx
import { WebhookEndpointInput } from '@/components/admin';

const EVENT_TYPES = ["order.created", "order.updated", "user.created"];

<WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
<WebhookEndpointInput
  source="endpoint"
  eventTypes={EVENT_TYPES}
  onTestPing={async (url, secret) => {
    await fetch("/api/webhook-ping", { method: "POST", body: JSON.stringify({ url, secret }) });
  }}
/>
```

## Props

| Prop         | Required | Type                                                | Default | Description |
| ------------ | -------- | --------------------------------------------------- | ------- | ----------- |
| `source`     | Required | `string`                                            | -       | Form field |
| `eventTypes` | Required | `readonly string[]`                                 | -       | Selectable events |
| `onTestPing` | Optional | `(url, secret) => Promise<void> \| void`            | -       | Test-ping handler |
| `disabled`   | Optional | `boolean`                                           | `false` | Disable inputs |
| `label`      | Optional | `string \| false`                                   | Inferred | Custom label |
| `helperText` | Optional | `ReactNode`                                         | -       | Helper text |

## Storage shape

Composite object — see `<WebhookEndpointField>` for the type definition.
