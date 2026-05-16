# Tier 4 Dev-Experience Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship five dev-experience / meta-tooling components — `<DataProviderDevtools>`, `<SchemaDrivenView>`, `<ThemeStudio>`, `<LayoutBuilder>`, `<I18nKeyEditor>` — that improve the admin-builder workflow itself rather than the end-user admin app.

**Architecture:** All components live in `src/components/extras/`. Each is a minimum-viable v1: capable enough to be useful, scoped tight enough to fit a single subagent dispatch. Tests favor controller-level assertions over full UI interaction where dnd / runtime-wrapping makes browser tests fragile.

**Tech Stack:** React 19, TypeScript, ra-core (`useDataProvider`, `useResourceContext`, `useResourceDefinition`, `useTranslate`, `useStore`, `useTheme`, i18n provider wrapping), shadcn/ui, Tailwind v4, `@dnd-kit/core` (already a dep for `<KanbanBoard>`), Vitest + Playwright browser provider. No new runtime deps.

**Spec:** [docs/superpowers/specs/2026-05-16-twenty-one-component-ideas-design.md](../specs/2026-05-16-twenty-one-component-ideas-design.md) — Tier 4 batch (ideas 17, 18, 19, 20, 21).

## Assumptions (delegated decisions)

T4 components are the heaviest in the spec; the spec itself called Tier 4 a "separate epic". Shipping minimum-viable v1 versions here with explicit cuts:

### General
1. All five live in `src/components/extras/`. Sidebar group = `Extras`. Story title prefix = `Extras/<ComponentName>`.
2. Stories MUST have `export const Basic` and be ≥30 lines per `check-stories.mjs`.
3. Specs cover controller logic + visible outputs. Drag-drop, real proxy wrapping, and runtime i18n interception are tested via observable side effects (state changes, classNames, rendered counts), not raw DOM events.
4. No new runtime deps (re-use `@dnd-kit/core` already in for kanban-board).

### DataProviderDevtools
5. Wraps `useDataProvider()` via a custom hook + provider component. NOT a global proxy at `<Admin>` level — that would require user-side wiring changes. Instead, `<DataProviderDevtools>` is dropped in the tree and exposes a `useTrackedDataProvider` hook (or shadowing context override) that consumers must opt into.
6. Floating panel toggleable via keyboard shortcut (default `Ctrl+Shift+D`).
7. Logs last 50 calls. Filter by method (`getList`, `getOne`, `update`, etc.). No persistence (in-memory).
8. v1 doesn't capture cache hit/miss (would require TanStack Query plumbing).

### SchemaDrivenView
9. Accepts a JSON Schema object (subset: type, format, enum, properties). Maps to: string → TextInput/TextField, number → NumberInput/NumberField, boolean → BooleanInput/BooleanField, string+format=email → EmailField, string+format=date → DateInput/DateField, enum → SelectInput/SelectField.
10. Modes: `"list"` renders a `<DataTable>` with one column per top-level property. `"edit"` and `"show"` render a `<SimpleForm>` / `<SimpleShowLayout>` with one field per top-level property.
11. Override prop `overrides: Record<string, ReactNode>` lets the caller swap a specific property's rendering.
12. v1 supports flat schemas only. Nested object schemas + array-of-object schemas are deferred.
13. JSON Schema $ref / allOf / oneOf are not supported.

### ThemeStudio
14. Renders an editor panel listing every `ThemeVars` key from the current `<ThemeProvider>` (light + dark map).
15. Each var has a text input. For values matching `oklch(...)` or `#hex` patterns, also renders a `<ColorInput>` chip alongside for convenience.
16. Live preview: writing to a var updates `document.documentElement.style.setProperty(...)` so the change is visible immediately across the admin app.
17. Export: serializes the current state to a TypeScript `AdminTheme` snippet via a "Copy" button (clipboard).
18. v1 doesn't persist; reload reverts to the original theme.

### LayoutBuilder
19. Modes: `"list-columns"` reorders `<DataTable>` column children. `"show-layout"` reorders `<SimpleShowLayout>` field children. `"edit-form"` reorders `<SimpleForm>` input children. v1 ships `"list-columns"` only — other modes flagged as out-of-scope.
20. Persists arrangement to `useStore` under `key={\`layout.${resource}.${mode}\`}`.
21. Drag-drop via `@dnd-kit/core`. Test the persisted state (read from `useStore` after reorder, not the dnd events themselves).
22. v1 doesn't render a preview of how the layout will look. It only exposes the reorder UI; pairing with a `<DataTable storeKey>` is the consumer's job.

### I18nKeyEditor
23. Wraps the i18n provider so every `translate(key, params)` call is captured. Records missing keys (returned key equals input key, or matches `allowMissing` semantics).
24. Floating panel lists missing keys, grouped by namespace. Inline edit field for each entry. State held in component memory.
25. Export button serializes captured keys to a flat JSON object suitable for merging into a locale file.
26. v1 doesn't write to filesystem — export is clipboard-only.
27. v1 captures only via `useTranslate()` hook calls; direct `i18nProvider.translate(...)` invocations are missed.

---

## File structure

| File | Responsibility | Status |
| --- | --- | --- |
| `src/components/extras/data-provider-devtools.tsx` | DataProvider call inspector + panel | **Create** |
| `src/components/extras/data-provider-devtools.spec.tsx` | Browser tests | **Create** |
| `src/stories/extras/data-provider-devtools.stories.tsx` | Stories | **Create** |
| `docs/src/content/docs/data-provider-devtools.md` | Doc page | **Create** |
| `src/components/extras/schema-driven-view.tsx` | JSON Schema → CRUD view | **Create** |
| `src/components/extras/schema-driven-view.spec.tsx` | Browser tests | **Create** |
| `src/stories/extras/schema-driven-view.stories.tsx` | Stories | **Create** |
| `docs/src/content/docs/schema-driven-view.md` | Doc page | **Create** |
| `src/components/extras/theme-studio.tsx` | Live theme-token editor | **Create** |
| `src/components/extras/theme-studio.spec.tsx` | Browser tests | **Create** |
| `src/stories/extras/theme-studio.stories.tsx` | Stories | **Create** |
| `docs/src/content/docs/theme-studio.md` | Doc page | **Create** |
| `src/components/extras/layout-builder.tsx` | Drag-drop column reorder | **Create** |
| `src/components/extras/layout-builder.spec.tsx` | Browser tests | **Create** |
| `src/stories/extras/layout-builder.stories.tsx` | Stories | **Create** |
| `docs/src/content/docs/layout-builder.md` | Doc page | **Create** |
| `src/components/extras/i18n-key-editor.tsx` | Runtime missing-key capture | **Create** |
| `src/components/extras/i18n-key-editor.spec.tsx` | Browser tests | **Create** |
| `src/stories/extras/i18n-key-editor.stories.tsx` | Stories | **Create** |
| `docs/src/content/docs/i18n-key-editor.md` | Doc page | **Create** |
| `src/components/extras/index.ts` | Re-export 5 new entries | **Modify** |
| `docs/sidebar.config.mjs` | Add 5 Extras entries | **Modify** |
| `src/demo/component-gallery/ComponentGallery.tsx` | Add 5 gallery entries (check-demo-coverage requires) | **Modify** |

