---
title: "CalendarList"
---

`<CalendarList>` renders date-bound records as a calendar with month, week, and agenda views. It reads events from the parent `<List>` data flow, automatically loads the visible date range via filter injection, and optionally supports drag-and-drop event rescheduling via `@dnd-kit/core`.

## Usage

```tsx
import { List, CalendarList, Resource } from "@/components/admin";

const EventList = () => (
  <List perPage={500}>
    <CalendarList
      startSource="start_at"
      endSource="end_at"
      titleSource="title"
      colorSource="status"
      colorMap={{
        open: "bg-blue-500 text-white",
        confirmed: "bg-emerald-500 text-white",
        cancelled: "bg-rose-500 text-white",
      }}
      defaultView="month"
      onSelectSlot={(slot) =>
        navigate(`/events/create?start_at=${slot.startISO}`)
      }
      onDrop={async (record, { start, end }) => {
        await update("events", {
          id: record.id,
          data: { start_at: start, end_at: end },
        });
      }}
    />
  </List>
);
```

Press the prev/next/today buttons in the header to shift the visible range. The view switcher (Month / Week / Agenda) updates the layout in place.

## Props

| Prop             | Type                                                 | Default                | Description                                                                      |
| ---------------- | ---------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| `startSource`    | `string`                                             | —                      | Required. Field name holding the start timestamp (ISO 8601).                     |
| `endSource`      | `string`                                             | `undefined`            | If omitted, events render as point-events at `startSource`.                      |
| `titleSource`    | `string`                                             | `recordRepresentation` | Field rendered as event label.                                                   |
| `colorSource`    | `string`                                             | `undefined`            | Field whose value drives event color via `colorMap`.                             |
| `colorMap`       | `Record<string, string>`                             | `{}`                   | Mapping from `colorSource` values to a Tailwind class string.                    |
| `defaultView`    | `"month" \| "week" \| "agenda"`                      | `"month"`              | View shown on mount.                                                             |
| `views`          | `Array<"month" \| "week" \| "agenda">`               | all three              | Available views in the switcher.                                                 |
| `weekStartsOn`   | `0..6`                                               | `0` (Sun)              | First day of the week.                                                           |
| `onSelectEvent`  | `(record) => void`                                   | open Show              | Click handler for an event. Default navigates to `/{resource}/{id}/show`.        |
| `onSelectSlot`   | `(slot) => void`                                     | `undefined`            | Click handler for an empty day or hour cell.                                     |
| `onDrop`         | `(record, { start, end? }) => Promise<void> \| void` | `undefined`            | When provided, events become draggable. Drop fires this with new ISO timestamps. |
| `eventRenderer`  | `(props) => ReactNode`                               | default badge          | Custom event card.                                                               |
| `headerRenderer` | `(props) => ReactNode`                               | default header         | Custom toolbar.                                                                  |

## Range loading

Whenever the visible range changes (mount, prev/next/today, or view switch), `<CalendarList>` writes a range filter into the parent `<List>` filterValues:

```ts
setFilters({
  ...filterValues,
  [`${startSource}_gte`]: visibleRangeStart.toISOString(),
  [`${startSource}_lte`]: visibleRangeEnd.toISOString(),
});
```

Your `dataProvider` must translate `_gte` / `_lte` filter suffixes to its query language. `ra-data-fakerest`, `ra-data-json-server`, and `ra-data-supabase` already do this. Use `perPage={500}` on the parent `<List>` so month views don't paginate.

## Drag-and-drop

When `onDrop` is provided, the month view becomes interactive: events are `useDraggable` and day cells are `useDroppable` (via `@dnd-kit/core`). Dropping an event onto another day shifts its start to that day while preserving the time-of-day and duration. The drop handler receives the record and the new `{ start, end? }` ISO timestamps. Pair it with `useUpdate({ mutationMode: "optimistic" })` for the snappy UX.

```tsx
const [update] = useUpdate();
<CalendarList
  startSource="start_at"
  onDrop={(record, range) =>
    update(
      "events",
      { id: record.id, data: { start_at: range.start, end_at: range.end } },
      { mutationMode: "optimistic" },
    )
  }
/>;
```

Week and agenda views are not draggable in v1.

## i18n

All strings translate under `ra.calendar.*` via the i18nProvider:

- `ra.calendar.view.month`, `ra.calendar.view.week`, `ra.calendar.view.agenda`
- `ra.calendar.today`, `ra.calendar.previous`, `ra.calendar.next`
- `ra.calendar.no_events`

English fallbacks are inline at each call site.

## Out of scope (v1 deferred)

- Recurring events (RRULE).
- Multi-timezone display beyond the user's locale.
- Resource/swimlane view (rows = users).
- Week-view resize handles.
- Arrow-key cell navigation inside the grid.
