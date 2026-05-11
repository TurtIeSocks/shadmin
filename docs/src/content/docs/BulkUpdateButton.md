---
title: "BulkUpdateButton"
---

Updates all selected records in a list with a fixed `data` payload.

## Usage

Use inside the `bulkActionsButtons` prop of a `<DataTable>` (which provides the necessary `ListContext`):

```tsx {5}
import { BulkUpdateButton, DataTable, List } from "@/components/admin";

const ResetViewsButton = () => (
  <BulkUpdateButton label="Reset Views" data={{ views: 0 }} />
);

export const PostList = () => (
  <List>
    <DataTable bulkActionsButtons={<ResetViewsButton />}>
      ...
    </DataTable>
  </List>
);
```

Defaults to `mutationMode="undoable"` — the update fires immediately and a notification with an undo button is shown. Pass `mutationMode="pessimistic"` (or use `<BulkUpdateWithConfirmButton>`) to ask the user to confirm before firing the mutation.

## Named exports

| Export                          | Behavior                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `BulkUpdateButton`              | Dispatches to one of the variants below based on `mutationMode` (default: `undoable`) |
| `BulkUpdateWithUndoButton`      | Fires immediately, shows undo notification                                          |
| `BulkUpdateWithConfirmButton`   | Opens a confirmation dialog, fires on confirm                                       |

## Props

| Prop              | Required | Type                                              | Default                  | Description                                            |
| ----------------- | -------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------ |
| `data`            | Required | `object`                                          | -                        | Object passed to `dataProvider.updateMany()`           |
| `className`       | Optional | `string`                                          | -                        | Additional classes                                     |
| `confirmContent`  | Optional | `ReactNode`                                       | `ra.message.bulk_update_content` | Confirmation dialog body (Confirm variant)     |
| `confirmTitle`    | Optional | `ReactNode`                                       | `ra.message.bulk_update_title`   | Confirmation dialog title (Confirm variant)    |
| `icon`            | Optional | `ReactNode`                                       | RefreshCw icon           | Custom icon                                            |
| `label`           | Optional | `string`                                          | `ra.action.update`       | i18n key / label                                       |
| `mutationMode`    | Optional | `"undoable" \| "optimistic" \| "pessimistic"`     | `undoable`               | When to apply the mutation                             |
| `mutationOptions` | Optional | `UseUpdateManyOptions`                            | -                        | Forwarded to `useUpdateMany`                           |
| `resource`        | Optional | `string`                                          | From context             | Resource name                                          |
| `successMessage`  | Optional | `string`                                          | -                        | Custom success i18n key                                |
| `variant`         | Optional | shadcn button variant                             | `outline`                | Button style                                           |

## `mutationMode`

```tsx
{/* Default: optimistic update with undo notification */}
<BulkUpdateButton label="Reset Views" data={{ views: 0 }} />

{/* Equivalent */}
<BulkUpdateWithUndoButton label="Reset Views" data={{ views: 0 }} />

{/* Pessimistic with confirmation dialog */}
<BulkUpdateButton label="Reset Views" data={{ views: 0 }} mutationMode="pessimistic" />

{/* Equivalent */}
<BulkUpdateWithConfirmButton label="Reset Views" data={{ views: 0 }} />
```

## `label`

The default label is the translation of `ra.action.update`. Override per-resource via the `resources.{resource}.action.update` key, or pass `label` directly:

```tsx
<BulkUpdateButton label="Reset Views" data={{ views: 0 }} />
```
