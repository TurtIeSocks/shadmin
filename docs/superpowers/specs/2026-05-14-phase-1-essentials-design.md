# Phase 1 — The Essentials: `<CommandMenu>`, `<CalendarList>`, `<CsvImport>`

**Date:** 2026-05-14
**Status:** Draft
**Phase:** 1 of 5 (Essentials)

## Phase overview

Phase 1 adds three foundational components that every modern admin app needs but
shadcn-admin-kit currently lacks:

1. **`<CommandMenu>`** — global cmd+K palette for cross-resource search and action running.
2. **`<CalendarList>`** — month/week/agenda view for date-bound resources.
3. **`<CsvImport>`** — counterpart to `<ExportButton>`: upload, map, preview, commit.

Each component is independent and can ship in its own PR. They share a small set of
cross-cutting decisions (lib picks, i18n namespace, testing pattern) documented at the
end of this spec.

The follow-on implementation plan splits the phase into three milestones (one per
component) with one merged PR each.

---

## 1. `<CommandMenu>`

### Goal

Provide a cmd+K (ctrl+K on Windows/Linux) global command palette that lets users
quickly navigate between resources, jump directly to records, and trigger registered
actions (logout, theme switch, custom commands). Mirrors the experience users now
expect from Linear, Stripe, Notion, Vercel, and similar modern dashboards.

### Non-goals

- Natural-language parsing or AI-driven intent. That is Phase 4 `<Assistant>`.
- Bulk actions across results — the palette is for single navigation/action invocations.
- Resource creation flow inside the palette (no "create new product" form). Pick the
  resource, the user navigates to the create view.
- Server-side search aggregation. The palette runs one `getList` per matching resource;
  consumers needing a federated search endpoint can use `<Assistant>` later.

### Public API

```tsx
// Shorthand — auto-mounts the default palette on the Admin shell
<Admin commandMenu dataProvider={dp}>
  <Resource name="products" />
  <Resource name="orders" />
</Admin>

// Or explicit element with customization
<Admin
  commandMenu={
    <CommandMenu
      hotkey={["mod+k"]}
      resources={["products", "orders"]}
      searchFields={{ products: "name", orders: "reference" }}
      perResourceLimit={5}
      actions={[
        { id: "go-home", label: "Go to dashboard", icon: HomeIcon, onSelect: () => navigate("/") },
      ]}
      placeholder="Search products, orders, or run a command…"
    />
  }
  dataProvider={dp}
>
  …
</Admin>
```

```tsx
// Open/close from anywhere
const { open, close, toggle, isOpen } = useCommandMenu();

// Register context-aware commands from a Show or Edit view
const ProductShowActions = () => {
  const record = useRecordContext<Product>();
  useRegisterCommand({
    id: "duplicate-product",
    label: "Duplicate this product",
    icon: CopyIcon,
    group: "actions",
    when: () => !!record,
    onSelect: () => duplicate(record.id),
  });
  return null;
};
```

### Props

#### `<CommandMenu>`

| Prop               | Type                                           | Default                               | Description                                                         |
| ------------------ | ---------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| `hotkey`           | `string[] \| false`                            | `["mod+k"]`                           | Hotkey bindings (mousetrap syntax). `false` opts out entirely.      |
| `resources`        | `string[]`                                     | all permitted                         | Resource allowlist. Defaults to every resource the user can `list`. |
| `searchFields`     | `Record<string, string>`                       | `{}`                                  | Per-resource override of the search field name. Defaults to `q`.    |
| `perResourceLimit` | `number`                                       | `5`                                   | Max records returned per resource per keystroke.                    |
| `recentsLimit`     | `number`                                       | `10`                                  | Max recents tracked in the empty state.                             |
| `actions`          | `CommandAction[]`                              | `[]`                                  | Extra static actions to register.                                   |
| `placeholder`      | `string`                                       | translated `Search…`                  | Input placeholder.                                                  |
| `searchDebounceMs` | `number`                                       | `200`                                 | Debounce before firing per-resource queries.                        |
| `groups`           | `Array<"resources" \| "records" \| "actions">` | `["records", "resources", "actions"]` | Order/visibility of result groups.                                  |

