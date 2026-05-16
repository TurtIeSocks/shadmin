---
title: "BulkEditDrawer"
---

Side-panel form for editing multiple selected records in batch. Opens a
right-side shadcn `<Sheet>` containing the supplied form children. On submit,
applies the touched-fields diff to every record in
`useListContext().selectedIds`.

## Usage

```tsx
import {
  BulkEditDrawer,
  DataTable,
  List,
  NumberInput,
  SelectInput,
} from '@/components/admin';

const BulkEditCategories = () => (
  <BulkEditDrawer label="Bulk edit">
    <SelectInput source="category" choices={CATEGORY_CHOICES} />
    <NumberInput source="price" />
  </BulkEditDrawer>
);

export const ProductList = () => (
  <List>
    <DataTable bulkActionsButtons={<BulkEditCategories />}>
      {/* ... */}
    </DataTable>
  </List>
);
```

## Props

| Prop        | Required | Type                                                   | Default            | Description |
| ----------- | -------- | ------------------------------------------------------ | ------------------ | ----------- |
| `children`  | Required | `ReactNode`                                            | -                  | Form inputs rendered inside the sheet |
| `label`     | Optional | `ReactNode`                                            | `"Edit selected"` | Trigger button label |
| `title`     | Optional | `ReactNode`                                            | `label`            | Sheet header title |
| `disabled`  | Optional | `boolean`                                              | `false`            | Disable trigger |
| `side`      | Optional | `"right" \| "bottom" \| "left" \| "top"`               | `"right"`          | Sheet side |
| `onSuccess` | Optional | `(diff, ids) => void`                                  | -                  | Callback after `useUpdateMany` resolves |

## Touched-field semantics

`BulkEditDrawer` reads `form.formState.dirtyFields` and only writes those
keys to `useUpdateMany`. Fields the user left untouched are preserved on each
record. Empty submissions short-circuit without a server round-trip.
