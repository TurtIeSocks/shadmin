---
title: "EditButton"
---

Link button to the edit page of the current record.

## Usage

Use it inside a `RecordContext`, for example in the actions of a `<Show>` view, or in the rows of a `<DataTable>`.

```tsx {9}
import { DataTable, EditButton } from "@/components/admin";

const PostList = () => (
  <DataTable>
    <DataTable.Col source="title" />
    <DataTable.Col source="author" />
    <DataTable.Col source="published_at" />
    <DataTable.Col>
      <EditButton />
    </DataTable.Col>
  </DataTable>
);
```

On click, the button navigates to the `edit` route of the current resource and record (e.g., `/posts/123/edit`).

:::tip
In a `<DataTable>`, you can replace a column with an `<EditButton>` by using the `rowClick` prop to make the whole row clickable and navigate to the edit page:

```tsx
<DataTable rowClick="edit">
  <DataTable.Col source="title" />
  <DataTable.Col source="author" />
  <DataTable.Col source="published_at" />
</DataTable>
```

:::

## Props

| Prop          | Required | Type        | Default          | Description                    |
| ------------- | -------- | ----------- | ---------------- | ------------------------------ |
| `icon`        | Optional | `ReactNode` | Pencil icon      | Custom icon element            |
| `label`       | Optional | `string`    | `ra.action.edit` | i18n key / label               |
| `record`      | Optional | `RaRecord`  | From context     | Record used for id             |
| `resource`    | Optional | `string`    | From context     | Resource name                  |
| `scrollToTop` | Optional | `boolean`   | `true`           | Scroll to top after navigation |

## `icon`

Replaces the default `<Pencil />` shown alongside the label. Pass any React node — typically another lucide-react icon.

```tsx
import { FilePen } from "lucide-react";

<EditButton icon={<FilePen />} />;
```

## `label`

By default, the label is the translation of the `ra.action.edit` key, which reads "Edit".

You can customize the label for a specific resource by adding a `resources.{resource}.action.edit` key to your translation messages. It receives `%{name}` (singular resource name) and `%{recordRepresentation}` (string representation of the current record):

```js
const messages = {
  resources: {
    posts: {
      action: {
        edit: "Modify %{recordRepresentation}",
      },
    },
  },
};
```

You can also pass a custom string or translation key directly via the `label` prop:

```tsx
<EditButton label="Modify" />
<EditButton label="resources.posts.action.edit" />
```

## `ref`

Forwards a ref to the underlying `<Button>` element.

```tsx
import { useRef } from "react";

const ref = useRef<HTMLAnchorElement>(null);
<EditButton ref={ref} />;
```

## `scrollToTop`

When `true` (the default), the edit page scrolls to the top after navigation. Set to `false` to preserve the current scroll position.

```tsx
<EditButton scrollToTop={false} />
```