#### `CommandAction`

| Field      | Type                                              | Description                                        |
| ---------- | ------------------------------------------------- | -------------------------------------------------- |
| `id`       | `string`                                          | Stable identifier for dedup + unregister.          |
| `label`    | `string \| ReactNode`                             | Visible label.                                     |
| `icon`     | `ComponentType`                                   | Lucide-compatible icon component.                  |
| `group`    | `"resources" \| "records" \| "actions" \| string` | Group bucket. Custom groups render after defaults. |
| `keywords` | `string[]`                                        | Extra search keywords beyond `label`.              |
| `shortcut` | `string`                                          | Display hint (e.g. `mod+l`). Does not bind itself. |
| `when`     | `() => boolean`                                   | Visibility predicate.                              |
| `onSelect` | `() => void \| Promise<void>`                     | Action handler. Closes the palette on resolve.     |

### Result groups

1. **Records** (first, most useful) — for each allowed resource, run
   `dataProvider.getList({ filter: { q: input }, pagination: { perPage: perResourceLimit, page: 1 } })`
   debounced by `searchDebounceMs`. Render each record using the resource's
   `recordRepresentation`. Empty input → recents.
2. **Resources** — jump to the list view. Filtered by fuzzy match on resource label.
3. **Actions** — registered actions (built-in + consumer + via `useRegisterCommand`).

Built-in actions:

- `command-menu.logout` — calls `useLogout()`.
- `command-menu.theme-light` / `theme-dark` / `theme-system` — calls `useTheme().setTheme()`.
- `command-menu.locale-*` — one per available locale, when more than one is registered.
- `command-menu.refresh` — calls `useRefresh()` from ra-core.

### Internal architecture

```
<CommandMenu>                          ← root, owns dialog state + hotkey binding
 ├── <CommandDialog>                   ← shadcn primitive
 │    ├── <CommandInput>
 │    ├── <CommandList>
 │    │    ├── <CommandMenuRecents>    ← shown when input is empty
 │    │    ├── <CommandMenuRecords>    ← per-resource group, one <CommandGroup> each
 │    │    │    └── <CommandMenuResourceResults resource={r} q={debouncedInput} />
 │    │    ├── <CommandMenuResources>  ← navigation group
 │    │    └── <CommandMenuActions>    ← static + registered actions
 │    └── <CommandMenuFooter>          ← kbd hints using <Kbd /> ui primitive
 └── <CommandMenuContextProvider>      ← exposes register/unregister/open/close
```

- Recents persisted in ra-core `useStore("command-menu.recents", [])`.
- `useCommandMenu()` reads from the context; throws helpfully if used outside.
- `useRegisterCommand(action)` registers on mount, unregisters on unmount, with a
  stable `id` to dedupe across re-renders.
- Per-resource result components run `useGetList` independently and gracefully
  hide on `error` or empty.
- Permission filtering: `useCanAccess` check per resource before querying. Resources
  the user cannot list are silently skipped.

### Keyboard

- `mod+k` (configurable) toggles the palette.
- Up/down arrows navigate items, enter selects, esc closes. (Handled by cmdk.)
- Footer shows `↑↓` to navigate, `↵` to select, `esc` to close — built with the new
  `<Kbd>` primitive from the recent shadcn pull.

### Mobile

When `useIsMobile()` returns true, render inside `<Sheet>` (full-screen) instead of
`<Dialog>`. cmdk behaves identically; only the wrapper changes.

### i18n keys