---

## Shared conventions

- All components ship in `src/components/extras/`. Stories in `src/stories/extras/`. Specs co-located with components.
- Story title prefix = `Extras/<ComponentName>`. ≥30 lines. Has `export const Basic`.
- Tests run in `vitest-browser-react` + Playwright. Use `screen.container.querySelector` for inputs/buttons; `screen.getByText` / `screen.getByLabelText` for content lookups; `await expect.element(...)` for async waits.
- Lint = `pnpm run lint`. Typecheck = `pnpm run typecheck`. Single-file test = `pnpm vitest run --browser.headless src/components/extras/<file>.spec.tsx`.
- Conventional Commits with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` footer.
- Each subagent must also append two lines: one to `src/components/extras/index.ts` (component export), and one entry to the existing `galleryComponents` array in `src/demo/component-gallery/ComponentGallery.tsx`. Sidebar entries are added by main thread at integration time to avoid 5-way merge conflicts.

---

## Component 1: DataProviderDevtools

Floating panel that wraps a dataProvider and logs every call. Consumers opt-in via the exported `useTrackedDataProvider` hook (or use the rendering component which provides a context-scoped tracked provider for descendants).

### Task 1.1: Story file

**Files:** Create `src/stories/extras/data-provider-devtools.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { useEffect } from "react";
import {
  CoreAdminContext,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
  useDataProvider,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { DataProviderDevtools, ThemeProvider } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const records = {
  posts: [
    { id: 1, title: "First post" },
    { id: 2, title: "Second post" },
  ],
};

const DemoCaller = () => {
  const dataProvider = useDataProvider();
  useEffect(() => {
    dataProvider.getList("posts", {
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
      filter: {},
    });
    dataProvider.getOne("posts", { id: 1 });
  }, [dataProvider]);
  return <div data-demo-caller>Triggered 2 calls</div>;
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider(records, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          {children}
        </ResourceContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/DataProviderDevtools" };

export const Basic = () => (
  <Wrapper>
    <DataProviderDevtools>
      <DemoCaller />
    </DataProviderDevtools>
  </Wrapper>
);

export const Hidden = () => (
  <Wrapper>
    <DataProviderDevtools defaultOpen={false}>
      <DemoCaller />
    </DataProviderDevtools>
  </Wrapper>
);

export const CustomLimit = () => (
  <Wrapper>
    <DataProviderDevtools maxLogs={10}>
      <DemoCaller />
    </DataProviderDevtools>
  </Wrapper>
);
```

### Task 1.2: Implement `<DataProviderDevtools>` + spec

**Files:** Create `src/components/extras/data-provider-devtools.tsx`, `src/components/extras/data-provider-devtools.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomLimit,
  Hidden,
} from "@/stories/extras/data-provider-devtools.stories";

describe("<DataProviderDevtools />", () => {
  it("renders the floating panel by default with logged calls", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText(/data provider/i)).toBeInTheDocument();
    // Both calls should appear once the effect fires
    await expect.element(screen.getByText(/getList/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/getOne/i)).toBeInTheDocument();
  });

  it("renders children regardless of panel state", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText("Triggered 2 calls"))
      .toBeInTheDocument();
  });

  it("hides the panel when defaultOpen=false", async () => {
    const screen = render(<Hidden />);
    const panel = screen.container.querySelector("[data-devtools-panel]");
    expect(panel?.getAttribute("data-open")).toBe("false");
  });

  it("respects the maxLogs prop on data attribute", async () => {
    const screen = render(<CustomLimit />);
    const panel = screen.container.querySelector("[data-devtools-panel]");
    expect(panel?.getAttribute("data-max-logs")).toBe("10");
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/data-provider-devtools.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  DataProviderContext,
  type DataProvider,
  useDataProvider,
} from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DataProviderLog {
  id: number;
  method: string;
  resource: string;
  params: unknown;
  durationMs: number;
  status: "ok" | "error";
  error?: string;
  result?: unknown;
  at: string;
}

const DevtoolsLogContext = createContext<{
  logs: DataProviderLog[];
  clear: () => void;
} | null>(null);

/**
 * Wraps the surrounding `<DataProviderContext>` so every call to the data
 * provider is captured and surfaced in a floating panel. Children that read
 * `useDataProvider()` automatically get the tracked instance.
 *
 * @example
 * <DataProviderDevtools>
 *   <List resource="posts">{...}</List>
 * </DataProviderDevtools>
 */
export const DataProviderDevtools = ({
  children,
  defaultOpen = true,
  maxLogs = 50,
  keyboardShortcut = "ctrl+shift+d",
}: DataProviderDevtoolsProps) => {
  const base = useDataProvider();
  const [logs, setLogs] = useState<DataProviderLog[]>([]);
  const [open, setOpen] = useState(defaultOpen);
  const idRef = useRef(0);

  const append = useCallback(
    (entry: DataProviderLog) => {
      setLogs((cur) => {
        const next = [...cur, entry];
        return next.length > maxLogs ? next.slice(-maxLogs) : next;
      });
    },
    [maxLogs],
  );

  const wrapped = useMemo<DataProvider>(() => {
    const handler: ProxyHandler<DataProvider> = {
      get(target, prop) {
        const value = (target as unknown as Record<string, unknown>)[
          prop as string
        ];
        if (typeof value !== "function") return value;
        return async (resource: string, params: unknown) => {
          const id = ++idRef.current;
          const t0 = performance.now();
          try {
            const result = await (value as (...args: unknown[]) => unknown)(
              resource,
              params,
            );
            append({
              id,
              method: String(prop),
              resource,
              params,
              status: "ok",
              durationMs: performance.now() - t0,
              result,
              at: new Date().toISOString(),
            });
            return result;
          } catch (err) {
            append({
              id,
              method: String(prop),
              resource,
              params,
              status: "error",
              durationMs: performance.now() - t0,
              error: err instanceof Error ? err.message : String(err),
              at: new Date().toISOString(),
            });
            throw err;
          }
        };
      },
    };
    return new Proxy(base, handler);
  }, [base, append]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const want = parseShortcut(keyboardShortcut);
      if (
        e.ctrlKey === want.ctrl &&
        e.shiftKey === want.shift &&
        e.altKey === want.alt &&
        e.metaKey === want.meta &&
        e.key.toLowerCase() === want.key
      ) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyboardShortcut]);

  return (
    <DataProviderContext.Provider value={wrapped}>
      <DevtoolsLogContext.Provider
        value={{ logs, clear: () => setLogs([]) }}
      >
        {children}
        <Panel
          open={open}
          maxLogs={maxLogs}
          logs={logs}
          onClear={() => setLogs([])}
          onToggle={() => setOpen((o) => !o)}
        />
      </DevtoolsLogContext.Provider>
    </DataProviderContext.Provider>
  );
};

