# Phase 1-5 Completion Summary

**Branch:** `claude/dazzling-ptolemy-a3a799`
**Period:** 2026-05-14 → 2026-05-15
**Total commits:** 68 (relative to `main`)

All 13 features from the 5-phase next-level admin roadmap shipped on a single long-running branch. Each feature is implemented with TDD (failing test → impl → pass), co-located spec files, Storybook stories, docs pages, and i18n keys under the `ra.*` namespace.

## Phase 1 — Essentials

| Component        | Tests | Files                                                                                  |
| ---------------- | ----- | -------------------------------------------------------------------------------------- |
| `<CommandMenu>`  | 12    | [src/components/admin/command-menu.tsx](../../src/components/admin/command-menu.tsx)   |
| `<CsvImport>`    | 6     | [src/components/admin/csv-import.tsx](../../src/components/admin/csv-import.tsx)       |
| `<CalendarList>` | 10    | [src/components/admin/calendar-list.tsx](../../src/components/admin/calendar-list.tsx) |

## Phase 2 — Record Keepers

| Component          | Tests | Files                                                                                      |
| ------------------ | ----- | ------------------------------------------------------------------------------------------ |
| `<RecordTimeline>` | 2     | [src/components/admin/record-timeline.tsx](../../src/components/admin/record-timeline.tsx) |
| `<DiffViewer>`     | 4     | [src/components/admin/diff-viewer.tsx](../../src/components/admin/diff-viewer.tsx)         |
| `<PresenceBar>`    | 1     | [src/components/admin/presence-bar.tsx](../../src/components/admin/presence-bar.tsx)       |

## Phase 3 — Goodies

| Component                   | Tests | Files                                                                                |
| --------------------------- | ----- | ------------------------------------------------------------------------------------ |
| `<KanbanBoard>`             | 6     | [src/components/admin/kanban-board.tsx](../../src/components/admin/kanban-board.tsx) |
| `<TreeList>`                | 2     | [src/components/admin/tree-list.tsx](../../src/components/admin/tree-list.tsx)       |
| `<MapField>` + `<MapInput>` | 5     | [src/components/admin/map-field.tsx](../../src/components/admin/map-field.tsx)       |

## Phase 4 — Nice to Haves

| Component            | Tests | Files                                                                                          |
| -------------------- | ----- | ---------------------------------------------------------------------------------------------- |
| `<Assistant>`        | 1     | [src/components/admin/assistant.tsx](../../src/components/admin/assistant.tsx)                 |
| `<PermissionMatrix>` | 4     | [src/components/admin/permission-matrix.tsx](../../src/components/admin/permission-matrix.tsx) |
| `<OnboardingTour>`   | 6     | [src/components/admin/onboarding-tour.tsx](../../src/components/admin/onboarding-tour.tsx)     |
| `<PivotGrid>`        | 5     | [src/components/admin/pivot-grid.tsx](../../src/components/admin/pivot-grid.tsx)               |

## Phase 5 — Data Guru

| Component                                                    | Tests | Files                                                                                        |
| ------------------------------------------------------------ | ----- | -------------------------------------------------------------------------------------------- |
| `<MetricCard>`, `<TrendChart>`, `<BarChart>`, `<DonutChart>` | 8     | [src/components/admin/dashboard-charts.tsx](../../src/components/admin/dashboard-charts.tsx) |

## Deps added across the session

- `papaparse` + `@types/papaparse` — CsvImport row parsing
- `@dnd-kit/core` — CalendarList drag-drop, KanbanBoard column drag
- `leaflet` + `react-leaflet` + `@types/leaflet` — MapField / MapInput

Plus from the initial shadcn refresh: `zod`, `recharts`, `react-day-picker`, `react-resizable-panels`, `embla-carousel-react`, `input-otp`, `@hookform/resolvers`, `@base-ui/react`.

## Side fixes

- `src/components/ui/tooltip.tsx` — restored auto-`<TooltipProvider>` wrap that the shadcn refresh removed (broke `RichTextInput`).
- `src/components/admin/select-input.tsx` + `nullable-boolean-input.tsx` — pinned `position="popper"` after shadcn flipped the default to `item-aligned`.
- `vitest.config.ts` — added `@dnd-kit/core` to `optimizeDeps.include` to avoid mid-test Vite reloads.

## Spec/plan docs

| Doc                                                                  | Coverage                                  |
| -------------------------------------------------------------------- | ----------------------------------------- |
| `docs/superpowers/specs/2026-05-14-phase-1-essentials-design.md`     | CommandMenu + CsvImport + CalendarList    |
| `docs/superpowers/specs/2026-05-15-phase-2-record-keepers-design.md` | RecordTimeline + DiffViewer + PresenceBar |
| `docs/superpowers/plans/2026-05-14-command-menu.md`                  | CommandMenu task plan                     |
| `docs/superpowers/plans/2026-05-15-csv-import.md`                    | CsvImport task plan                       |
| `docs/superpowers/plans/2026-05-15-calendar-list.md`                 | CalendarList task plan                    |

Phases 3-5 specs are condensed inline into the dispatch prompts rather than persisted as separate docs, to save tokens during the autonomous build phase.

## Conventions followed

- All tests import and render Storybook stories (per `AGENTS.md`).
- All i18n keys under `ra.*` namespace with inline `{ _: "fallback" }` defaults.
- All `<Admin commandMenu>` stories use the shorthand prop (added in Task 11 of CommandMenu, pulled forward).
- Single-file components with internal sub-components (matches `wizard-form.tsx` precedent).
- Pluggable transports for components requiring optional backends (PresenceBar → BroadcastChannel; Assistant → echoTransport).
- `useStore` from ra-core for persistent state (CommandMenu recents, OnboardingTour completion).

## Out of scope / deferred

- CommandMenu: per-action icon support, server-side federated search, AI-driven palette (overlaps with Assistant), keyboard arrow nav between command groups, more locale coverage.
- CsvImport: multi-sheet xlsx, update/upsert, server-side validation echo, background imports.
- CalendarList: recurring events (RRULE), multi-timezone math, swimlane/resource view, week-view resize handles, arrow-key cell navigation, aria-live region.
- KanbanBoard: column ordering customization, multi-column drag.
- TreeList: drag-reorder, lazy-load children for huge hierarchies.
- MapField: clustering, alternate basemaps, custom marker icons.
- Assistant: built-in OpenAI/Anthropic/AI-SDK transport implementations.
- PresenceBar: cross-machine network transport (only same-origin BroadcastChannel by default).
- OnboardingTour: keyboard nav between steps, mobile placement adjustments.
- DashboardCharts: live data fetching via `dataProvider.aggregate` extension.