All keys live under the `ra.command.*` namespace (extending ra-core's existing `ra.*`)
and use the inline-default pattern: `translate("ra.command.placeholder", { _: "Search…" })`.
No central English bundle — the fallback is inline at each call site.

| Key                              | Default                    |
| -------------------------------- | -------------------------- |
| `ra.command.placeholder`         | `Search or run a command…` |
| `ra.command.empty`               | `No results.`              |
| `ra.command.group.records`       | `Records`                  |
| `ra.command.group.resources`     | `Resources`                |
| `ra.command.group.actions`       | `Actions`                  |
| `ra.command.group.recents`       | `Recent`                   |
| `ra.command.action.refresh`      | `Refresh data`             |
| `ra.command.action.theme_light`  | `Switch to light theme`    |
| `ra.command.action.theme_dark`   | `Switch to dark theme`     |
| `ra.command.action.theme_system` | `Use system theme`         |
| `ra.command.footer.navigate`     | `Navigate`                 |
| `ra.command.footer.select`       | `Select`                   |
| `ra.command.footer.close`        | `Close`                    |

The logout action reuses ra-core's existing `ra.auth.logout` key.

### Test plan

Co-located `command-menu.spec.tsx` rendering Storybook story exports:

- `Basic` — opens via hotkey, closes on esc.
- `Records` — typing fires `getList` per resource and renders results.
- `Resources` — selecting a resource navigates to its list.
- `Actions` — registered action's `onSelect` fires and palette closes.
- `Recents` — selecting a record persists into `useStore`, reappears as recent.
- `Permission` — resource where `canList === false` is hidden silently.
- `Mobile` — renders inside a sheet via `useIsMobile` mock.
- `RegisterCommand` — context-registered commands appear and clear on unmount.

---

## 2. `<CalendarList>`

### Goal

Render a list of date-bound records (events, bookings, content schedules, deadlines)
in a calendar layout with month/week/agenda views, instead of (or alongside) the
default `<DataTable>`. Reuses the standard `<List>` data flow — no parallel fetcher.

### Non-goals

- Recurring events (RRULE). All events are stored as concrete time spans.
- Multi-timezone math. Assume the server stores ISO timestamps in UTC; render in
  the user's locale via `Intl.DateTimeFormat`.
- Swimlane/resource views (rows = users, columns = days). Punt to a later phase if
  demand emerges.
- Calendar-as-input for a `Create` form. Slot clicks emit `onSelectSlot`; consumers
  wire that into their own Create flow.

### Public API

```tsx
import { List, CalendarList } from "@/components/admin";

const EventList = () => (
  <List perPage={500} resource="events">
    <CalendarList
      startSource="start_at"
      endSource="end_at"
      titleSource="title"
      colorSource="status"
      colorMap={{ open: "blue", confirmed: "green", cancelled: "red" }}
      defaultView="month"
      views={["month", "week", "agenda"]}
      onSelectSlot={(slot) =>
        navigate(`/events/create?start_at=${slot.startISO}`)
      }
      onSelectEvent={(record) => navigate(`/events/${record.id}/show`)}
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

### Props

| Prop             | Type                                                                       | Default                | Description                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `startSource`    | `string`                                                                   | —                      | Required. Field name holding the start timestamp (ISO 8601).                                                                |
| `endSource`      | `string`                                                                   | `undefined`            | Optional. If omitted, events render as point-events at `startSource`.                                                       |
| `titleSource`    | `string`                                                                   | `recordRepresentation` | Field rendered as event label.                                                                                              |
| `colorSource`    | `string`                                                                   | `undefined`            | Field whose value drives event color via `colorMap`.                                                                        |
| `colorMap`       | `Record<string, string>`                                                   | `{}`                   | Mapping from `colorSource` values to a Tailwind class string (e.g. `"bg-blue-500 text-white"`). Applied to the event badge. |
| `defaultView`    | `"month" \| "week" \| "agenda"`                                            | `"month"`              | View shown on mount.                                                                                                        |
| `views`          | `Array<"month" \| "week" \| "agenda">`                                     | all three              | Available views in the header switcher.                                                                                     |
| `weekStartsOn`   | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`                                          | `0` (Sun)              | First day of the week. Passed through to date-fns.                                                                          |
| `onSelectEvent`  | `(record) => void`                                                         | open Show              | Click handler for an event. Default navigates to `/{resource}/{id}/show`.                                                   |
| `onSelectSlot`   | `(slot: { startISO; endISO; allDay }) => void`                             | `undefined`            | Click handler for an empty slot (month day cell or week time slot).                                                         |
| `onDrop`         | `(record, { start: ISO; end?: ISO }) => Promise<void>`                     | `undefined`            | Drop handler. When provided, events become draggable.                                                                       |
| `eventRenderer`  | `(props: { record; title; start; end?; color?; isDragging }) => ReactNode` | default badge          | Custom event card override.                                                                                                 |
| `headerRenderer` | `(props: { range; view; onNavigate; onViewChange }) => ReactNode`          | default header         | Custom toolbar override.                                                                                                    |

### Range loading

`<CalendarList>` pushes a range filter into the parent `<List>` whenever the visible
range changes (initial mount, prev/next/today, view switch):

```ts
setFilters({
  ...filterValues,
  [`${startSource}_gte`]: visibleRangeStart.toISOString(),
  [`${startSource}_lte`]: visibleRangeEnd.toISOString(),
});
```

The consumer's `dataProvider` is responsible for translating `_gte`/`_lte` suffixes to
its query language (ra-data-fakerest, ra-data-json-server, ra-data-supabase already
support this convention). A `perPage={500}` is recommended at the `<List>` level so
month views don't paginate; consumers can override.

### Drag and drop

When `onDrop` is provided, events become draggable with `@dnd-kit/core` (lean,
headless, a11y-friendly, already a peer-dep candidate). Drop targets:

- **Month view:** day cells. Drop preserves the event's duration, shifting start to
  the target day's start (or maintaining time-of-day if applicable).
- **Week view:** time slots (15-min increments). Drop snaps start to the slot.
- **Agenda view:** not draggable (linear list).

Resizing (changing event duration) is week-view only via a bottom-edge handle.

Updates fire through `useUpdate({ mutationMode: "optimistic" })` from ra-core, so the
event visually moves immediately and rolls back on server error.

### Internal architecture

```
<CalendarList>
 ├── <CalendarHeader>            ← prev/next/today + view switcher (Tabs variant="line")
 ├── <CalendarMonthView>         ← 6×7 grid of day cells
 │    └── <CalendarEvent>        ← rendered inside cells, draggable when onDrop set
 ├── <CalendarWeekView>          ← 7 columns × hour rows, time-snapped
 ├── <CalendarAgendaView>        ← flat list grouped by date
 └── <CalendarLiveRegion>        ← aria-live announcements for view/range changes
```

Pure rendering split: `<CalendarMonthView>` / `<CalendarWeekView>` / `<CalendarAgendaView>`
take `{ events, range, onSelectEvent, onSelectSlot, onDrop }` props and have no data
fetching of their own. They are usable standalone for consumers who want to skip the
ra-core `<List>` wrapper.

### Accessibility

- `role="grid"` on month view, with `role="row"` and `role="gridcell"`.
- Keyboard navigation between cells: arrow keys move focus, enter opens the event or
  fires `onSelectSlot`. Tab leaves the grid.
- `aria-live` region announces "Showing March 2026" on view/range change.
- Events have descriptive `aria-label` combining title + formatted time range.
- Drag/drop is keyboard-actuated via `@dnd-kit`'s sensor + screen-reader announcements.

### i18n keys

Under `ra.calendar.*` namespace, inline-default pattern (no central bundle).

| Key                       | Default            |
| ------------------------- | ------------------ |
| `ra.calendar.view.month`  | `Month`            |
| `ra.calendar.view.week`   | `Week`             |
| `ra.calendar.view.agenda` | `Agenda`           |
| `ra.calendar.today`       | `Today`            |
| `ra.calendar.previous`    | `Previous`         |
| `ra.calendar.next`        | `Next`             |
| `ra.calendar.no_events`   | `No events`        |
| `ra.calendar.showing`     | `Showing %{range}` |

### Test plan

Co-located `calendar-list.spec.tsx` from Storybook stories:

- `Month` — renders 6×7 grid with current month, today highlighted.
- `Week` — renders 7 columns with hour rows.
- `Agenda` — renders flat list grouped by date with `no_events` empty state.
- `Navigation` — prev/next/today shift the range and re-fire `setFilters`.
- `ViewSwitch` — switching views updates header + announces via aria-live.
- `SelectEvent` — clicking an event fires `onSelectEvent`.
- `SelectSlot` — clicking an empty slot fires `onSelectSlot` with ISO bounds.
- `Drag` — drag-drop in month view calls `onDrop` with correct new start date.
- `Resize` — resize handle in week view calls `onDrop` with new end timestamp.
- `Keyboard` — arrow-key nav moves focus, enter fires the right handler.

---

## 3. `<CsvImport>`

### Goal

Bulk-import data into a resource via a CSV file. Counterpart to the existing
`<ExportButton>`. Provides a four-step wizard (upload → map → preview → commit) that
shields the consumer from PapaParse details, column mapping UI, zod validation, and
batched `createMany` orchestration.

### Non-goals

- Update or upsert flows (matching existing records by key). Create-only v1.
- Multi-sheet xlsx parsing. Single-sheet CSV only in v1.
- Server-side validation echo (importer fetches per-row server errors). Consumers
  should pre-validate via the `schema` prop instead.
- Background/headless imports. The wizard runs synchronously in the user's session.

### Public API

```tsx
import { List, ListActions, CsvImport } from "@/components/admin";
import { z } from "zod";

const ProductImportSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  category: z.string().optional(),
});

const ProductList = () => (
  <List
    actions={
      <ListActions>
        <CsvImport
          schema={ProductImportSchema}
          mapping={{ name: "product_name", price: "unit_price" }}
          transform={(row) => ({ ...row, slug: slugify(row.name) })}
          batchSize={100}
          onComplete={({ created, failed }) =>
            notify(`Imported ${created}, ${failed} failed`, { type: "info" })
          }
        />
      </ListActions>
    }
  >
    …
  </List>
);
```

### Props

| Prop         | Type                             | Default             | Description                                                                   |
| ------------ | -------------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| `schema`     | `z.ZodObject<any>`               | `undefined`         | Zod schema used for per-row validation in the preview step.                   |
| `mapping`    | `Record<string, string>`         | `{}`                | Preset mapping `{ resourceField: csvHeader }`. User can override in step 2.   |
| `transform`  | `(row, index) => object`         | identity            | Row-level transformation applied after mapping, before validation.            |
| `batchSize`  | `number`                         | `100`               | Rows per `createMany` call. Falls back to sequential `create` if unsupported. |
| `parsers`    | `Array<"csv">`                   | `["csv"]`           | Allowed parsers. (Future: `"xlsx"` opt-in lazy-load. Out of scope v1.)        |
| `label`      | `string`                         | translated `Import` | Trigger button label.                                                         |
| `icon`       | `ComponentType`                  | `UploadIcon`        | Trigger button icon.                                                          |
| `resource`   | `string`                         | from context        | Override the target resource (rarely needed).                                 |
| `onComplete` | `(report: ImportReport) => void` | `undefined`         | Callback after commit step finishes (or is cancelled).                        |
| `onError`    | `(error: Error) => void`         | toast               | Callback when commit fails irrecoverably.                                     |

#### `ImportReport`

```ts
interface ImportReport {
  total: number;
  created: number;
  failed: number;
  errors: Array<{
    rowIndex: number;
    row: Record<string, unknown>;
    reason: string;
  }>;
}
```

### Wizard steps

Reuses `<WizardForm>` (just-merged) as the underlying chrome:

1. **Upload (`<WizardForm.Step label="Upload">`)**
   - Drag-and-drop zone (`react-dropzone`, already a dep) + click-to-pick.
   - PapaParse in streaming mode for files >5MB. Auto-detect delimiter (`,`, `;`, `\t`).
   - Parsed result stored in component state (not React Hook Form — could be 10k+ rows).
   - "Next" gated on a successful parse with ≥1 row.

2. **Map (`<WizardForm.Step label="Map columns">`)**
   - Two-column table: left = resource fields (derived from schema, or guessed from
     `dataProvider.getList({perPage:1})` if no schema), right = `<SelectInput>` of CSV
     headers.
   - Auto-match on mount: case-insensitive, space/underscore/dash-insensitive fuzzy
     header match (Levenshtein ≤2 or substring). Highlight required fields with
     `*` and tailwind `text-destructive`.
   - "Next" gated on every required field having a mapping.

3. **Preview (`<WizardForm.Step label="Preview">`)**
   - First 50 rows rendered as a `<Table>` from `ui/table.tsx` showing mapped+transformed
     values. Each row validated through `schema.safeParse` if present.
   - Invalid rows shown with destructive row background + error column listing
     zod issue paths.
   - Header strip: "X valid · Y errors · Z total" counters.
   - "Commit" button disabled when 0 valid rows; otherwise primary CTA.

4. **Commit (`<WizardForm.Step label="Importing…">`)**
   - Replaces wizard buttons with progress bar (`ui/progress.tsx`) and live counters.
   - Calls `dataProvider.createMany({ resource, data: batch })` in batches of
     `batchSize`. Falls back to `Promise.all` of single `create` calls when the
     provider lacks `createMany`.
   - Failed rows accumulated into `errors`. "Cancel" stops further batches; already-
     committed batches remain.
   - On finish: show summary screen with "Download errors as CSV" button (uses
     `papaparse.unparse` + same file-save helper as `<ExportButton>`).

### Internal architecture

```
<CsvImport>                          ← button + open/close state
 └── <WizardForm isOpen onClose title>
      ├── <CsvImportUploadStep>      ← parse + dryRun
      ├── <CsvImportMapStep>         ← column-to-field mapping
      ├── <CsvImportPreviewStep>     ← row-level validation
      └── <CsvImportCommitStep>      ← progress + report

<CsvImportContext>                   ← parsed rows, mapping, validation results, report
                                       (avoids RHF for the heavy data; RHF handles only
                                        the mapping form on step 2)
```

The wizard's `onSubmit` is unused — commit happens inside `<CsvImportCommitStep>`'s
effect on mount.

### Validation strategy

If `schema` is provided: zod parse per row, capture `error.issues` per field.
If no `schema` is provided: only required-mapping gating in step 2; no per-row
validation in step 3. Step 3 still renders the preview table so the user can
visually inspect.

### i18n keys

Under `ra.csv_import.*` namespace, inline-default pattern (no central bundle).

| Key                               | Default                                              |
| --------------------------------- | ---------------------------------------------------- |
| `ra.csv_import.button`            | `Import`                                             |
| `ra.csv_import.title`             | `Import %{resource}`                                 |
| `ra.csv_import.step.upload`       | `Upload`                                             |
| `ra.csv_import.step.map`          | `Map columns`                                        |
| `ra.csv_import.step.preview`      | `Preview`                                            |
| `ra.csv_import.step.commit`       | `Importing…`                                         |
| `ra.csv_import.drop_hint`         | `Drop a CSV file here or click to select`            |
| `ra.csv_import.row_count`         | `%{count} rows parsed`                               |
| `ra.csv_import.required_unmapped` | `Required fields are not mapped`                     |
| `ra.csv_import.counters`          | `%{valid} valid · %{errors} errors · %{total} total` |
| `ra.csv_import.commit`            | `Import %{count} rows`                               |
| `ra.csv_import.progress`          | `Importing %{current} of %{total}`                   |
| `ra.csv_import.complete`          | `Import complete`                                    |
| `ra.csv_import.download_errors`   | `Download error report`                              |

### Test plan

Co-located `csv-import.spec.tsx` from Storybook stories:

- `Upload` — drop a CSV fixture, "Next" enables, header detected.
- `AutoMap` — fields with matching headers auto-map on entry to step 2.
- `RequiredMapping` — "Next" disabled until required fields have mappings.
- `Validation` — invalid rows surface zod errors in preview.
- `Commit` — calls `dataProvider.createMany` in batches, fires `onComplete` with
  correct counts.
- `Fallback` — provider without `createMany` falls back to sequential `create`.
- `Cancel` — commit cancel halts further batches; report reflects partial state.
- `ErrorDownload` — clicking "Download errors" produces CSV of failed rows.

---

## Cross-cutting decisions

### Library picks

- **Date handling:** `date-fns` (already in deps, tree-shakes, idiomatic).
- **Drag-and-drop:** `@dnd-kit/core` (adds a new dep; lean, headless, a11y-first).
- **CSV parsing:** `papaparse` (industry standard, streaming-capable).
- **Validation:** `zod` (now in deps after the shadcn refresh).
- **Hotkey binding:** Lightweight in-house listener — avoid pulling in `mousetrap`
  or `hotkeys-js`. The palette only needs one or two bindings; consumers wire their
  own for custom commands.

### i18n

All new keys extend ra-core's existing `ra.*` namespace (`ra.command.*`,
`ra.calendar.*`, `ra.csv_import.*`). English defaults are provided inline at each
`translate()` call site using the `{ _: "English fallback" }` option, matching the
repo's existing convention (see `wizard-form.tsx`, `search-input.tsx`). There is no
central English bundle to maintain.

