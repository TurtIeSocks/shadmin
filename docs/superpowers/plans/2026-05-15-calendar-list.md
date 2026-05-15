# `<CalendarList>` Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship a `<CalendarList>` view component that renders date-bound records in month/week/agenda layouts, with range-loaded data via the parent `<List>` filter pipeline and optional `@dnd-kit/core`-powered drag-drop.

**Architecture:** Single-file component (`src/components/admin/calendar-list.tsx`) following the wizard-form / command-menu / csv-import precedent. Sub-components for header, three view modes, and an optional drag wrapper. Reads `useListContext()` for data; reads/writes `filterValues` for range loading; uses `date-fns` for date math; uses `@dnd-kit/core` only when `onDrop` is supplied.

**Tech Stack:** React 19, TypeScript, ra-core, date-fns, optional `@dnd-kit/core`, shadcn/ui primitives, Tailwind v4, Vitest + Playwright browser.

**Spec:** [docs/superpowers/specs/2026-05-14-phase-1-essentials-design.md](../specs/2026-05-14-phase-1-essentials-design.md#2-calendarlist)

---

## File structure

| File | Responsibility | Status |
| --- | --- | --- |
| `package.json` | Add `@dnd-kit/core` dep | **Modify** |
| `src/components/admin/calendar-list.tsx` | Component + sub-components | **Create** |
| `src/components/admin/calendar-list.spec.tsx` | Browser tests | **Create** |
| `src/stories/calendar-list.stories.tsx` | Storybook stories | **Create** |
| `docs/src/content/docs/CalendarList.md` | Docs page | **Create** |
| `src/components/admin/index.ts` | Public re-export | **Modify** |

---

### Task 1: Scaffold + types + Month view + Basic story

**Files:** all six listed above (create/modify).

- [ ] Install: `pnpm add @dnd-kit/core`
- [ ] Create `src/components/admin/calendar-list.tsx` with:
  - Props/types (`CalendarListProps`, `CalendarView`, `EventRendererProps`, `HeaderRendererProps`).
  - `<CalendarList>` reads `useListContext()`, computes visible range (month for default view), filters event records into day cells, renders a 6×7 grid via `<CalendarMonthView>`.
  - Default `<CalendarEvent>` renders a colored badge with title text.
  - `eventRenderer` and `headerRenderer` props accepted; default renderers used when absent.
- [ ] Create `src/stories/calendar-list.stories.tsx` with a `Basic` story that mounts `<Admin>` + `<Resource name="events">` + a `<List>` showing the calendar with seeded date records.
- [ ] Create `src/components/admin/calendar-list.spec.tsx` importing `Basic` and asserting:
  - The current month label appears in the header (e.g., today's `MMMM yyyy` via `date-fns/format`).
  - At least one day cell renders.
- [ ] Append `export * from "./calendar-list";` to `index.ts`.
- [ ] Verify tests pass. Commit `feat(calendar-list): scaffold component, month view, basic story`.

### Task 2: Range loading via filter injection

- [ ] When the visible range changes (mount, prev/next/today, view switch), call `setFilters({...filterValues, [\`${startSource}_gte\`]: rangeStart.toISOString(), [\`${startSource}_lte\`]: rangeEnd.toISOString()})`.
- [ ] Story story `RangeLoading` with a fakerest provider that has records both inside and outside the visible range. Test asserts only in-range records render.
- [ ] Verify, commit `feat(calendar-list): range loading via filter injection`.

### Task 3: Navigation (prev/next/today) + Header + Agenda view + View switcher

- [ ] Implement `<CalendarHeader>` with prev/next/today buttons and a `<Tabs variant="line">` view switcher.
- [ ] Implement `<CalendarAgendaView>` — flat list of events grouped by date, with `no_events` empty state.
- [ ] Add `Navigation` and `Agenda` stories + tests.
- [ ] Verify, commit `feat(calendar-list): navigation, agenda view, view switcher`.

### Task 4: Week view

- [ ] Implement `<CalendarWeekView>` — 7 columns × 24 hour rows, events positioned by start/end time within each day column.
- [ ] Add `Week` story + test.
- [ ] Verify, commit `feat(calendar-list): week view`.

### Task 5: Event interactions (select event, select slot)

- [ ] Wire `onSelectEvent` to event clicks (default: navigate to Show).
- [ ] Wire `onSelectSlot` to empty day-cell / time-slot clicks (default: undefined, no-op).
- [ ] Add `Interactions` story + test asserting handlers fire with correct arguments.
- [ ] Verify, commit `feat(calendar-list): event and slot click handlers`.

### Task 6: Drag-and-drop via @dnd-kit (when onDrop provided)

- [ ] Wrap `<CalendarMonthView>` in `<DndContext>` when `onDrop` is set. Events become `useDraggable`; day cells become `useDroppable`. On drop, compute new start/end (preserving duration) and call `onDrop(record, { start, end })`.
- [ ] Add `Drag` story + test asserting `onDrop` fires with the right arguments after a programmatic drag.
- [ ] Verify, commit `feat(calendar-list): drag-drop in month view via @dnd-kit`.

### Task 7: Docs page + final verification

- [ ] Write `docs/src/content/docs/CalendarList.md` following the WizardForm.md pattern.
- [ ] Run lint + typecheck + tests in parallel (single Bash batch).
- [ ] Commit `docs(calendar-list): add documentation page`.

---

## Out of scope (v1)

- Recurrence (RRULE).
- Multi-timezone math.
- Resource/swimlane view.
- Week-view resize handles.
- Keyboard navigation between cells (arrow keys + enter).
- aria-live region for range changes.

These are tracked as Phase 1 follow-ups; the spec calls them out as "deferred to later" anyway. The core 3-view + range-loading + click handling + drag-drop is sufficient for v1.

## Self-review notes

- Single component file (~600 lines target).
- Pure-render sub-components for each view mode.
- @dnd-kit only loaded when onDrop is provided.
- Tests import stories per repo convention.
