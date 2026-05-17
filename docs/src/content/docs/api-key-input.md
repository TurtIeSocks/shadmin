---
title: "ApiKeyInput"
---

API-key rotation control. Renders a Rotate button that opens a confirmation
dialog. On confirm, fires `onRotate(record)` if provided, or sets the source
field to `null` so the server-side hook regenerates the key.

## Usage

```tsx
import { ApiKeyInput } from '@/components/admin';

<ApiKeyInput source="apiKey" />
<ApiKeyInput
  source="apiKey"
  onRotate={async (record) => await regenKeyServerSide(record.id)}
/>
```

## Props

| Prop       | Required | Type                                | Default | Description          |
| ---------- | -------- | ----------------------------------- | ------- | -------------------- |
| `source`   | Required | `string`                            | -       | Record field         |
| `resource` | Optional | `string`                            | Context | Override resource    |
| `onRotate` | Optional | `(record) => Promise<void> \| void` | -       | Custom rotation hook |
| `disabled` | Optional | `boolean`                           | `false` | Disable button       |

## Default rotation behavior

Without `onRotate`, the button calls `useUpdate(resource, { id, data: { [source]: null }, previousData })`. The server-side mutation is expected to regenerate the key and return the new value in the next read.
