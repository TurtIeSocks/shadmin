---
title: SavedQueries
---

`<SavedQueries>` renders saved list queries for the current resource.

## Usage

```tsx
import { SavedQueries } from "@/components/admin";

<SavedQueries />;
```

Before: teams had to infer this component from surrounding CRUD examples.

After: the component has a direct import example and a focused behavior note.

## Props

| Prop      | Required | Type     | Default | Description                       |
| --------- | -------- | -------- | ------- | --------------------------------- |
| className | Optional | `string` | -       | Extra classes for the query list. |

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
