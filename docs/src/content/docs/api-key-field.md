---
title: "ApiKeyField"
---

Masked API-key display with reveal + copy buttons. Optional scope chips and
relative "last used" timestamp.

## Usage

```tsx
import { ApiKeyField } from '@/components/admin';

<ApiKeyField source="apiKey" />
<ApiKeyField
  source="apiKey"
  scopesSource="scopes"
  lastUsedSource="lastUsedAt"
/>
```

## Props

| Prop             | Required | Type                    | Default   | Description |
| ---------------- | -------- | ----------------------- | --------- | ----------- |
| `source`         | Required | `string`                | -         | Record field with the key |
| `scopesSource`   | Optional | `string`                | -         | Sibling field with scope strings |
| `lastUsedSource` | Optional | `string`                | -         | Sibling field with ISO timestamp |
| `maskedFormat`   | Optional | `"last4" \| "full"`     | `"last4"` | Masking strategy |
| `className`      | Optional | `string`                | -         | CSS class |

## Reveal

Reveal/hide toggles per render — the unmasked state lives in component state,
not in the record. Closing and reopening the view re-masks.