const Panel = ({
  open,
  maxLogs,
  logs,
  onClear,
  onToggle,
}: {
  open: boolean;
  maxLogs: number;
  logs: DataProviderLog[];
  onClear: () => void;
  onToggle: () => void;
}) => {
  return (
    <Card
      data-devtools-panel
      data-open={open ? "true" : "false"}
      data-max-logs={maxLogs}
      className={cn(
        "fixed bottom-4 right-4 z-50 w-96 max-h-[60vh] overflow-y-auto shadow-xl transition",
        !open && "translate-y-[calc(100%+1rem)]",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <CardTitle className="text-sm">Data Provider</CardTitle>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear
          </Button>
          <Button size="sm" variant="ghost" onClick={onToggle}>
            {open ? "Hide" : "Show"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No calls yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {logs.map((log) => (
              <li
                key={log.id}
                className={cn(
                  "rounded border p-2 font-mono text-xs",
                  log.status === "error" && "border-red-500/50 bg-red-500/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <span>
                    <span className="font-semibold">{log.method}</span>{" "}
                    <span className="text-muted-foreground">
                      {log.resource}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {log.durationMs.toFixed(1)}ms
                  </span>
                </div>
                {log.status === "error" && (
                  <p className="mt-1 text-red-700">{log.error}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

function parseShortcut(s: string): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  key: string;
} {
  const parts = s.toLowerCase().split("+").map((p) => p.trim());
  return {
    ctrl: parts.includes("ctrl"),
    shift: parts.includes("shift"),
    alt: parts.includes("alt"),
    meta: parts.includes("meta") || parts.includes("cmd"),
    key: parts[parts.length - 1],
  };
}

export interface DataProviderDevtoolsProps {
  children: ReactNode;
  /** Initial open state. Default `true`. */
  defaultOpen?: boolean;
  /** Maximum logs retained. Default `50`. */
  maxLogs?: number;
  /** Keyboard shortcut to toggle. Default `"ctrl+shift+d"`. */
  keyboardShortcut?: string;
}

/**
 * Reads the captured logs from the surrounding `<DataProviderDevtools>`.
 * Returns `null` when not inside a devtools provider.
 */
export function useDataProviderDevtools() {
  return useContext(DevtoolsLogContext);
}
```

- [ ] **Step 4** — append export to `extras/index.ts`. Append entry to `galleryComponents` in `src/demo/component-gallery/ComponentGallery.tsx`.
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit + docs commit.

### Task 1.3: Doc page

**Files:** Create `docs/src/content/docs/data-provider-devtools.md`

- [ ] **Step 1** — write:

````markdown
---
title: "DataProviderDevtools"
---

Floating panel that wraps the surrounding `<DataProviderContext>` and logs
every data-provider call. Drop in the tree wherever you want call-tracking to
start; consumers below it automatically use the tracked instance.

## Usage

```tsx
import { Admin, DataProviderDevtools, Resource } from '@/components/admin';

const App = () => (
  <Admin dataProvider={myDataProvider}>
    <DataProviderDevtools>
      <Resource name="posts" {...} />
    </DataProviderDevtools>
  </Admin>
);
```

## Props

| Prop               | Required | Type        | Default          | Description |
| ------------------ | -------- | ----------- | ---------------- | ----------- |
| `children`         | Required | `ReactNode` | -                | Tree to track |
| `defaultOpen`      | Optional | `boolean`   | `true`           | Panel open at mount |
| `maxLogs`          | Optional | `number`    | `50`             | Retained logs |
| `keyboardShortcut` | Optional | `string`    | `"ctrl+shift+d"` | Toggle key chord |

## `useDataProviderDevtools()`

Reads the captured logs from inside the provider. Returns `{ logs, clear }` or
`null` when called outside a `<DataProviderDevtools>`.

## Limitations

- Cache hit/miss is not surfaced in v1 (would require TanStack Query plumbing).
- The provider only tracks descendants of `<DataProviderDevtools>` — calls
  made above the wrapper aren't captured.
````

- [ ] **Step 2** — commit:

```bash
git add docs/src/content/docs/data-provider-devtools.md
git commit -m "docs(data-provider-devtools): add documentation"
```

---

## Component 2: SchemaDrivenView

JSON Schema → runtime CRUD view generator. Maps a flat schema to `<DataTable>`, `<SimpleForm>`, or `<SimpleShowLayout>` children.

### Task 2.1: Story file

**Files:** Create `src/stories/extras/schema-driven-view.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import {
  CoreAdminContext,
  ListContext,
  RecordContextProvider,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { SchemaDrivenView, ThemeProvider } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const SCHEMA = {
  type: "object",
  properties: {
    id: { type: "number" },
    title: { type: "string" },
    email: { type: "string", format: "email" },
    publishedAt: { type: "string", format: "date" },
    published: { type: "boolean" },
    status: { type: "string", enum: ["draft", "review", "published"] },
  },
};

const SAMPLE = {
  id: 1,
  title: "First post",
  email: "alice@example.com",
  publishedAt: "2026-05-16",
  published: true,
  status: "published",
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider({ posts: [SAMPLE] }, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          {children}
        </ResourceContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

const ListWrapper = ({ children }: { children: React.ReactNode }) => (
  <Wrapper>
    <ListContext.Provider
      value={
        {
          data: [SAMPLE],
          isLoading: false,
          isFetching: false,
          sort: { field: "id", order: "ASC" },
          onSelect: () => {},
          onToggleItem: () => {},
        } as never
      }
    >
      {children}
    </ListContext.Provider>
  </Wrapper>
);

export default { title: "Extras/SchemaDrivenView" };

export const Show = () => (
  <Wrapper>
    <RecordContextProvider value={SAMPLE}>
      <SchemaDrivenView schema={SCHEMA} mode="show" />
    </RecordContextProvider>
  </Wrapper>
);

export const Edit = () => (
  <Wrapper>
    <RecordContextProvider value={SAMPLE}>
      <SchemaDrivenView schema={SCHEMA} mode="edit" />
    </RecordContextProvider>
  </Wrapper>
);

export const Basic = Show;

export const ListMode = () => (
  <ListWrapper>
    <SchemaDrivenView schema={SCHEMA} mode="list" />
  </ListWrapper>
);

export const WithOverride = () => (
  <Wrapper>
    <RecordContextProvider value={SAMPLE}>
      <SchemaDrivenView
        schema={SCHEMA}
        mode="show"
        overrides={{ title: <strong data-override-title>{SAMPLE.title}</strong> }}
      />
    </RecordContextProvider>
  </Wrapper>
);
```

### Task 2.2: Implement `<SchemaDrivenView>` + spec

**Files:** Create `src/components/extras/schema-driven-view.tsx`, `src/components/extras/schema-driven-view.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Edit,
  ListMode,
  Show,
  WithOverride,
} from "@/stories/extras/schema-driven-view.stories";

describe("<SchemaDrivenView />", () => {
  it("renders one field per property in show mode", async () => {
    const screen = render(<Show />);
    await expect.element(screen.getByText("First post")).toBeInTheDocument();
    await expect
      .element(screen.getByText("alice@example.com"))
      .toBeInTheDocument();
  });

  it("renders inputs in edit mode", async () => {
    const screen = render(<Edit />);
    const titleInput = screen.container.querySelector(
      "input[name='title']",
    ) as HTMLInputElement;
    expect(titleInput).toBeTruthy();
    expect(titleInput.value).toBe("First post");
  });

  it("renders a data-table in list mode", async () => {
    const screen = render(<ListMode />);
    const table = screen.container.querySelector("table");
    expect(table).toBeTruthy();
    await expect.element(screen.getByText("First post")).toBeInTheDocument();
  });

  it("respects override prop", async () => {
    const screen = render(<WithOverride />);
    const overridden = screen.container.querySelector(
      "[data-override-title]",
    );
    expect(overridden).toBeTruthy();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/schema-driven-view.tsx
import type { ReactNode } from "react";
import {
  BooleanField,
  BooleanInput,
  DataTable,
  DateField,
  DateInput,
  EmailField,
  NumberField,
  NumberInput,
  RecordField,
  SelectField,
  SelectInput,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "@/components/admin";

export interface JsonSchemaProperty {
  type: "string" | "number" | "integer" | "boolean";
  format?: "email" | "date" | "date-time" | "uri";
  enum?: readonly string[];
  title?: string;
}

export interface JsonSchema {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
}

/**
 * Generates a List/Edit/Show view from a flat JSON Schema. Each top-level
 * property maps to an appropriate field or input component based on `type`
 * and `format`. Override individual property renderings via `overrides`.
 *
 * Flat schemas only in v1 — nested objects and array-of-object are deferred.
 *
 * @example
 * <SchemaDrivenView schema={SCHEMA} mode="show" />
 * <SchemaDrivenView schema={SCHEMA} mode="list" />
 * <SchemaDrivenView schema={SCHEMA} mode="edit" overrides={{ title: <TextInput source="title" multiline /> }} />
 */
export const SchemaDrivenView = ({
  schema,
  mode,
  overrides,
}: SchemaDrivenViewProps) => {
  const entries = Object.entries(schema.properties);

  if (mode === "list") {
    return (
      <DataTable>
        {entries.map(([key, prop]) => {
          if (overrides?.[key]) {
            return (
              <DataTable.Col key={key} source={key} label={prop.title}>
                {overrides[key]}
              </DataTable.Col>
            );
          }
          return (
            <DataTable.Col key={key} source={key} label={prop.title}>
              {renderField(key, prop)}
            </DataTable.Col>
          );
        })}
      </DataTable>
    );
  }

  if (mode === "edit") {
    return (
      <SimpleForm>
        {entries.map(([key, prop]) => {
          if (overrides?.[key]) {
            return <span key={key}>{overrides[key]}</span>;
          }
          return renderInput(key, prop);
        })}
      </SimpleForm>
    );
  }

  // show
  return (
    <SimpleShowLayout>
      {entries.map(([key, prop]) => {
        if (overrides?.[key]) {
          return (
            <RecordField key={key} source={key} label={prop.title}>
              {overrides[key]}
            </RecordField>
          );
        }
        return (
          <RecordField key={key} source={key} label={prop.title}>
            {renderField(key, prop)}
          </RecordField>
        );
      })}
    </SimpleShowLayout>
  );
};

function renderField(key: string, prop: JsonSchemaProperty): ReactNode {
  if (prop.enum) {
    return (
      <SelectField
        source={key}
        choices={prop.enum.map((v) => ({ id: v, name: v }))}
      />
    );
  }
  if (prop.format === "email") return <EmailField source={key} />;
  if (prop.format === "date" || prop.format === "date-time") {
    return <DateField source={key} />;
  }
  if (prop.type === "boolean") return <BooleanField source={key} />;
  if (prop.type === "number" || prop.type === "integer") {
    return <NumberField source={key} />;
  }
  return <TextField source={key} />;
}

function renderInput(key: string, prop: JsonSchemaProperty): ReactNode {
  if (prop.enum) {
    return (
      <SelectInput
        key={key}
        source={key}
        choices={prop.enum.map((v) => ({ id: v, name: v }))}
      />
    );
  }
  if (prop.format === "date" || prop.format === "date-time") {
    return <DateInput key={key} source={key} />;
  }
  if (prop.type === "boolean") {
    return <BooleanInput key={key} source={key} />;
  }
  if (prop.type === "number" || prop.type === "integer") {
    return <NumberInput key={key} source={key} />;
  }
  return <TextInput key={key} source={key} />;
}

export interface SchemaDrivenViewProps {
  schema: JsonSchema;
  mode: "list" | "edit" | "show";
  /** Map of property key → custom ReactNode used instead of the default mapping. */
  overrides?: Record<string, ReactNode>;
}
```

- [ ] **Step 4** — append export + gallery entry.
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit + docs commit.

### Task 2.3: Doc page

**Files:** Create `docs/src/content/docs/schema-driven-view.md`

- [ ] **Step 1** — write:

````markdown
---
title: "SchemaDrivenView"
---

Generates a List/Edit/Show view from a flat JSON Schema. Maps property `type`
+ `format` + `enum` to admin field / input components.

## Usage

```tsx
import { SchemaDrivenView } from '@/components/admin';

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    email: { type: 'string', format: 'email' },
    publishedAt: { type: 'string', format: 'date' },
    status: { type: 'string', enum: ['draft', 'review', 'published'] },
    views: { type: 'integer' },
  },
};

<SchemaDrivenView schema={SCHEMA} mode="show" />
<SchemaDrivenView schema={SCHEMA} mode="edit" />
<SchemaDrivenView schema={SCHEMA} mode="list" />
```

## Props

| Prop        | Required | Type                          | Default | Description |
| ----------- | -------- | ----------------------------- | ------- | ----------- |
| `schema`    | Required | `JsonSchema`                  | -       | Flat object schema |
| `mode`      | Required | `"list" \| "edit" \| "show"`  | -       | View kind |
| `overrides` | Optional | `Record<string, ReactNode>`   | -       | Property-key → custom rendering |

## Mapping table

| Property                          | Show field        | Edit input    |
| --------------------------------- | ----------------- | ------------- |
| `type: 'string'`                  | `TextField`       | `TextInput`   |
| `type: 'string', format: 'email'` | `EmailField`      | `TextInput`   |
| `type: 'string', format: 'date'`  | `DateField`       | `DateInput`   |
| `type: 'number' \| 'integer'`     | `NumberField`     | `NumberInput` |
| `type: 'boolean'`                 | `BooleanField`    | `BooleanInput`|
| `enum: [...]`                     | `SelectField`     | `SelectInput` |

## Limitations

- Flat schemas only. Nested object and array-of-object schemas are deferred.
- `$ref`, `allOf`, `oneOf` are not supported.
````

- [ ] **Step 2** — commit.

---

## Component 3: ThemeStudio

Live editor for `AdminTheme` CSS custom properties. Updates `document.documentElement` directly so preview is instant.

### Task 3.1: Story file

**Files:** Create `src/stories/extras/theme-studio.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import { ThemeProvider, ThemeStudio, defaultTheme } from "@/components/admin";

export default { title: "Extras/ThemeStudio" };

export const Basic = () => (
  <ThemeProvider lightTheme={defaultTheme}>
    <div className="p-4">
      <p>Background sample text</p>
      <ThemeStudio theme={defaultTheme} />
    </div>
  </ThemeProvider>
);

export const ColorOnly = () => (
  <ThemeProvider lightTheme={defaultTheme}>
    <div className="p-4">
      <ThemeStudio theme={defaultTheme} filter="color" />
    </div>
  </ThemeProvider>
);

export const NoExport = () => (
  <ThemeProvider lightTheme={defaultTheme}>
    <div className="p-4">
      <ThemeStudio theme={defaultTheme} showExport={false} />
    </div>
  </ThemeProvider>
);
```

### Task 3.2: Implement `<ThemeStudio>` + spec

**Files:** Create `src/components/extras/theme-studio.tsx`, `src/components/extras/theme-studio.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, ColorOnly, NoExport } from "@/stories/extras/theme-studio.stories";

describe("<ThemeStudio />", () => {
  it("renders one row per CSS variable in the theme's light map", async () => {
    const screen = render(<Basic />);
    const rows = screen.container.querySelectorAll("[data-theme-var]");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("filters to color-only when filter='color'", async () => {
    const screen = render(<ColorOnly />);
    const rows = screen.container.querySelectorAll("[data-theme-var]");
    Array.from(rows).forEach((row) => {
      const val = row.getAttribute("data-value") ?? "";
      expect(
        /oklch\(|#[0-9a-f]{3,8}|rgb|hsl/i.test(val) || val === "",
      ).toBe(true);
    });
  });

  it("renders the export button by default", async () => {
    const screen = render(<Basic />);
    const btn = screen.container.querySelector("[data-theme-export]");
    expect(btn).toBeTruthy();
  });

  it("hides the export button when showExport=false", async () => {
    const screen = render(<NoExport />);
    expect(
      screen.container.querySelector("[data-theme-export]"),
    ).toBeNull();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/theme-studio.tsx
import { useEffect, useState } from "react";
import type { AdminTheme, ThemeVars } from "@/components/admin/theme-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COLOR_RE = /oklch\(|#[0-9a-f]{3,8}|^rgb|^hsl/i;

/**
 * Live editor for an `AdminTheme`'s CSS custom properties. Each var becomes
 * an editable text input; on change, the variable is set directly on
 * `document.documentElement` for instant preview. Export emits a TypeScript
 * snippet to the clipboard.
 *
 * @example
 * <ThemeStudio theme={defaultTheme} />
 */
export const ThemeStudio = ({
  theme,
  filter,
  showExport = true,
  className,
}: ThemeStudioProps) => {
  const [vars, setVars] = useState<ThemeVars>(theme.light);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVars(theme.light);
  }, [theme]);

  const entries = Object.entries(vars).filter(([key, val]) => {
    if (filter === "color") return COLOR_RE.test(val);
    if (filter === "size") return /rem|px|%/i.test(val);
    return true;
  });

  const update = (key: string, value: string) => {
    setVars((cur) => ({ ...cur, [key]: value }));
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(key, value);
    }
  };

  const handleExport = async () => {
    const snippet = `export const customTheme: AdminTheme = {
  name: "${theme.name}-custom",
  light: ${JSON.stringify(vars, null, 2)},
};`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <Card className={cn("max-h-[60vh] overflow-y-auto", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Theme Studio</CardTitle>
        {showExport && (
          <Button
            size="sm"
            variant="outline"
            data-theme-export
            onClick={handleExport}
          >
            {copied ? "Copied!" : "Export"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {entries.map(([key, value]) => {
            const isColor = COLOR_RE.test(value);
            return (
              <li
                key={key}
                data-theme-var={key}
                data-value={value}
                className="flex items-center gap-2"
              >
                {isColor && (
                  <span
                    className="inline-block h-4 w-4 rounded border"
                    style={{ backgroundColor: value }}
                  />
                )}
                <span className="w-44 truncate font-mono text-xs">
                  {key}
                </span>
                <Input
                  value={value}
                  onChange={(e) => update(key, e.target.value)}
                  className="font-mono text-xs"
                />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export interface ThemeStudioProps {
  /** Theme whose `light` vars are edited. */
  theme: AdminTheme;
  /** Restrict to color or size variables. */
  filter?: "color" | "size";
  /** Hide the Export button. Default `true` (visible). */
  showExport?: boolean;
  className?: string;
}
```

- [ ] **Step 4** — append export + gallery entry.
- [ ] **Step 5** — run spec, expect PASS 4/4.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit + docs commit.

### Task 3.3: Doc page

**Files:** Create `docs/src/content/docs/theme-studio.md`

- [ ] **Step 1** — write:

````markdown
---
title: "ThemeStudio"
---

Live editor for an `AdminTheme`'s CSS custom properties. Updates
`document.documentElement` directly so changes are visible instantly.

## Usage

```tsx
import { ThemeProvider, ThemeStudio, defaultTheme } from '@/components/admin';

<ThemeProvider lightTheme={defaultTheme}>
  <ThemeStudio theme={defaultTheme} />
</ThemeProvider>
```

## Props

| Prop         | Required | Type                  | Default | Description |
| ------------ | -------- | --------------------- | ------- | ----------- |
| `theme`      | Required | `AdminTheme`          | -       | Theme being edited |
| `filter`     | Optional | `"color" \| "size"`   | -       | Restrict editable vars |
| `showExport` | Optional | `boolean`             | `true`  | Show Export button |
| `className`  | Optional | `string`              | -       | CSS class on the panel |

## Export

The Export button copies a TypeScript `AdminTheme` snippet to the clipboard.
v1 doesn't persist edits; reload reverts to the original theme.

## Limitations

- v1 edits only the `light` variant. Dark-mode editing is deferred.
- No undo/redo. Live edits stack.
````

- [ ] **Step 2** — commit.

---

## Component 4: LayoutBuilder

Drag-drop column reorder for `<DataTable>`. Persists arrangement to `useStore`. v1 = `list-columns` mode only.

### Task 4.1: Story file

**Files:** Create `src/stories/extras/layout-builder.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import {
  CoreAdminContext,
  ResourceContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { LayoutBuilder, ThemeProvider } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={fakeRestProvider({ posts: [] }, false)}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        <ResourceContextProvider value="posts">
          {children}
        </ResourceContextProvider>
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

const FIELDS = ["id", "title", "author", "publishedAt", "views"];

export default { title: "Extras/LayoutBuilder" };

export const Basic = () => (
  <Wrapper>
    <LayoutBuilder availableFields={FIELDS} mode="list-columns" />
  </Wrapper>
);

export const WithStoredOrder = () => (
  <Wrapper>
    <LayoutBuilder
      availableFields={FIELDS}
      mode="list-columns"
      defaultOrder={["title", "id", "author", "publishedAt", "views"]}
    />
  </Wrapper>
);

export const CustomStoreKey = () => (
  <Wrapper>
    <LayoutBuilder
      availableFields={FIELDS}
      mode="list-columns"
      storeKey="my-custom-layout"
    />
  </Wrapper>
);
```

### Task 4.2: Implement `<LayoutBuilder>` + spec

**Files:** Create `src/components/extras/layout-builder.tsx`, `src/components/extras/layout-builder.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  CustomStoreKey,
  WithStoredOrder,
} from "@/stories/extras/layout-builder.stories";

describe("<LayoutBuilder />", () => {
  it("renders one row per available field", async () => {
    const screen = render(<Basic />);
    const rows = screen.container.querySelectorAll("[data-layout-row]");
    expect(rows.length).toBe(5);
  });

  it("displays fields in defaultOrder when provided", async () => {
    const screen = render(<WithStoredOrder />);
    const rows = Array.from(
      screen.container.querySelectorAll("[data-layout-row]"),
    ).map((r) => r.getAttribute("data-field"));
    expect(rows).toEqual([
      "title",
      "id",
      "author",
      "publishedAt",
      "views",
    ]);
  });

  it("respects custom storeKey", async () => {
    const screen = render(<CustomStoreKey />);
    const root = screen.container.querySelector(
      "[data-layout-builder]",
    ) as HTMLElement;
    expect(root.getAttribute("data-store-key")).toBe("my-custom-layout");
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/layout-builder.tsx
import { useMemo } from "react";
import { useResourceContext, useStore } from "ra-core";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drag-drop column reorder for a resource's list view. Persists the order
 * to `useStore` under a deterministic key so consumers can read it back into
 * `<DataTable storeKey>`.
 *
 * v1 ships `mode="list-columns"` only.
 *
 * @example
 * <LayoutBuilder
 *   availableFields={["id", "title", "author"]}
 *   mode="list-columns"
 * />
 */
export const LayoutBuilder = ({
  availableFields,
  mode = "list-columns",
  defaultOrder,
  storeKey,
  resource: resourceProp,
  className,
}: LayoutBuilderProps) => {
  const resource = useResourceContext({ resource: resourceProp });
  const key = storeKey ?? `layout.${resource ?? "unknown"}.${mode}`;
  const [order, setOrder] = useStore<string[]>(key, defaultOrder ?? availableFields);
  const items = useMemo(
    () => order ?? availableFields,
    [order, availableFields],
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setOrder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <Card
      data-layout-builder
      data-store-key={key}
      className={cn("w-80", className)}
    >
      <CardHeader>
        <CardTitle className="text-sm">Layout — {mode}</CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-1">
              {items.map((field) => (
                <Row key={field} id={field} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};

const Row = ({ id }: { id: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      data-layout-row
      data-field={id}
      className={cn(
        "flex items-center gap-2 rounded border bg-background p-2 text-sm",
        isDragging && "opacity-50",
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="font-mono">{id}</span>
    </li>
  );
};

export interface LayoutBuilderProps {
  /** All fields available for the resource. */
  availableFields: readonly string[];
  /** Layout mode. Only `list-columns` is implemented in v1. */
  mode?: "list-columns" | "show-layout" | "edit-form";
  /** Override the initial order. */
  defaultOrder?: readonly string[];
  /** Override the auto-derived store key. */
  storeKey?: string;
  /** Override resource. */
  resource?: string;
  className?: string;
}
```

- [ ] **Step 4** — append export + gallery entry.
- [ ] **Step 5** — run spec, expect PASS 3/3.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit + docs commit.

### Task 4.3: Doc page

**Files:** Create `docs/src/content/docs/layout-builder.md`

- [ ] **Step 1** — write:

````markdown
---
title: "LayoutBuilder"
---

Drag-drop reorder UI for a resource's list columns. Persists the order to
`useStore` under a deterministic key so consumers can read it back into
`<DataTable storeKey>`.

## Usage

```tsx
import { LayoutBuilder } from '@/components/admin';

<LayoutBuilder
  availableFields={["id", "title", "author"]}
  mode="list-columns"
/>
```

## Props

| Prop              | Required | Type                                              | Default                              | Description |
| ----------------- | -------- | ------------------------------------------------- | ------------------------------------ | ----------- |
| `availableFields` | Required | `readonly string[]`                               | -                                    | All fields the resource exposes |
| `mode`            | Optional | `"list-columns" \| "show-layout" \| "edit-form"`  | `"list-columns"`                     | Layout target (v1 ships list-columns only) |
| `defaultOrder`    | Optional | `readonly string[]`                               | `availableFields`                    | Initial order |
| `storeKey`        | Optional | `string`                                          | `\`layout.<resource>.<mode>\``       | Override persistence key |
| `resource`        | Optional | `string`                                          | Context                              | Override resource |

## Persistence

Pair with `<DataTable storeKey={\`layout.\${resource}.list-columns\`}>` so the
data table picks up the reordered arrangement.

## Out of scope (v1)

- `show-layout` and `edit-form` modes.
- Visibility toggles per field (`<Configurable>` handles that today).
- Preview of how the layout will render.
````

- [ ] **Step 2** — commit.

---

## Component 5: I18nKeyEditor

Runtime missing-translation capture. Wraps the i18n provider so every `translate(key)` is observed; missing keys surface in a floating panel for inline editing.

### Task 5.1: Story file

**Files:** Create `src/stories/extras/i18n-key-editor.stories.tsx`

- [ ] **Step 1** — create:

```tsx
import {
  CoreAdminContext,
  TestMemoryRouter,
  memoryStore,
  useTranslate,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { I18nKeyEditor, ThemeProvider } from "@/components/admin";

const baseI18n = polyglotI18nProvider(
  () => englishMessages,
  "en",
  [{ name: "en", value: "English" }],
  { allowMissing: true },
);

const CallerComponent = () => {
  const translate = useTranslate();
  return (
    <ul>
      <li>{translate("custom.foo.bar")}</li>
      <li>{translate("custom.foo.baz")}</li>
      <li>{translate("custom.missing.key")}</li>
      <li>{translate("ra.action.save")}</li>
    </ul>
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={{
          getList: async () => ({ data: [], total: 0 }),
          getOne: async () => ({ data: { id: 0 } }),
          getMany: async () => ({ data: [] }),
          getManyReference: async () => ({ data: [], total: 0 }),
          update: async ({ data }) => ({ data }),
          updateMany: async () => ({ data: [] }),
          create: async ({ data }) => ({ data: { ...data, id: 1 } as never }),
          delete: async () => ({ data: { id: 0 } as never }),
          deleteMany: async () => ({ data: [] }),
        }}
        i18nProvider={baseI18n}
        store={memoryStore()}
      >
        {children}
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);

export default { title: "Extras/I18nKeyEditor" };

export const Basic = () => (
  <Wrapper>
    <I18nKeyEditor baseProvider={baseI18n}>
      <CallerComponent />
    </I18nKeyEditor>
  </Wrapper>
);

export const Hidden = () => (
  <Wrapper>
    <I18nKeyEditor baseProvider={baseI18n} defaultOpen={false}>
      <CallerComponent />
    </I18nKeyEditor>
  </Wrapper>
);

export const NoExport = () => (
  <Wrapper>
    <I18nKeyEditor baseProvider={baseI18n} showExport={false}>
      <CallerComponent />
    </I18nKeyEditor>
  </Wrapper>
);
```

### Task 5.2: Implement `<I18nKeyEditor>` + spec

**Files:** Create `src/components/extras/i18n-key-editor.tsx`, `src/components/extras/i18n-key-editor.spec.tsx`

- [ ] **Step 1** — write spec:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Hidden,
  NoExport,
} from "@/stories/extras/i18n-key-editor.stories";

describe("<I18nKeyEditor />", () => {
  it("renders the floating panel by default", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText(/missing keys/i)).toBeInTheDocument();
  });

  it("captures missing keys from useTranslate calls", async () => {
    const screen = render(<Basic />);
    // The CallerComponent translates 3 keys with the `custom.*` prefix that
    // aren't in englishMessages. Each should appear in the missing-keys panel.
    await expect.element(screen.getByText("custom.foo.bar")).toBeInTheDocument();
    await expect
      .element(screen.getByText("custom.missing.key"))
      .toBeInTheDocument();
  });

  it("does NOT list keys that resolved to a translation", async () => {
    const screen = render(<Basic />);
    // ra.action.save is a real key in englishMessages so it should not appear
    // in the missing-keys panel.
    const panel = screen.container.querySelector("[data-i18n-panel]");
    expect(panel?.textContent ?? "").not.toContain("ra.action.save");
  });

  it("hides the panel when defaultOpen=false", async () => {
    const screen = render(<Hidden />);
    const panel = screen.container.querySelector("[data-i18n-panel]");
    expect(panel?.getAttribute("data-open")).toBe("false");
  });

  it("hides the Export button when showExport=false", async () => {
    const screen = render(<NoExport />);
    expect(
      screen.container.querySelector("[data-i18n-export]"),
    ).toBeNull();
  });
});
```

- [ ] **Step 2** — run spec, expect FAIL.

- [ ] **Step 3** — implement:

```tsx
// src/components/extras/i18n-key-editor.tsx
import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { I18nProviderContext, type I18nProvider } from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Wraps an i18n provider so missing-key calls (where `translate(key)` returns
 * the key itself) are captured and surfaced in a floating panel.
 *
 * The panel allows inline editing of captured keys; Export copies a flat JSON
 * patch to the clipboard suitable for merging into a locale file.
 *
 * v1 only sees keys looked up via the React `useTranslate()` hook reachable
 * from this component's subtree.
 *
 * @example
 * <I18nKeyEditor baseProvider={i18nProvider}>
 *   <Resource name="posts" />
 * </I18nKeyEditor>
 */
export const I18nKeyEditor = ({
  children,
  baseProvider,
  defaultOpen = true,
  showExport = true,
}: I18nKeyEditorProps) => {
  const [missing, setMissing] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const record = useCallback(
    (key: string) => {
      setMissing((cur) => (key in cur ? cur : { ...cur, [key]: "" }));
    },
    [],
  );

  const wrapped = useMemo<I18nProvider>(() => {
    return {
      ...baseProvider,
      translate(key: string, options?: Record<string, unknown>) {
        const out = baseProvider.translate(key, options);
        // polyglot returns the key when missing + allowMissing
        if (typeof out === "string" && out === key) {
          record(key);
        }
        return out;
      },
    };
  }, [baseProvider, record]);

  const handleExport = async () => {
    const json = JSON.stringify(
      Object.fromEntries(
        Object.entries(missing).filter(([, v]) => v.trim().length > 0),
      ),
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const entries = Object.entries(missing);

  return (
    <I18nProviderContext.Provider value={wrapped}>
      {children}
      <Card
        data-i18n-panel
        data-open={open ? "true" : "false"}
        className={cn(
          "fixed bottom-4 left-4 z-50 w-96 max-h-[60vh] overflow-y-auto shadow-xl transition",
          !open && "translate-y-[calc(100%+1rem)]",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <CardTitle className="text-sm">
            Missing keys ({entries.length})
          </CardTitle>
          <div className="flex gap-1">
            {showExport && (
              <Button
                size="sm"
                variant="outline"
                data-i18n-export
                onClick={handleExport}
              >
                {copied ? "Copied!" : "Export"}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No missing keys captured yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {entries.map(([key, val]) => (
                <li key={key} className="flex flex-col gap-1">
                  <span className="font-mono text-xs">{key}</span>
                  <Input
                    value={val}
                    onChange={(e) =>
                      setMissing((cur) => ({ ...cur, [key]: e.target.value }))
                    }
                    placeholder="Translation…"
                    className="text-xs"
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </I18nProviderContext.Provider>
  );
};

export interface I18nKeyEditorProps {
  children: ReactNode;
  /** The original i18nProvider being wrapped. */
  baseProvider: I18nProvider;
  /** Initial panel state. */
  defaultOpen?: boolean;
  /** Show the Export-to-clipboard button. */
  showExport?: boolean;
}
```

- [ ] **Step 4** — append export + gallery entry.
- [ ] **Step 5** — run spec, expect PASS 5/5.
- [ ] **Step 6** — lint + typecheck.
- [ ] **Step 7** — commit + docs commit.

### Task 5.3: Doc page

**Files:** Create `docs/src/content/docs/i18n-key-editor.md`

- [ ] **Step 1** — write:

````markdown
---
title: "I18nKeyEditor"
---

Wraps an i18n provider so every missing-key lookup is captured and surfaced
in a floating panel. Inline-edit translations; Export emits a JSON patch to
the clipboard.

## Usage

```tsx
import { Admin, I18nKeyEditor, Resource } from '@/components/admin';

const App = () => (
  <Admin
    dataProvider={myDataProvider}
    i18nProvider={myI18n}
  >
    <I18nKeyEditor baseProvider={myI18n}>
      <Resource name="posts" {...} />
    </I18nKeyEditor>
  </Admin>
);
```

## Props

| Prop          | Required | Type           | Default | Description |
| ------------- | -------- | -------------- | ------- | ----------- |
| `children`    | Required | `ReactNode`    | -       | Tree to track |
| `baseProvider`| Required | `I18nProvider` | -       | Original provider |
| `defaultOpen` | Optional | `boolean`      | `true`  | Panel state at mount |
| `showExport`  | Optional | `boolean`      | `true`  | Show Export button |

## Detection mechanism

A key is "missing" when `baseProvider.translate(key)` returns the literal key.
That requires the provider to support `allowMissing: true` (the polyglot
default). Translated keys are not captured.

## Limitations

- v1 only captures via `useTranslate()` calls; direct
  `i18nProvider.translate(...)` invocations are not observable through React
  context.
- No filesystem write — export is clipboard-only.
````

- [ ] **Step 2** — commit.

---

## Final task: Sidebar + batch verification

- [ ] **Step 1** — add 5 sidebar entries to `docs/sidebar.config.mjs` under the **Extras** section in alpha order:

```
"data-provider-devtools",
"i18n-key-editor",
"layout-builder",
"schema-driven-view",
"theme-studio",
```

- [ ] **Step 2** — run all doc-drift scripts (from `docs/` dir):

```bash
pnpm run check-docs
pnpm run check-sidebar
pnpm run check-stories
pnpm run check-specs
pnpm run check-demo-coverage
```

Expected: all green.

- [ ] **Step 3** — run lint + typecheck + full test suite in parallel:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
```

Expected: 0 errors, all green.

- [ ] **Step 4** — commit sidebar update:

```bash
git add docs/sidebar.config.mjs
git commit -m "docs(sidebar): add Tier 4 dev-experience components"
```

---

## Out of scope (v1)

- **DataProviderDevtools**: cache hit/miss tracking, request payload diff vs cache, time-series chart.
- **SchemaDrivenView**: nested object / array-of-object schemas, `$ref` / `allOf` / `oneOf`, dynamic schema refresh.
- **ThemeStudio**: dark-mode editing, undo/redo, theme persistence to file.
- **LayoutBuilder**: `show-layout` and `edit-form` modes, visibility toggles (use `<Configurable>`), preview rendering.
- **I18nKeyEditor**: filesystem write, IDE integration, namespace grouping with collapse, locale switcher to test across locales.

---

## Self-review notes

- All five components live in `src/components/extras/`.
- Tests are scoped tightly: dnd events not directly tested; provider proxying tested via observable log/captured state; theme variable updates tested via data attributes.
- Each component opts out of strict UI tests where doing so would make the spec fragile (e.g., LayoutBuilder doesn't test the drag motion, only the rendered order).
- No new runtime deps.
- The plan budgets each component for a single subagent dispatch (~150-400 LoC impl + spec + story + doc).

## Execution handoff

Plan saved at `docs/superpowers/plans/2026-05-16-tier-4-dev-experience-components.md`.

Five components → five subagent dispatches:
1. DataProviderDevtools (Tasks 1.1, 1.2, 1.3)
2. SchemaDrivenView (Tasks 2.1, 2.2, 2.3)
3. ThemeStudio (Tasks 3.1, 3.2, 3.3)
4. LayoutBuilder (Tasks 4.1, 4.2, 4.3)
5. I18nKeyEditor (Tasks 5.1, 5.2, 5.3)

Subagent-driven, worktree-isolated, parallel. Same as T1/T2/T3.
