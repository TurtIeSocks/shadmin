---
title: "KanbanBoard"
---

`<KanbanBoard>` renders records from the parent `<List>` as a drag-and-drop Kanban board. Records are grouped into columns by an enum field (`status`, `stage`, `priority`, etc.). Dragging a card to another column calls `useUpdate` optimistically, so the UI updates immediately and rolls back on server error.

## Usage

```tsx
import { List, KanbanBoard } from "@/components/admin";

const TaskList = () => (
  <List perPage={500}>
    <KanbanBoard
      groupBy="status"
      columns={[
        { id: "todo", label: "To do" },
        { id: "doing", label: "In progress" },
        { id: "done", label: "Done" },
      ]}
      titleSource="title"
      descriptionSource="description"
    />
  </List>
);
```

Each column receives records whose `groupBy` field matches the column's `id`. Records with unrecognized values are silently ignored. Columns with no matching records render a "No items" placeholder that still accepts drops.

## Props

| Prop                | Required | Type                               | Default                   | Description                                                                                              |
| ------------------- | -------- | ---------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `groupBy`           | Required | `string`                           | —                         | Field name whose enum value buckets records into columns.                                                |
| `columns`           | Required | `Array<{ id; label; className? }>` | —                         | Column definitions in display order.                                                                     |
| `titleSource`       | Optional | `string`                           | `recordRepresentation`    | Field used as the card title. Falls back to the resource's `recordRepresentation` when omitted.          |
| `descriptionSource` | Optional | `string`                           | —                         | Optional secondary line rendered below the title.                                                        |
| `cardRenderer`      | Optional | `(record) => ReactNode`            | Default card              | Fully custom card. When provided, `titleSource` and `descriptionSource` are ignored.                     |
| `onCardClick`       | Optional | `(record) => void`                 | Navigate to show page     | Click handler for cards. Defaults to `navigate("/<resource>/<id>/show")`.                                |

## `columns`

Each entry in `columns` is an object with:

| Key         | Type     | Required | Description                                               |
| ----------- | -------- | -------- | --------------------------------------------------------- |
| `id`        | `string` | Yes      | Must match the enum value stored in the `groupBy` field.  |
| `label`     | `string` | Yes      | Human-readable column header.                             |
| `className` | `string` | No       | Extra CSS classes applied to the column wrapper element.  |

## `cardRenderer`

Override the default card layout with a custom renderer. The function receives the raw record and must return a `ReactNode`:

```tsx
<KanbanBoard
  groupBy="status"
  columns={columns}
  cardRenderer={(record) => (
    <div className="flex items-center gap-2">
      <PriorityBadge priority={record.priority} />
      <span>{record.title}</span>
    </div>
  )}
/>
```

## Drag behavior

The board wraps all columns in a single `@dnd-kit/core` `<DndContext>`. Each card is a `useDraggable` node (`aria-roledescription="draggable"`). Each column is a `useDroppable` node. When a card is released over a column, the column highlights with a primary ring.

On a successful drop the component calls:

```ts
update(resource, {
  id: record.id,
  data: { [groupBy]: targetColumnId },
  previousData: record,
}, { mutationMode: "optimistic" });
```

## Optimistic update

`mutationMode: "optimistic"` means the record moves to the target column immediately in the UI. If the server returns an error, react-admin rolls back the change and restores the record to its previous column. No additional configuration is required.

## Pagination note

Kanban boards work best with all records loaded at once. Use `perPage={500}` (or a value higher than your expected record count) on the parent `<List>` to avoid pagination cutting off cards:

```tsx
<List perPage={500}>
  <KanbanBoard ... />
</List>
```
