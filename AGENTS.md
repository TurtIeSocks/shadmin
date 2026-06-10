# Agent Directives

## Project Overview

Shadcn Admin Kit is a component library for building admin apps using shadcn/ui. It wraps ra-core (react-admin's headless core) with shadcn/ui components, providing CRUD views, data tables, form inputs, auth, i18n, and theming. The demo app in `apps/demo/` showcases all features with fake data.

## Repository Layout

The repo is a pnpm + Turborepo monorepo (the Makefile targets wrap turbo):

- `packages/admin-kit/`: the component library and shadcn registry source
- `apps/demo/`: demo app consuming the library
- `apps/website/`: marketing site (Vite)
- `apps/docs/`: Astro documentation site
- Root tooling: Biome (`biome.jsonc`) for lint/format, `turbo.json` task graph, `knip.json`

## Commands

```bash
make install           # Install dependencies
make run               # Start the demo dev server (Vite, via turbo)
make test              # Run tests (Vitest + Playwright browser, headless)
make test-watch        # Run tests in watch mode
make test-browser      # Run tests in interactive browser mode
make typecheck         # TypeScript type checking
make lint              # Biome (same as `pnpm run lint`; `pnpm run format` writes fixes)
make storybook         # Start Storybook on port 6006
```

Run a single test file: `pnpm --filter shadcn-admin-kit exec vitest run --browser.headless src/components/admin/some-component.spec.tsx` (path relative to `packages/admin-kit/`)

## Architecture

### Core Pattern: ra-core + shadcn/ui

The library re-implements react-admin's UI layer using shadcn/ui components while keeping ra-core for headless logic (data fetching, auth, routing, i18n, state). Components in `packages/admin-kit/src/components/admin/` use ra-core hooks (`useListContext`, `useRecordContext`, `useInput`, etc.) for data/state and render with shadcn/ui primitives from `packages/admin-kit/src/components/ui/`.

### Key Directories

- `packages/admin-kit/src/components/admin/`: All admin components (~94 files): views (List, Create, Edit, Show), fields (_-field.tsx), inputs (_-input.tsx), actions (buttons), layout, auth, guessers
- `packages/admin-kit/src/components/ui/`: Base shadcn/ui primitives (button, dialog, table, sidebar, etc.)
- `packages/admin-kit/src/components/rich-text-input/`: TipTap WYSIWYG editor integration
- `apps/demo/src/`: Demo app with fake REST data provider, organized by resource (products/, orders/, customers/, categories/, reviews/)
- Storybook stories are colocated next to their components as `*.stories.tsx` (no central stories directory)
- `packages/admin-kit/src/lib/`: Utilities (`cn()` for Tailwind class merging, i18n defaults, field types)
- `apps/docs/`: Astro documentation site
- `apps/website/`: Marketing site (separate Vite config)

### Layering rule (imports across `src/components/*`)

All paths in this section are relative to `packages/admin-kit/`.

Files inside `src/components/admin/` may import only from:

- `src/components/admin/` (sibling admin components)
- `src/components/ui/` (stock shadcn/ui primitives)
- `src/lib/`, `src/hooks/`, and external packages (`ra-core`, `react`, etc.)

They **must not** import from `src/components/extras/`, `src/components/rich-text-input/`, or any other sibling folder under `src/components/`. The dependency direction is `extras → admin → ui`, never the reverse.

When an admin component would need a feature that today lives in `extras/` (e.g. the `<CommandMenu>` cmd+K palette), expose lower-level primitives from `admin/` (such as `<AdminContext>` + `<AdminUI>`) so the consumer in `extras/` can compose them — don't reach down from `admin/` into `extras/`.

A `src/components/realtime/` feature folder exists as a sibling of `admin/`. The dependency direction is `extras → realtime → admin → ui`. `realtime/` may import from `admin/`, `ui/`, `lib/`, `hooks/`, and external packages. `admin/` MUST NOT import from `realtime/`. `extras/` MAY import from `realtime/`.

### Component Conventions

- **Fields** (`*-field.tsx`): Display components that read from `useRecordContext()`. Used in List/Show views.
- **Inputs** (`*-input.tsx`): Form components that use `useInput()` from ra-core + React Hook Form. Used in Create/Edit views.
- **Guessers** (`*-guesser.tsx`): Auto-generate CRUD views by introspecting API responses.
- **Reference components** (`reference-*.tsx`): Handle foreign key relationships (one-to-many, many-to-one).
- Tests are co-located as `*.spec.tsx` files next to their components, and stories as `*.stories.tsx`.
- **Tests should import and render stories**: Spec files import story exports (e.g., `import { Basic, CustomLabel } from "./foo.stories"`) and render them directly, rather than setting up test wrappers from scratch. See `date-time-input.spec.tsx` or `edit-button.spec.tsx` for examples.
- **Reuse the shared `StoryAdmin` test wrapper** (in `packages/admin-kit/src/test/_test-helpers.tsx`) instead of duplicating the `TestMemoryRouter + Admin + fakeRestDataProvider + polyglotI18nProvider + memoryStore` boilerplate in every story file. ~25 lines of setup ✕ N stories is sub-stantial dead weight; one helper makes story files focus on the component being demoed.

### Documentation generation

- Component docs pages live in `apps/docs/src/content/docs/{ComponentName}.md` and currently must be hand-written. Bespoke per-component docs are time-consuming; prefer adopting `typedoc` (or a similar JSDoc → MDX pipeline) so the Props table can be derived from the component's TypeScript types instead of restated by hand. Until that lands, the Usage → Props → per-prop section pattern is the project's authoring contract.

### Entry Point

`Admin` component (`packages/admin-kit/src/components/admin/admin.tsx`) wraps ra-core's `CoreAdminContext` + `CoreAdminUI` with the ThemeProvider and default layout. Apps configure it with a `dataProvider`, optional `authProvider`, and `<Resource>` children.

The same file also exports `<AdminContext>` (provider half) and `<AdminUI>` (theme + routes half) for callers that need to inject a wrapping component between the providers and the routed UI — e.g. the cmd+K `<CommandMenu>` palette in `packages/admin-kit/src/components/extras/command-menu.tsx`.

## Documentation

Every new feature must be documented. Documentation is written in Markdown files in the `apps/docs/src/content/docs/` directory, which are then rendered in the Astro documentation site.

Component doc pages use the same structure: Usage → Props → specific prop sections\*\* (e.g., `## \`label\``).

## Tech Stack

- **Build**: Vite with `@` path alias → `packages/admin-kit/src` (the demo app maps `@` to the same directory)
- **Styling**: Tailwind CSS v4 with oklch CSS custom properties for theming (light/dark)
- **Testing**: Vitest with Playwright browser provider (Chromium), tests run in real browser
- **Forms**: React Hook Form + Zod validation
- **State/Data**: TanStack Query (via ra-core)
- **Routing**: React Router v7 (via ra-core)
- **shadcn/ui style**: `new-york` variant, CSS variables enabled
