---
title: SelectAllButton
---

`<SelectAllButton>` selects every record in the current list up to a configurable limit.

## Usage

```tsx
import { SelectAllButton } from "@/components/admin";

<SelectAllButton limit={250} />;
```

Before: teams had to infer this component from surrounding CRUD examples.

After: the component has a direct import example and a focused behavior note.

## Props

| Prop    | Required | Type                     | Default | Description                            |
| ------- | -------- | ------------------------ | ------- | -------------------------------------- |
| `limit` | Optional | `number`                 | `250`   | Maximum number of records to select.   |
| `ref`   | Optional | `Ref<HTMLButtonElement>` | -       | Forwarded to the underlying `<Button>` |

## `ref`

Forwards a ref to the underlying `<Button>` element.

```tsx
import { useRef } from "react";
import { SelectAllButton } from "@/components/admin";

const MyBulkToolbar = () => {
  const ref = useRef<HTMLButtonElement>(null);
  return <SelectAllButton ref={ref} />;
};
```

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
