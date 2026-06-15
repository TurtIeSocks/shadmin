## [Unreleased]

### Added

- Realtime subsystem under `src/components/realtime/`: `realtimeDataProvider` factory + `RealtimeDataProvider` type, opt-in `addEventsForMutations`, four transports (`webSocketTransport`, `sseTransport`, `broadcastChannelTransport`, `fakeTransport`), `inMemoryLockProvider`, 17 hooks (subscribe/publish/live/lock families), and six components (`ListLive`, `EditLive`, `ShowLive`, `MenuLive` + `MenuLiveItemLink`, `LockOnMount`, `LockStatus`). Demo app under `src/demo/App.realtime-demo.tsx` with cross-tab `broadcastChannelTransport`.

### Registry refactor: granular install + primitive abstraction

- **BREAKING**: Theme palettes, theme contexts, theme types, and the title-portal constant moved out of `src/components/admin/` into `src/lib/themes/` and `src/lib/`. Imports of `bwTheme`, `defaultTheme`, `houseTheme`, `nanoTheme`, `radiantTheme`, `AdminTheme`, `ThemeVars`, `useThemes`, `ThemesContextValue`, and `TITLE_PORTAL_ID` must move from `@/components/admin` to `@/lib/themes` (themes/contexts/types) or `@/lib/title-portal-id` (constant).
- Tighten `src/components/ui/` wrappers to expose each primitive namespace (`PopoverPrimitive`, `DialogPrimitive`, `TooltipPrimitive`, `LabelPrimitive`) plus a new `Slot` wrapper. Consumers needing low-level primitive access import from the ui wrapper instead of `radix-ui` directly. Swapping primitive libraries (radix-ui ↔ @base-ui/react) now means editing only `src/components/ui/`.
- Add an ESLint rule banning `radix-ui` and `@base-ui/react` imports outside `src/components/ui/`. Keeps the primitive seam from leaking back over time.
- Auto-derive granular registry items from the import graph. Each component, hook, and lib file in the admin block is now also shipped as its own `registry:component` / `registry:hook` / `registry:lib` item alongside the existing monolith `admin` block. Consumers can install individual pieces via `shadcn add @shadmin/data-table` (etc.) instead of pulling the full kit.

### Add public component coverage audit and gallery

- Add a reusable public component coverage audit script that checks Storybook, co-located specs, docs, and demo gallery entries for exported admin-facing components.
- Add a component gallery resource to the demo app so public components have a visible demo route outside the commerce CRUD flows.
- Add story-render smoke specs for public components that already had stories, plus coverage stories for previously missing public Storybook entries.
- Add documentation pages for public components that were missing direct docs.
- Verify the coverage gate now reports 149 public targets with no missing stories, specs, docs, or demo examples.

## v1.5.0 (Feb. 2026)

### 🚀 Features

- Add `<TextArrayInput>` component for handling arrays of text values.
- Add `<DateTimeInput>` component for date and time input support.
- Add `<ImageField>` component for displaying images. Can also be used inside `<FileInput>` for image preview.
- Add `<SelectAllButton>` to bulk actions toolbar.
- Add `<NotFound>` component for unmatched routes.
- Add ability to use `<ExportButton>` in every List Context (including references)
- Add ability to set `<Notification>` hide duration.
- Add reusable empty list state and improved empty state handling in guessers.
- Add support for loading and error states in layout.
- Add soft delete support and documentation for enterprise users.
- Add `<AutoPersistInStoreBase>` component and documentation.
- Add clearable prop to `<SearchInput>`.

### 🐛 Bug Fixes

- Fix `<FileInput>` no longer submits the form when deleting a file.
- Fix Ready screen text color.
- Fix `<DateInput>` icon placement
- Fix `<SimpleFormIterator>` compatibility with RA 5.13.
- Fix Undoable notifications called in series.
- Fix Menu links styles.
- Fix Console warnings warnings.
- Fix `<SingleFieldList>` class override.
- Fix `<AutocompleteInput>` popper width on mobile.
- Fix Search icon position in columns selector.
- Fix `<EditView>` when empty is false in guessers.
- Fix `<SaveButton>` disabled state with React Hook Form proxy subscriptions.
- Fix `<ListPagination>` doesn't disable prev/next buttons when necessary.
- Fix `<ReferenceField>` now works correctly when offline.

### 📝 Documentation

- Add tutorials on how to setup TanStack Start, and React Router.
- Add new components (`<DateInput>`, `<ImageField>`, `<TextArrayInput>`, etc.) doc.
- Add `<Breadcrumb>` and `<Confirm>` components
- Add: `<FileInput>` image preview example.
- Add User Menu documentation.
- Add I18n configuration page
- Add real-time & locking documentation and examples
  - `<ListLiveUpdate>`
  - `<RecordLiveUpdate>`
  - `<EditLiveUpdate>`
  - useGetListLive
  - useGetOneLive
  - useLockOnCall
  - useLockOnMount
  - usePublish
  - useSubscribe
  - useSubscribeCallback
- Add many-to-many relationship documentation and examples
  - `<ReferenceManyInputBase>`
  - `<ReferenceManyToManyFieldBase>`
  - `<ReferenceManyToManyInputBase>`
  - `<ReferenceOneInputBase>`
- Add Soft Delete documentation and examples
  - `<SoftDeleteButton>`
  - `<SoftDeleteField>`
  - useSoftDelete
- Add Form persistence documentation and examples
  - `<AutoPersistInStoreBase>`
  - useAutoPersistInStore
- Add `<ReferenceArrayInput>` validation documentation.
- Add reference to Context7 in MCP documentation
- Update installation instructions for Next.js
- Update Quick Start tutorial with variants depending on the stack used (Next.js, TanStack Start, etc).
- Update BooleanInput documentation, added doc on format and parse prop
- Update Inputs, ThemeModeToggle, Relationship, Appsidebar, layout, notification, loading, and error documentation.
- Update inputs, layout, loading, and error components.
- Update custom routes, relationships, and reference inputs.
- Update landing page to include Atomic CRM as a demo.
- Fix Broken links.

### 🧰 Chore & Maintenance

- Add Pull request template
- Add ability to create release from tag in Build process.
- Upgrade dependencies
  - react-router: 7.5.3 => 7.12.0
  - ra-core: 5.10.0 => 5.14.0
  - Shadcn/ui: 3.2 => 3.8
- Upgrade dev dependencies
  - Storybook
  - Vite
  - Astro
  - Playwright
- Fix linter warnings
- Fix duplicate dependencies
- Fix registry.json generation
- Fix various bugs in the e-commerce demo
- Remove headless logic that is now provided by ra-core.

For the full list of changes, see the [commit history](https://github.com/TurtIeSocks/shadmin/compare/v1.0.0...v1.5.0).

## v1.0.0 (Sept. 2025)

Initial release