### Testing

Per repo convention, every component has a `*.spec.tsx` next to it that imports
Storybook stories and renders them with the project's test wrapper. New stories
land under `src/stories/`. We follow TDD: write the story + spec first, then implement.

### Documentation

Each component gets a page under `docs/src/content/docs/`:

- `CommandMenu.md`
- `CalendarList.md`
- `CsvImport.md`

Follow the standard Usage → Props → per-prop section pattern.

### Public exports

Add re-exports from each new module to `src/components/admin/index.ts`:

```ts
export * from "./command-menu";
export * from "./calendar-list";
export * from "./csv-import";
```

`<Admin commandMenu>` shorthand wires `<CommandMenu />` into the layout when set
to `true`; passing an element overrides the default.

### Dependencies summary

To add during implementation:

| Package            | Used by      | Why                                    |
| ------------------ | ------------ | -------------------------------------- |
| `@dnd-kit/core`    | CalendarList | Drag-and-drop in month/week views.     |
| `papaparse`        | CsvImport    | CSV parse + unparse (errors download). |
| `@types/papaparse` | CsvImport    | TS types.                              |

`zod`, `react-day-picker`, `recharts` are already added by the shadcn refresh; this
phase uses `zod` and consumes `react-day-picker` indirectly via `ui/calendar.tsx`
(date picker primitive) — `<CalendarList>` itself is a custom layout, not the
day-picker calendar.

### Out of scope, deferred to later phases

- Saving a complete "view" (filters + sort + columns + perspective) as a named
  preset — that's a separate `<SavedViews>` component, future phase.
- Realtime updates of records visible in the calendar — relies on the same
  `<PresenceBar>` infra coming in Phase 2.
- AI-driven palette ("show me orders over $500") — Phase 4 `<Assistant>`.

---

## Milestones for the implementation plan

The follow-on plan will sequence the three components for independent delivery:

1. **CommandMenu first.** Lowest external lift (no new deps beyond what shadcn already
   brought in), highest perceived UX win, easiest to demo.
2. **CsvImport second.** Reuses the just-merged `<WizardForm>` and consolidates the
   import experience around it — a strong second proof of `<WizardForm>`'s API.
3. **CalendarList third.** Adds `@dnd-kit` and the most layout/interaction complexity;
   benefits from coming after the other two land so reviewers can focus.

Each ships its own PR with its component file, spec, story, docs page, and i18n keys.
