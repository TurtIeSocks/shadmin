# Phase 2 — Record Keepers: `<RecordTimeline>`, `<DiffViewer>`, `<PresenceBar>`

**Date:** 2026-05-15
**Status:** Draft
**Phase:** 2 of 5

Combined spec + plan doc. Each component is small enough to share a doc.

---

## 1. `<RecordTimeline>`

### Goal

Render an activity/audit feed on a record's `<Show>` or `<Edit>` view: a vertical timeline of events (creates, field edits, state transitions, comments). Reads from a separate audit-log resource via `<ReferenceManyField>`, but accepts custom data via prop.

### Public API

```tsx
<Show>
  <SimpleShowLayout>
    <TextField source="name" />
    <RecordTimeline
      reference="audit_logs"
      target="record_id"
      sort={{ field: "created_at", order: "DESC" }}
      messageSource="message"
      timestampSource="created_at"
      userSource="user_name"
      iconSource="event_type"
      iconMap={{ created: PlusIcon, updated: EditIcon, deleted: TrashIcon }}
    />
  </SimpleShowLayout>
</Show>
```

Or with explicit data:

```tsx
<RecordTimeline
  entries={[
    {
      id: 1,
      message: "Created",
      timestamp: "2026-05-15T10:00:00Z",
      user: "alice",
    },
    {
      id: 2,
      message: "Updated price",
      timestamp: "2026-05-15T11:00:00Z",
      user: "bob",
    },
  ]}
/>
```

### Props

| Prop              | Type                            | Default                | Notes                                                        |
| ----------------- | ------------------------------- | ---------------------- | ------------------------------------------------------------ |
| `reference`       | `string`                        | —                      | Audit-log resource name. Required unless `entries` provided. |
| `target`          | `string`                        | —                      | Foreign-key field linking audit entries to records.          |
| `sort`            | `{ field; order }`              | `{ created_at, DESC }` |                                                              |
| `messageSource`   | `string`                        | `"message"`            | Field with the event description.                            |
| `timestampSource` | `string`                        | `"created_at"`         | Field with ISO timestamp.                                    |
| `userSource`      | `string`                        | `undefined`            | Field with the actor's display name.                         |
| `iconSource`      | `string`                        | `undefined`            | Field whose value selects an icon via `iconMap`.             |
| `iconMap`         | `Record<string, ComponentType>` | `{}`                   | Mapping event-type → icon.                                   |
| `entries`         | `TimelineEntry[]`               | `undefined`            | Override data source entirely.                               |
| `emptyLabel`      | `string`                        | translated             | Empty state.                                                 |

### Implementation outline

- Single file `src/components/admin/record-timeline.tsx`.
- When `entries` is set, render directly. Otherwise wrap in `<ReferenceManyFieldBase reference={...} target={...} sort={...}>` and read from `useListContext`.
- Render vertical layout: each entry has icon (left rail), timestamp, user, message.
- Use `formatRelative` from date-fns for human-readable timestamps.

### Tasks

1. **Scaffold + types + render entries prop** (one component file + spec + story).
2. **ReferenceMany data source + Show-view integration**.
3. **Icon mapping + relative timestamps + docs**.

Target: ~3 dispatches.

---

## 2. `<DiffViewer>`

### Goal

Compare two revisions of a record side-by-side. Shows added/removed/changed fields with highlighting. Useful inside `<RecordTimeline>` entries that represent updates, or as a standalone component.

### Public API

```tsx
<DiffViewer
  before={previousRecord}
  after={currentRecord}
  fields={["name", "price", "stock"]}
/>
```

### Props

| Prop         | Type                               | Default          | Notes                           |
| ------------ | ---------------------------------- | ---------------- | ------------------------------- |
| `before`     | `Record<string, unknown>`          | —                | Required. The earlier version.  |
| `after`      | `Record<string, unknown>`          | —                | Required. The current version.  |
| `fields`     | `string[]`                         | all keys         | Subset of fields to diff.       |
| `labels`     | `Record<string, string>`           | `{}`             | Map field name → display label. |
| `formatters` | `Record<string, (v) => ReactNode>` | `{}`             | Per-field value renderer.       |
| `mode`       | `"inline" \| "side-by-side"`       | `"side-by-side"` | Layout.                         |

### Implementation outline

- Single file `src/components/admin/diff-viewer.tsx`.
- For each field, compute `unchanged` / `added` / `removed` / `changed` and render with semantic Tailwind colors (e.g. `bg-emerald-500/10` for added, `bg-rose-500/10` for removed).
- Side-by-side: two columns, before on left, after on right, with `→` between rows.
- Inline: single column showing field name + value pairs with strikethrough for removed and underline for added.

### Tasks

1. **Scaffold + side-by-side mode + tests + docs** (single dispatch).
2. **Inline mode**.

Target: ~2 dispatches.

---

## 3. `<PresenceBar>`

### Goal

Show "who else is viewing/editing this record right now" as a stack of avatars in the Show/Edit header. Real-time collab indicator. Uses ra-core's `useSubscribe` to listen to a presence topic; emits presence updates via `useDataProvider`'s realtime extension OR a polling fallback.

### Public API

```tsx
<Show
  actions={
    <ShowActions>
      <PresenceBar />
    </ShowActions>
  }
>
  ...
</Show>
```

### Props

| Prop          | Type                    | Default                    | Notes                                                 |
| ------------- | ----------------------- | -------------------------- | ----------------------------------------------------- |
| `topic`       | `string`                | `presence/{resource}/{id}` | Pub/sub topic.                                        |
| `currentUser` | `{ id; name; avatar? }` | from `useGetIdentity()`    | Who I am.                                             |
| `maxAvatars`  | `number`                | `5`                        | How many to show before collapsing to "+N more".      |
| `heartbeatMs` | `number`                | `15000`                    | How often to broadcast presence.                      |
| `staleMs`     | `number`                | `30000`                    | After this many ms without heartbeat, drop from list. |

### Implementation outline

- Single file `src/components/admin/presence-bar.tsx`.
- On mount: subscribe via `useSubscribe(topic, handlePresenceUpdate)` from ra-core. Publish own presence via `dataProvider.publish?.(topic, currentUser)` every `heartbeatMs`.
- Track other users in component state with last-seen timestamps. Drop users whose last-seen is older than `staleMs`.
- Render `<AvatarGroup>` from new shadcn primitive. Show `+N more` when count exceeds `maxAvatars`.
- Fallback when no `subscribe` support: render nothing (no error).

### Tasks

1. **Scaffold + avatar rendering + heartbeat + subscription + tests + docs**.

Target: ~1-2 dispatches.

---

## Cross-cutting

- All three components are independent. Build in sequence: Timeline → Diff → Presence.
- i18n: `ra.record_timeline.*`, `ra.diff_viewer.*`, `ra.presence.*`.
- All stories use `<Admin commandMenu>` shorthand or full `<Admin>` setup as appropriate.
- Run lint + typecheck + tests in parallel after each feature.
