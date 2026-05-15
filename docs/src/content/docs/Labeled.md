---
title: Labeled
---

`<Labeled>` wraps a field with a translated label.

## Usage

```tsx
import { Labeled } from "@/components/admin";

<Labeled label="Title">
  <TextField source="title" />
</Labeled>;
```

Before: teams had to infer this component from surrounding CRUD examples.

After: the component has a direct import example and a focused behavior note.

## Props

| Prop  | Required | Type        | Default  | Description                        |
| ----- | -------- | ----------- | -------- | ---------------------------------- |
| label | Optional | `ReactNode` | inferred | Label shown above the child field. |

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
