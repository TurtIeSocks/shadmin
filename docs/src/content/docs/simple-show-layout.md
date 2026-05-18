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

| Prop       | Required | Type        | Default | Description                                     |
| ---------- | -------- | ----------- | ------- | ----------------------------------------------- |
| `children` | Optional | `ReactNode` | -       | Fields to render with labels.                   |
| `divider`  | Optional | `ReactNode` | -       | Divider element inserted between each field row |
| `record`   | Optional | `RaRecord`  | -       | Override the record from the RecordContext      |
| `spacing`  | Optional | `number`    | `1`     | Gap between field rows (Tailwind `gap-{n}`)     |

## `spacing`

Controls the vertical gap between field rows using Tailwind's `gap-{n}` utility. Defaults to `1`. Increase it to add more breathing room:

```tsx
import { Show, SimpleShowLayout, RecordField } from "@/components/admin";

export const PostShow = () => (
  <Show>
    <SimpleShowLayout spacing={4}>
      <RecordField source="title" />
      <RecordField source="body" />
      <RecordField source="author" />
    </SimpleShowLayout>
  </Show>
);
```

## `record`

By default, `<SimpleShowLayout>` reads the current record from the nearest `RecordContext`. Pass a `record` prop to override it — useful when you want to display a different record inline:

```tsx
import { SimpleShowLayout, RecordField } from "@/components/admin";

export const InlinePost = ({ post }: { post: RaRecord }) => (
  <SimpleShowLayout record={post}>
    <RecordField source="title" />
    <RecordField source="body" />
  </SimpleShowLayout>
);
```

## `divider`

Pass a React node as `divider` to render a separator between each field row. The divider is inserted after every child except the last:

```tsx
import { Show, SimpleShowLayout, RecordField } from "@/components/admin";
import { Separator } from "@/components/ui/separator";

export const PostShow = () => (
  <Show>
    <SimpleShowLayout divider={<Separator />}>
      <RecordField source="title" />
      <RecordField source="body" />
      <RecordField source="author" />
    </SimpleShowLayout>
  </Show>
);
```

## Behavior

Use this component inside the matching ra-core context. For example, list helpers belong inside a list, form helpers belong inside a form, and show-layout helpers belong inside a show view.
