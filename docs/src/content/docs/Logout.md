---
title: Logout
---

`<Logout>` logs the current user out through the configured auth provider.

## Usage

```tsx
import { Logout } from '@/components/admin';

<Logout />
```

Before: teams had to infer this component from surrounding CRUD examples.

After: the component has a direct import example and a focused behavior note.

## Props

| Prop | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| className | Optional | `string` | - | Extra classes for the rendered action. |

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
