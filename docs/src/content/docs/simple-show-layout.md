---
title: SimpleShowLayout
---

`<SimpleShowLayout>` lays out Show fields in a vertical labeled stack.

## Usage

```tsx
import { SimpleShowLayout } from "@/components/admin";

<SimpleShowLayout>
  <TextField source="title" />
</SimpleShowLayout>;
```

Before: teams had to infer this component from surrounding CRUD examples.

After: the component has a direct import example and a focused behavior note.

## Props

| Prop     | Required | Type        | Default | Description                   |
| -------- | -------- | ----------- | ------- | ----------------------------- |
| children | Optional | `ReactNode` | -       | Fields to render with labels. |

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
