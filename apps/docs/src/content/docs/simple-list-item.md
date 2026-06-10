---
title: "SimpleListItem"
---

A single row used internally by [`<SimpleList>`](./simple-list), also exported for manual composition.

## Usage

`<SimpleListItem>` reads the record from the surrounding [`<RecordContext>`](https://marmelab.com/react-admin/useRecordContext.html) (or from the `record` prop) and the resource from the [`<ResourceContext>`](https://marmelab.com/react-admin/Resource.html) (or from the `resource` prop). When a resource is available and `linkType` is not `false`, it wraps the row in a `<Link>` to the edit (default) or show page of the record.

```tsx
import { SimpleListItem } from "@/components/admin";

const PostRow = ({ record }: { record: Post }) => (
  <SimpleListItem record={record} linkType="show">
    <span className="font-medium">{record.title}</span>
  </SimpleListItem>
);
```

Most applications won't reach for `<SimpleListItem>` directly — `<SimpleList>` is usually enough. Use it when you need to compose your own row layout while keeping the same link / hover behavior.

## Props

| Prop        | Required | Type                        | Default      | Description                                        |
| ----------- | -------- | --------------------------- | ------------ | -------------------------------------------------- |
| `children`  | Required | `ReactNode`                 | -            | Content rendered inside the row                    |
| `record`    | Optional | `RaRecord`                  | From context | The record represented by this row                 |
| `resource`  | Optional | `string`                    | From context | The resource name used to build the link target    |
| `linkType`  | Optional | `"edit" \| "show" \| false` | `"edit"`     | Where to link the row                              |
| `rowIndex`  | Optional | `number`                    | -            | Optional zero-based index of the row               |
| `className` | Optional | `string`                    | -            | Extra Tailwind classes appended to the row element |

## `linkType`

Where to link when the user clicks the row. Defaults to `"edit"`. Pass `"show"` to link to the show page, or `false` to disable the link.

```tsx
<SimpleListItem linkType={false}>...</SimpleListItem>
```

When `linkType` is `false` (or no resource is available), the row is rendered as a plain `<li>` instead of a `<Link>`.

## `record`

By default, `<SimpleListItem>` reads the record from the surrounding `<RecordContext>`. Override it by passing the `record` prop explicitly — useful when you render items outside a list context:

```tsx
<SimpleListItem record={{ id: 1, title: "Hello" }} linkType={false}>
  Hello
</SimpleListItem>
```
