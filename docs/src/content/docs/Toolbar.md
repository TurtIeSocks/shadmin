---
title: Toolbar
---

`<Toolbar>` renders form actions such as SaveButton in a consistent footer.

## Usage

```tsx
import { Toolbar } from '@/components/admin';

<Toolbar><SaveButton /></Toolbar>
```

Before: teams had to infer this component from surrounding CRUD examples.

After: the component has a direct import example and a focused behavior note.

## Props

| Prop | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| children | Optional | `ReactNode` | `<SaveButton />` | Toolbar actions. |

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
