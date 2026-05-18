---
title: "SortButton"
---

Opens a popover allowing the user to change current list sort field & order.

## Usage

Used in a List Context (e.g. as a descendant of `<List>`) if there is no other sort control.

```tsx {6}
import { SortButton } from '@/components/admin';

const PostList = () => (
    <List render={({ data }) => (
        <div>
            <SortButton fields={["title", "published_at"]} />
            <ul>
                {data.map(post => (
                    <li key={post.id}>{post.title}</li>
                ))}
            </ul>
        </div>
    )}>
);
```

This button lets users pick the sort field, then the sort direction (ASC/DESC).

:::tip
`<DataTable>` column headers act as sort controls, so you don't need a separate `<SortButton>` if you're using `<DataTable>`.
:::

## Props

| Prop     | Required | Type                     | Default          | Description                            |
| -------- | -------- | ------------------------ | ---------------- | -------------------------------------- |
| `fields` | Required | `string[]`               | -                | Whitelist of sortable field names      |
| `icon`   | Optional | `ReactNode`              | Sort icon        | Custom icon                            |
| `label`  | Optional | `string`                 | `ra.action.sort` | i18n key                               |
| `ref`    | Optional | `Ref<HTMLButtonElement>` | -                | Forwarded to the underlying `<Button>` |

Additional props are passed to the underlying `<button>` element (e.g., `className`).

## `icon`

Replaces the default `<ArrowUpDown />` shown alongside the label. Pass any lucide-react icon to convey a different action.

## `ref`

Forwards a ref to the underlying `<Button>` element.

```tsx
import { useRef } from "react";
import { SortButton } from "@/components/admin";

const MyToolbar = () => {
  const ref = useRef<HTMLButtonElement>(null);
  return <SortButton fields={["title", "published_at"]} ref={ref} />;
};
```

```tsx
import { ListOrdered } from "lucide-react";
import { SortButton } from "@/components/admin";

<SortButton
  fields={["title", "published_at"]}
  icon={<ListOrdered className="size-4" />}
/>;
```

## `label`

By default, the button label is the translation of the `ra.sort.sort_by` key, which reads something like "Sort by Title Asc". It receives `%{field}` (the translated field label), `%{field_lower_first}` (same, but lowercased first letter), and `%{order}` (the translated sort direction).

You can customize the label for a specific resource by adding a `resources.{resource}.action.sort_by` key to your translation messages:

```js
const messages = {
  resources: {
    posts: {
      action: {
        sort_by: "Sorted by %{field_lower_first} (%{order})",
      },
    },
  },
};
```

You can also pass an alternative i18n key via the `label` prop, which is used as the fallback when no resource-specific key is found:

```tsx
<SortButton fields={["title", "published_at"]} label="myapp.action.sort_by" />
```
