---
title: FieldsSelector
---

`<FieldsSelector>` renders a checkbox list for choosing which configurable fields are visible.

## Usage

```tsx
import { FieldsSelector } from '@/components/admin';

<FieldsSelector fields={[{ source: "title", label: "Title" }]} />
```

Before: teams had to infer this component from surrounding CRUD examples.

After: the component has a direct import example and a focused behavior note.

## Props

| Prop | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| fields | Optional | `FieldToggle[]` | `[]` | Field definitions exposed to the selector. |

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
