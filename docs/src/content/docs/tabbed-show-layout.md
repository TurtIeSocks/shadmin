---
title: TabbedShowLayout
---

`<TabbedShowLayout>` groups Show fields into tabs.

## Usage

```tsx
import { TabbedShowLayout } from "@/components/admin";

<TabbedShowLayout>
  <TabbedShowLayout.Tab label="Main">
    <TextField source="title" />
  </TabbedShowLayout.Tab>
</TabbedShowLayout>;
```

Before: teams had to infer this component from surrounding CRUD examples.

After: the component has a direct import example and a focused behavior note.

## Props

| Prop     | Required | Type        | Default | Description                        |
| -------- | -------- | ----------- | ------- | ---------------------------------- |
| children | Required | `ReactNode` | -       | Tab definitions and field content. |

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
