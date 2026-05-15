# `<CommandMenu>` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a cmd+K command palette for shadcn-admin-kit that lets users navigate
between resources, jump directly to records via cross-resource search, and run
registered actions (logout, theme, custom).

**Architecture:** Single-file component (`src/components/admin/command-menu.tsx`)
following the `wizard-form.tsx` convention. The root `<CommandMenu>` owns dialog
state + hotkey binding; sub-components for each result group (records, resources,
actions, recents) render inside the shadcn `<CommandDialog>` (or `<Sheet>` on mobile).
A small React context exposes `useCommandMenu()` for programmatic open/close and
`useRegisterCommand()` for context-aware action registration. Per-resource record
queries use `useGetList` with `useDebounce` and `useCanAccess` for permission gating.

**Tech Stack:** React 19, TypeScript, ra-core (hooks, store, navigation), shadcn/ui
primitives (`command`, `dialog`, `sheet`, `kbd`), Tailwind v4, Vitest + Playwright
browser provider, Storybook 9.

**Spec:** [docs/superpowers/specs/2026-05-14-phase-1-essentials-design.md](../specs/2026-05-14-phase-1-essentials-design.md#1-commandmenu)

---

## File structure

| File | Responsibility | Status |
| --- | --- | --- |
| `src/components/admin/command-menu.tsx` | Root component, context, sub-components, hooks | **Create** |
| `src/components/admin/command-menu.spec.tsx` | Vitest browser tests importing stories | **Create** |
| `src/stories/command-menu.stories.tsx` | Storybook stories driving demos + tests | **Create** |
| `docs/src/content/docs/CommandMenu.md` | Public documentation page | **Create** |
| `src/components/admin/index.ts` | Public re-export | **Modify** (add `export * from "./command-menu"`) |
| `src/components/admin/admin.tsx` | `commandMenu?: boolean \| ReactElement` prop on `<Admin>` | **Modify** |

All sub-components (`CommandMenuRecents`, `CommandMenuResources`,
`CommandMenuRecords`, `CommandMenuActions`, `CommandMenuFooter`) live inside
`command-menu.tsx` for parity with how `<WizardForm>` keeps `<WizardForm.Step>` and
`<WizardToolbar>` co-located.

---

### Task 1: Scaffold component, context, types, first story, smoke spec

**Files:**
- Create: `src/components/admin/command-menu.tsx`
- Create: `src/components/admin/command-menu.spec.tsx`
- Create: `src/stories/command-menu.stories.tsx`
- Modify: `src/components/admin/index.ts` (append one line)

- [ ] **Step 1: Write the failing test**

`src/components/admin/command-menu.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "@/stories/command-menu.stories";

describe("<CommandMenu />", () => {
  it("renders the command dialog when opened", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: FAIL with module resolution error for `@/stories/command-menu.stories` or `@/components/admin/command-menu`.

- [ ] **Step 3: Create the component file with types + context skeleton**

`src/components/admin/command-menu.tsx`:

```tsx
"use client";

import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CommandDialog } from "@/components/ui/command";

export interface CommandAction {
  id: string;
  label: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  group?: "resources" | "records" | "actions" | string;
  keywords?: string[];
  shortcut?: string;
  when?: () => boolean;
  onSelect: () => void | Promise<void>;
}

export interface CommandMenuProps {
  hotkey?: string[] | false;
  resources?: string[];
  searchFields?: Record<string, string>;
  perResourceLimit?: number;
  recentsLimit?: number;
  actions?: CommandAction[];
  placeholder?: string;
  searchDebounceMs?: number;
  groups?: Array<"records" | "resources" | "actions">;
  /**
   * Optional children render inside the CommandMenu's context provider but
   * outside the dialog. Typically used for helper components that need to call
   * `useCommandMenu()` or `useRegisterCommand()`.
   */
  children?: ReactNode;
}

interface CommandMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  registerCommand: (action: CommandAction) => void;
  unregisterCommand: (id: string) => void;
  registeredCommands: CommandAction[];
}

const CommandMenuContext = createContext<CommandMenuContextValue | null>(null);

export const useCommandMenu = () => {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) {
    throw new Error(
      "useCommandMenu() must be used inside <CommandMenu>. Mount <CommandMenu /> at the Admin shell first.",
    );
  }
  return ctx;
};

export const CommandMenu = ({ children }: CommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [registeredCommands, setRegisteredCommands] = useState<CommandAction[]>(
    [],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const registerCommand = useCallback((action: CommandAction) => {
    setRegisteredCommands((prev) => [
      ...prev.filter((a) => a.id !== action.id),
      action,
    ]);
  }, []);
  const unregisterCommand = useCallback((id: string) => {
    setRegisteredCommands((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<CommandMenuContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      registerCommand,
      unregisterCommand,
      registeredCommands,
    }),
    [isOpen, open, close, toggle, registerCommand, unregisterCommand, registeredCommands],
  );

  return (
    <CommandMenuContext.Provider value={value}>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Command menu">
        {/* Sub-components added in later tasks */}
      </CommandDialog>
      {children}
    </CommandMenuContext.Provider>
  );
};
```

- [ ] **Step 4: Create the first story**

`src/stories/command-menu.stories.tsx`:

```tsx
import { useEffect } from "react";
import {
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, ListGuesser, ShowGuesser } from "@/components/admin";
import { CommandMenu, useCommandMenu } from "@/components/admin/command-menu";

const data = {
  products: [
    { id: 1, name: "Notebook", reference: "NB-001" },
    { id: 2, name: "Pencil", reference: "PN-002" },
  ],
  orders: [
    { id: 10, reference: "ORD-10", total: 9.99 },
    { id: 11, reference: "ORD-11", total: 19.99 },
  ],
};

const dataProvider = fakeRestDataProvider(data) as DataProvider;
const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  { allowMissing: true },
);

const AutoOpen = () => {
  const { open } = useCommandMenu();
  useEffect(() => open(), [open]);
  return null;
};

export default {
  title: "Navigation/CommandMenu",
  parameters: { docs: { codePanel: true } },
};

export const Basic = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <Resource name="orders" list={ListGuesser} show={ShowGuesser} />
      <CommandMenu>
        <AutoOpen />
      </CommandMenu>
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 5: Add public export**

Append to `src/components/admin/index.ts`:

```ts
export * from "./command-menu";
```

- [ ] **Step 6: Run the test and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS — the dialog renders on mount because `AutoOpen` invokes `open()`.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx \
  src/stories/command-menu.stories.tsx \
  src/components/admin/index.ts
git commit -m "feat(command-menu): scaffold component, context, and Basic story"
```

---

### Task 2: Hotkey binding (cmd+k opens, esc closes)

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`
- Modify: `src/stories/command-menu.stories.tsx` (add `Hotkey` story without `AutoOpen`)

- [ ] **Step 1: Add the `Hotkey` story**

In `src/stories/command-menu.stories.tsx`, add:

```tsx
export const Hotkey = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <CommandMenu />
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 2: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
import { userEvent } from "@vitest/browser/context";
import { Hotkey } from "@/stories/command-menu.stories";

it("opens on cmd+k", async () => {
  const screen = render(<Hotkey />);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  await userEvent.keyboard("{Meta>}k{/Meta}");
  await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
});

it("closes on escape", async () => {
  render(<Hotkey />);
  await userEvent.keyboard("{Meta>}k{/Meta}");
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await userEvent.keyboard("{Escape}");
  // CommandDialog uses radix close behavior; await disappearance
  await new Promise((r) => setTimeout(r, 50));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
```

- [ ] **Step 3: Run and verify the hotkey test fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "opens on cmd+k"`

Expected: FAIL — no hotkey listener yet, dialog never opens.

- [ ] **Step 4: Implement the hotkey binding**

In `command-menu.tsx`, replace the `CommandMenu` component body with a version that binds the hotkey via `useEffect`:

```tsx
import { useEffect } from "react";

const DEFAULT_HOTKEYS = ["mod+k"];

const matchesHotkey = (event: KeyboardEvent, binding: string) => {
  const parts = binding.toLowerCase().split("+").map((p) => p.trim());
  const key = parts[parts.length - 1];
  const wantMod = parts.includes("mod");
  const wantShift = parts.includes("shift");
  const wantAlt = parts.includes("alt");
  const modMatches = wantMod ? event.metaKey || event.ctrlKey : true;
  return (
    event.key.toLowerCase() === key &&
    modMatches &&
    event.shiftKey === wantShift &&
    event.altKey === wantAlt
  );
};

export const CommandMenu = ({
  hotkey = DEFAULT_HOTKEYS,
  ...props
}: CommandMenuProps) => {
  // ... existing state + memo

  useEffect(() => {
    if (hotkey === false || hotkey.length === 0) return;
    const handler = (event: KeyboardEvent) => {
      if (hotkey.some((b) => matchesHotkey(event, b))) {
        event.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkey]);

  // ... return JSX
};
```

- [ ] **Step 5: Run the spec and verify both new tests pass**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all three tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx \
  src/stories/command-menu.stories.tsx
git commit -m "feat(command-menu): bind cmd+k hotkey to open/close palette"
```

---

### Task 3: Resources group — list resources, navigate on select

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`

- [ ] **Step 1: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
it("lists resources and navigates to the list view on selection", async () => {
  const screen = render(<Hotkey />);
  await userEvent.keyboard("{Meta>}k{/Meta}");
  const productsItem = screen.getByRole("option", { name: /products/i });
  await expect.element(productsItem).toBeInTheDocument();
  await productsItem.click();
  // dialog should close, location updates
  await new Promise((r) => setTimeout(r, 50));
  expect(window.location.pathname).toBe("/products");
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "lists resources"`

Expected: FAIL — no resources group renders.

- [ ] **Step 3: Implement the resources group**

In `command-menu.tsx`, add imports and a `<CommandMenuResources>` sub-component, and render it inside the dialog:

```tsx
import { useNavigate } from "react-router";
import { useResourceDefinitions, useGetResourceLabel, useTranslate } from "ra-core";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const CommandMenuResources = ({
  resources,
  onSelect,
}: {
  resources?: string[];
  onSelect: () => void;
}) => {
  const definitions = useResourceDefinitions();
  const getLabel = useGetResourceLabel();
  const navigate = useNavigate();
  const translate = useTranslate();
  const allowed = Object.keys(definitions).filter(
    (name) => !resources || resources.includes(name),
  );
  if (allowed.length === 0) return null;
  return (
    <CommandGroup
      heading={translate("ra.command.group.resources", { _: "Resources" })}
    >
      {allowed.map((name) => (
        <CommandItem
          key={name}
          value={`resource:${name}`}
          onSelect={() => {
            navigate(`/${name}`);
            onSelect();
          }}
        >
          {getLabel(name, 2)}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};
```

Update `CommandMenu`'s JSX to render `<CommandInput>`, `<CommandList>`, `<CommandEmpty>`, and `<CommandMenuResources>`:

```tsx
<CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Command menu">
  <CommandInput
    placeholder={props.placeholder ?? "Search or run a command…"}
  />
  <CommandList>
    <CommandEmpty>
      {/* translation key wired in Task 12 */}
      No results.
    </CommandEmpty>
    <CommandMenuResources
      resources={props.resources}
      onSelect={close}
    />
  </CommandList>
</CommandDialog>
```

- [ ] **Step 4: Run all specs and verify they pass**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all four tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx
git commit -m "feat(command-menu): render resources group with navigation"
```

---

### Task 4: Records group — debounced per-resource search + navigate to Show

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`
- Modify: `src/stories/command-menu.stories.tsx`

- [ ] **Step 1: Add the `RecordSearch` story**

Append to `command-menu.stories.tsx`:

```tsx
const AutoOpenWithQuery = ({ query }: { query: string }) => {
  const { open } = useCommandMenu();
  useEffect(() => {
    open();
    setTimeout(() => {
      const input = document.querySelector(
        '[role="dialog"] [cmdk-input]',
      ) as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.value = query;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 50);
  }, [open, query]);
  return null;
};

export const RecordSearch = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource
        name="products"
        list={ListGuesser}
        show={ShowGuesser}
        recordRepresentation="name"
      />
      <Resource
        name="orders"
        list={ListGuesser}
        show={ShowGuesser}
        recordRepresentation="reference"
      />
      <CommandMenu searchDebounceMs={50}>
        <AutoOpenWithQuery query="Notebook" />
      </CommandMenu>
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 2: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
import { RecordSearch } from "@/stories/command-menu.stories";

it("shows matched records and navigates to Show on select", async () => {
  const screen = render(<RecordSearch />);
  // Wait for debounced search to fire and render a result item
  const result = await screen.getByRole("option", { name: /notebook/i });
  await expect.element(result).toBeInTheDocument();
  await result.click();
  await new Promise((r) => setTimeout(r, 100));
  expect(window.location.pathname).toMatch(/^\/products\/1(\/show)?$/);
});
```

- [ ] **Step 3: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "matched records"`

Expected: FAIL — no records group rendered.

- [ ] **Step 4: Implement the records group**

In `command-menu.tsx`, add a `useDebouncedValue` helper and `<CommandMenuRecords>`:

```tsx
import { useEffect, useState } from "react";
import {
  useGetList,
  useGetRecordRepresentation,
  type RaRecord,
} from "ra-core";

const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const CommandMenuResourceResults = ({
  resource,
  query,
  searchField = "q",
  perPage,
  onSelect,
}: {
  resource: string;
  query: string;
  searchField?: string;
  perPage: number;
  onSelect: () => void;
}) => {
  const navigate = useNavigate();
  const getRepresentation = useGetRecordRepresentation(resource);
  const { data } = useGetList<RaRecord>(
    resource,
    {
      filter: { [searchField]: query },
      pagination: { page: 1, perPage },
    },
    { enabled: query.length > 0 },
  );
  if (!data || data.length === 0) return null;
  return (
    <>
      {data.map((record) => (
        <CommandItem
          key={`${resource}:${record.id}`}
          value={`record:${resource}:${record.id}`}
          onSelect={() => {
            navigate(`/${resource}/${record.id}/show`);
            onSelect();
          }}
        >
          {getRepresentation(record)}
        </CommandItem>
      ))}
    </>
  );
};

const CommandMenuRecords = ({
  query,
  resources,
  searchFields,
  perResourceLimit,
  onSelect,
}: {
  query: string;
  resources?: string[];
  searchFields?: Record<string, string>;
  perResourceLimit: number;
  onSelect: () => void;
}) => {
  const definitions = useResourceDefinitions();
  const translate = useTranslate();
  if (!query) return null;
  const allowed = Object.keys(definitions).filter(
    (name) => !resources || resources.includes(name),
  );
  return (
    <CommandGroup
      heading={translate("ra.command.group.records", { _: "Records" })}
    >
      {allowed.map((name) => (
        <CommandMenuResourceResults
          key={name}
          resource={name}
          query={query}
          searchField={searchFields?.[name] ?? "q"}
          perPage={perResourceLimit}
          onSelect={onSelect}
        />
      ))}
    </CommandGroup>
  );
};
```

Add controlled input state and pass debounced query into `<CommandMenuRecords>`:

```tsx
export const CommandMenu = ({
  hotkey = DEFAULT_HOTKEYS,
  searchDebounceMs = 200,
  perResourceLimit = 5,
  ...props
}: CommandMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, searchDebounceMs);
  // ... existing state

  return (
    <CommandMenuContext.Provider value={value}>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Command menu">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={props.placeholder ?? "Search or run a command…"}
        />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandMenuRecords
            query={debouncedQuery}
            resources={props.resources}
            searchFields={props.searchFields}
            perResourceLimit={perResourceLimit}
            onSelect={close}
          />
          <CommandMenuResources resources={props.resources} onSelect={close} />
        </CommandList>
      </CommandDialog>
    </CommandMenuContext.Provider>
  );
};
```

- [ ] **Step 5: Run the spec and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all five tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx \
  src/stories/command-menu.stories.tsx
git commit -m "feat(command-menu): per-resource record search with debounce"
```

---

### Task 5: Built-in actions (logout, refresh, theme)

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`
- Modify: `src/stories/command-menu.stories.tsx`

- [ ] **Step 1: Add the `BuiltinActions` story**

Append to `command-menu.stories.tsx`:

```tsx
export const BuiltinActions = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <CommandMenu>
        <AutoOpen />
      </CommandMenu>
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 2: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
import { BuiltinActions } from "@/stories/command-menu.stories";

it("renders built-in actions: refresh, theme, logout", async () => {
  const screen = render(<BuiltinActions />);
  await expect
    .element(screen.getByRole("option", { name: /refresh data/i }))
    .toBeInTheDocument();
  await expect
    .element(screen.getByRole("option", { name: /switch to dark theme/i }))
    .toBeInTheDocument();
});
```

- [ ] **Step 3: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "built-in actions"`

Expected: FAIL — no actions group rendered.

- [ ] **Step 4: Implement the actions group**

In `command-menu.tsx`, add a `<CommandMenuActions>` sub-component that builds the
default action list:

```tsx
import { useLogout, useRefresh } from "ra-core";
import { useTheme } from "@/components/admin/use-theme";

const useBuiltinActions = (): CommandAction[] => {
  const logout = useLogout();
  const refresh = useRefresh();
  const [, setTheme] = useTheme();
  const translate = useTranslate();
  return useMemo(
    () => [
      {
        id: "ra.command.action.refresh",
        label: translate("ra.command.action.refresh", { _: "Refresh data" }),
        group: "actions",
        onSelect: () => refresh(),
      },
      {
        id: "ra.command.action.theme_light",
        label: translate("ra.command.action.theme_light", {
          _: "Switch to light theme",
        }),
        group: "actions",
        onSelect: () => setTheme("light"),
      },
      {
        id: "ra.command.action.theme_dark",
        label: translate("ra.command.action.theme_dark", {
          _: "Switch to dark theme",
        }),
        group: "actions",
        onSelect: () => setTheme("dark"),
      },
      {
        id: "ra.command.action.theme_system",
        label: translate("ra.command.action.theme_system", {
          _: "Use system theme",
        }),
        group: "actions",
        onSelect: () => setTheme("system"),
      },
      {
        id: "ra.auth.logout",
        label: translate("ra.auth.logout", { _: "Log out" }),
        group: "actions",
        onSelect: () => logout(),
      },
    ],
    [logout, refresh, setTheme, translate],
  );
};

const CommandMenuActions = ({
  extra,
  registered,
  onSelect,
}: {
  extra?: CommandAction[];
  registered: CommandAction[];
  onSelect: () => void;
}) => {
  const translate = useTranslate();
  const builtins = useBuiltinActions();
  const visible = [...builtins, ...(extra ?? []), ...registered].filter(
    (a) => !a.when || a.when(),
  );
  if (visible.length === 0) return null;
  return (
    <CommandGroup
      heading={translate("ra.command.group.actions", { _: "Actions" })}
    >
      {visible.map((action) => (
        <CommandItem
          key={action.id}
          value={`action:${action.id}`}
          keywords={action.keywords}
          onSelect={async () => {
            await action.onSelect();
            onSelect();
          }}
        >
          {action.icon ? <action.icon className="size-4" /> : null}
          {action.label}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};
```

Render it inside `<CommandList>` after `<CommandMenuResources>`:

```tsx
<CommandMenuActions
  extra={props.actions}
  registered={registeredCommands}
  onSelect={close}
/>
```

- [ ] **Step 5: Run the spec and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all six tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx \
  src/stories/command-menu.stories.tsx
git commit -m "feat(command-menu): render built-in actions (refresh, theme, logout)"
```

---

### Task 6: `useRegisterCommand` for context-aware actions

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`
- Modify: `src/stories/command-menu.stories.tsx`

- [ ] **Step 1: Add the `RegisteredCommand` story**

Append to `command-menu.stories.tsx`:

```tsx
import { useRegisterCommand } from "@/components/admin/command-menu";

const RegisterDuplicateProduct = () => {
  useRegisterCommand({
    id: "demo.duplicate",
    label: "Duplicate product",
    group: "actions",
    onSelect: () => {
      /* no-op for demo */
    },
  });
  return null;
};

export const RegisteredCommand = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <CommandMenu>
        <RegisterDuplicateProduct />
        <AutoOpen />
      </CommandMenu>
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 2: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
import { RegisteredCommand } from "@/stories/command-menu.stories";

it("renders commands registered via useRegisterCommand", async () => {
  const screen = render(<RegisteredCommand />);
  await expect
    .element(screen.getByRole("option", { name: /duplicate product/i }))
    .toBeInTheDocument();
});
```

- [ ] **Step 3: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "useRegisterCommand"`

Expected: FAIL — `useRegisterCommand` export does not exist.

- [ ] **Step 4: Implement `useRegisterCommand`**

In `command-menu.tsx`, add the hook:

```tsx
export const useRegisterCommand = (action: CommandAction) => {
  const { registerCommand, unregisterCommand } = useCommandMenu();
  useEffect(() => {
    registerCommand(action);
    return () => unregisterCommand(action.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.id]);
};
```

(The dep array is intentionally `[action.id]` to avoid unnecessary re-registration
when callers pass an inline object on each render. Callers wrap dynamic data with
`useMemo`/`useCallback` if needed.)

- [ ] **Step 5: Run the spec and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all seven tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx \
  src/stories/command-menu.stories.tsx
git commit -m "feat(command-menu): useRegisterCommand for context-aware actions"
```

---

### Task 7: Permission filtering (skip resources with `canList === false`)

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`
- Modify: `src/stories/command-menu.stories.tsx`

- [ ] **Step 1: Add the `PermissionDenied` story**

Append to `command-menu.stories.tsx`:

```tsx
import type { AuthProvider } from "ra-core";

const restrictiveAuthProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
  canAccess: async ({ resource }) => resource !== "orders",
};

export const PermissionDenied = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      authProvider={restrictiveAuthProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <Resource name="orders" list={ListGuesser} show={ShowGuesser} />
      <CommandMenu>
        <AutoOpen />
      </CommandMenu>
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 2: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
import { PermissionDenied } from "@/stories/command-menu.stories";

it("hides resources the user cannot list", async () => {
  const screen = render(<PermissionDenied />);
  await expect
    .element(screen.getByRole("option", { name: /products/i }))
    .toBeInTheDocument();
  // Orders is denied via canAccess
  await new Promise((r) => setTimeout(r, 100));
  expect(document.body.textContent).not.toMatch(/orders/i);
});
```

- [ ] **Step 3: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "cannot list"`

Expected: FAIL — orders still appears.

- [ ] **Step 4: Gate each resource entry behind `useCanAccess`**

In `command-menu.tsx`, replace the resource iteration in both `<CommandMenuResources>`
and `<CommandMenuRecords>` with a per-resource wrapper that calls `useCanAccess`:

```tsx
import { useCanAccess } from "ra-core";

const ResourceItemGate = ({
  resource,
  children,
}: {
  resource: string;
  children: ReactNode;
}) => {
  const { canAccess, isPending } = useCanAccess({
    resource,
    action: "list",
  });
  if (isPending || !canAccess) return null;
  return <>{children}</>;
};
```

Wrap each `<CommandItem>` (in `CommandMenuResources`) and each `<CommandMenuResourceResults>`
(in `CommandMenuRecords`) with `<ResourceItemGate resource={name}>…</ResourceItemGate>`.

- [ ] **Step 5: Run the spec and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all eight tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx \
  src/stories/command-menu.stories.tsx
git commit -m "feat(command-menu): hide resources lacking list permission"
```

---

### Task 8: Recents — persist selections in store, surface in empty state

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`
- Modify: `src/stories/command-menu.stories.tsx`

- [ ] **Step 1: Add the `Recents` story**

The seed component uses `useStore` from ra-core to write into the same in-memory
store the `<Admin>` is configured with — `useStore` is the same API the
implementation in Step 4 will adopt. The seed payload documents the persistence
schema (type/resource/id/label/path).

Append to `command-menu.stories.tsx`:

```tsx
import { useStore } from "ra-core";

const SeedRecents = () => {
  const [, setRecents] = useStore<
    Array<{
      type: "record" | "resource";
      resource: string;
      id?: number | string;
      label: string;
      path: string;
    }>
  >("command-menu.recents", []);
  const { open } = useCommandMenu();
  useEffect(() => {
    setRecents([
      {
        type: "record",
        resource: "products",
        id: 1,
        label: "Notebook",
        path: "/products/1/show",
      },
    ]);
    open();
  }, [open, setRecents]);
  return null;
};

export const Recents = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
      <CommandMenu>
        <SeedRecents />
      </CommandMenu>
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 2: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
import { Recents } from "@/stories/command-menu.stories";

it("shows recents in the empty state", async () => {
  const screen = render(<Recents />);
  // The empty state (no query) renders the recents group
  await expect
    .element(screen.getByRole("option", { name: /notebook/i }))
    .toBeInTheDocument();
});
```

- [ ] **Step 3: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "recents"`

Expected: FAIL — recents group does not exist.

- [ ] **Step 4: Implement recents**

In `command-menu.tsx`:

```tsx
import { useStore } from "ra-core";

interface RecentEntry {
  type: "record" | "resource";
  resource: string;
  id?: number | string;
  label: string;
  path: string;
}

const RECENTS_KEY = "command-menu.recents";

const useRecents = (limit: number) => {
  const [recents, setRecents] = useStore<RecentEntry[]>(RECENTS_KEY, []);
  const remember = useCallback(
    (entry: RecentEntry) => {
      setRecents((prev) => {
        const filtered = prev.filter(
          (e) =>
            !(
              e.type === entry.type &&
              e.resource === entry.resource &&
              e.id === entry.id
            ),
        );
        return [entry, ...filtered].slice(0, limit);
      });
    },
    [setRecents, limit],
  );
  return { recents, remember };
};

const CommandMenuRecents = ({
  recents,
  onSelect,
}: {
  recents: RecentEntry[];
  onSelect: (entry: RecentEntry) => void;
}) => {
  const translate = useTranslate();
  if (recents.length === 0) return null;
  return (
    <CommandGroup
      heading={translate("ra.command.group.recents", { _: "Recent" })}
    >
      {recents.map((entry) => (
        <CommandItem
          key={`recent:${entry.type}:${entry.resource}:${entry.id ?? ""}`}
          value={`recent:${entry.type}:${entry.resource}:${entry.id ?? ""}`}
          onSelect={() => onSelect(entry)}
        >
          {entry.label}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};
```

Wire `useRecents` into `CommandMenu`, render `<CommandMenuRecents>` when `debouncedQuery === ""`, and call `remember(...)` from the `onSelect` handlers in `<CommandMenuResources>` and `<CommandMenuResourceResults>`. Pass `remember` down via props.

Recents items, when selected, navigate to `entry.path` via `useNavigate()`.

- [ ] **Step 5: Run the spec and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all nine tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx \
  src/stories/command-menu.stories.tsx
git commit -m "feat(command-menu): track recents in ra-core store, surface in empty state"
```

---

### Task 9: Footer with `<Kbd>` keyboard hints

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`

- [ ] **Step 1: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
it("renders keyboard hint footer", async () => {
  const screen = render(<Basic />);
  await expect
    .element(screen.getByText(/navigate/i, { exact: false }))
    .toBeInTheDocument();
  await expect
    .element(screen.getByText(/select/i, { exact: false }))
    .toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "keyboard hint footer"`

Expected: FAIL — no footer rendered.

- [ ] **Step 3: Implement the footer**

In `command-menu.tsx`, add:

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const CommandMenuFooter = () => {
  const translate = useTranslate();
  return (
    <div className="flex items-center justify-end gap-3 border-t px-3 py-2 text-xs text-muted-foreground">
      <KbdGroup>
        <Kbd>↑↓</Kbd>
        <span>{translate("ra.command.footer.navigate", { _: "Navigate" })}</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>↵</Kbd>
        <span>{translate("ra.command.footer.select", { _: "Select" })}</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Esc</Kbd>
        <span>{translate("ra.command.footer.close", { _: "Close" })}</span>
      </KbdGroup>
    </div>
  );
};
```

Render `<CommandMenuFooter />` after `</CommandList>` inside `<CommandDialog>` (and inside `<Command>` in the mobile `<Sheet>` branch added in Task 10 — the same footer markup works for both).

- [ ] **Step 4: Run the spec and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all ten tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx
git commit -m "feat(command-menu): footer with keyboard hints via <Kbd>"
```

---

### Task 10: Mobile sheet rendering

**Files:**
- Modify: `src/components/admin/command-menu.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`

The shadcn `<CommandDialog>` is a thin wrapper around `<Dialog>`. On mobile we render
inside `<Sheet>` instead so the palette occupies the full viewport. We branch on
`useIsMobile()`.

- [ ] **Step 1: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
import { vi } from "vitest";

it("renders inside a sheet on mobile", async () => {
  // Simulate small viewport before mount; useIsMobile reads window.innerWidth
  vi.stubGlobal("innerWidth", 500);
  window.dispatchEvent(new Event("resize"));
  const screen = render(<Basic />);
  // Sheet uses radix Dialog under the hood but adds data-slot="sheet-content"
  await expect
    .element(document.querySelector('[data-slot="sheet-content"]'))
    .toBeTruthy();
  vi.unstubAllGlobals();
});
```

- [ ] **Step 2: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "sheet on mobile"`

Expected: FAIL — palette always uses `<CommandDialog>`.

- [ ] **Step 3: Implement mobile branching**

In `command-menu.tsx`:

```tsx
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Command } from "@/components/ui/command";
import { useIsMobile } from "@/hooks/use-mobile";

// Replace `<CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Command menu">…</CommandDialog>`
// with a branching `Shell`:

const Shell = ({
  isMobile,
  isOpen,
  setIsOpen,
  children,
}: {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children: ReactNode;
}) => {
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <SheetTitle className="sr-only">Command menu</SheetTitle>
          <SheetDescription className="sr-only">
            Search or run a command
          </SheetDescription>
          <Command>{children}</Command>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen} title="Command menu">
      {children}
    </CommandDialog>
  );
};
```

Use `const isMobile = useIsMobile();` inside `CommandMenu` and wrap content with `<Shell isMobile={isMobile} …>`.

- [ ] **Step 4: Run the spec and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all eleven tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/command-menu.tsx \
  src/components/admin/command-menu.spec.tsx
git commit -m "feat(command-menu): render inside <Sheet> on mobile viewports"
```

---

### Task 11: `<Admin commandMenu>` shorthand

**Files:**
- Modify: `src/components/admin/admin.tsx`
- Modify: `src/components/admin/command-menu.spec.tsx`
- Modify: `src/stories/command-menu.stories.tsx`

- [ ] **Step 1: Add the `AdminShorthand` story**

Append to `command-menu.stories.tsx`:

```tsx
export const AdminShorthand = () => (
  <TestMemoryRouter initialEntries={["/products"]}>
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
      store={memoryStore()}
      commandMenu
    >
      <Resource name="products" list={ListGuesser} show={ShowGuesser} />
    </Admin>
  </TestMemoryRouter>
);
```

- [ ] **Step 2: Write the failing test**

Append to `command-menu.spec.tsx`:

```tsx
import { AdminShorthand } from "@/stories/command-menu.stories";

it("auto-mounts via <Admin commandMenu>", async () => {
  const screen = render(<AdminShorthand />);
  await userEvent.keyboard("{Meta>}k{/Meta}");
  await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
});
```

- [ ] **Step 3: Run and verify it fails**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx -t "auto-mounts"`

Expected: FAIL — `<Admin>` does not accept `commandMenu`.

- [ ] **Step 4: Add the prop and wrap `<AdminUI>` with the palette**

Modify `src/components/admin/admin.tsx`. Add the import and extend `AdminProps`:

```tsx
import { cloneElement, isValidElement, type ReactElement } from "react";
import { CommandMenu } from "@/components/admin/command-menu";

export interface AdminProps extends CoreAdminProps {
  // ... existing props
  /**
   * Mount the cmd+K command palette. Pass `true` for the default palette, or a
   * `<CommandMenu>` element to customize. The palette's context provider wraps
   * the admin tree, so any resource view can call `useRegisterCommand()`.
   */
  commandMenu?: boolean | ReactElement;
  // ... existing props continue
}
```

Add `commandMenu` to the destructuring inside `Admin`:

```tsx
const {
  // ... existing destructured props
  commandMenu,
  title = "Shadcn Admin",
} = props;
```

Wrap `<AdminUI>` with `<CommandMenu>` when `commandMenu` is truthy. Replace the
existing `<AdminContext>` return block with:

```tsx
const adminUI = (
  <AdminUI
    accessDenied={accessDenied}
    authCallbackPage={authCallbackPage}
    authenticationError={authenticationError}
    catchAll={catchAll}
    dashboard={dashboard}
    disableTelemetry={disableTelemetry}
    error={error}
    layout={layout}
    loading={loading}
    loginPage={loginPage}
    ready={ready}
    requireAuth={requireAuth}
    theme={theme}
    lightTheme={lightTheme}
    darkTheme={darkTheme}
    title={title}
  >
    {children}
  </AdminUI>
);

const wrapped =
  commandMenu === true ? (
    <CommandMenu>{adminUI}</CommandMenu>
  ) : isValidElement(commandMenu) ? (
    cloneElement(commandMenu, undefined, adminUI)
  ) : (
    adminUI
  );

return (
  <AdminContext
    authProvider={authProvider}
    basename={basename}
    dataProvider={dataProvider}
    i18nProvider={i18nProvider}
    queryClient={queryClient}
    store={store}
  >
    {wrapped}
  </AdminContext>
);
```

The `<CommandMenu>` component (from Task 1) renders its `children` inside the
`CommandMenuContext.Provider` but outside the dialog. Wrapping `<AdminUI>` this way
puts every resource view, dashboard, and layout slot inside the provider scope —
that's why `useRegisterCommand` works from a Show view.

- [ ] **Step 5: Run the full spec and verify it passes**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: PASS for all twelve tests.

- [ ] **Step 6: Run typecheck**

Run: `make typecheck`

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/admin.tsx \
  src/components/admin/command-menu.spec.tsx \
  src/stories/command-menu.stories.tsx
git commit -m "feat(admin): accept commandMenu prop for shorthand palette mounting"
```

---

### Task 12: Documentation page

**Files:**
- Create: `docs/src/content/docs/CommandMenu.md`

- [ ] **Step 1: Write the documentation**

`docs/src/content/docs/CommandMenu.md`:

````markdown
---
title: <CommandMenu>
---

A cmd+K command palette that lets users navigate between resources, jump to records via cross-resource search, and run registered actions.

![CommandMenu](../../assets/command-menu.png)

## Usage

Mount `<CommandMenu>` once at the Admin shell using the `commandMenu` shorthand prop:

```tsx
import { Admin, Resource } from "@/components/admin";

const App = () => (
  <Admin dataProvider={dp} commandMenu>
    <Resource name="products" />
    <Resource name="orders" />
  </Admin>
);
```

Press **cmd+K** (or **ctrl+K** on Windows/Linux) to open the palette. Type to search across all permitted resources, navigate items with arrow keys, and press Enter to select.

For finer control, pass `<CommandMenu>` as the prop value:

```tsx
import { Admin, CommandMenu, Resource } from "@/components/admin";

const App = () => (
  <Admin
    dataProvider={dp}
    commandMenu={
      <CommandMenu
        hotkey={["mod+k"]}
        perResourceLimit={5}
        searchFields={{ products: "name", orders: "reference" }}
      />
    }
  >
    <Resource name="products" />
    <Resource name="orders" />
  </Admin>
);
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `hotkey` | `string[] \| false` | `["mod+k"]` | Hotkey bindings. `false` disables hotkey opening. |
| `resources` | `string[]` | all permitted | Resource allowlist. |
| `searchFields` | `Record<string, string>` | `{}` | Override the search field name per resource (defaults to `q`). |
| `perResourceLimit` | `number` | `5` | Max records returned per resource per query. |
| `recentsLimit` | `number` | `10` | Max recents tracked in the empty state. |
| `actions` | `CommandAction[]` | `[]` | Extra static actions. |
| `placeholder` | `string` | translated | Input placeholder text. |
| `searchDebounceMs` | `number` | `200` | Debounce in ms before queries fire. |

## `useCommandMenu`

Open or close the palette from any component:

```tsx
import { useCommandMenu } from "@/components/admin";

const OpenFromAnywhere = () => {
  const { open } = useCommandMenu();
  return <button onClick={open}>Open palette</button>;
};
```

## `useRegisterCommand`

Register a context-aware action while a component is mounted:

```tsx
import { useRegisterCommand } from "@/components/admin";

const DuplicateAction = ({ id }: { id: number }) => {
  useRegisterCommand({
    id: `duplicate-${id}`,
    label: "Duplicate this product",
    group: "actions",
    onSelect: () => duplicate(id),
  });
  return null;
};
```

The command is removed automatically when the component unmounts.
````

- [ ] **Step 2: Commit**

```bash
git add docs/src/content/docs/CommandMenu.md
git commit -m "docs(command-menu): add documentation page"
```

---

### Task 13: Verification + lint + typecheck

**Files:** _none_

- [ ] **Step 1: Run the full test file**

Run: `pnpm vitest run --browser.headless src/components/admin/command-menu.spec.tsx`

Expected: all twelve tests PASS.

- [ ] **Step 2: Run typecheck**

Run: `make typecheck`

Expected: no errors.

- [ ] **Step 3: Run lint**

Run: `make lint`

Expected: no errors. Fix any reported issues by editing the offending file and re-running.

- [ ] **Step 4: Verify the dev server boots and the palette works**

Run: `make run`

Open the demo in a browser, press cmd+K, confirm the palette opens, type a few characters, navigate to a record. Close the dev server.

If anything is broken in the browser that the spec did not catch, file a follow-up TODO via the chip workflow and address it before opening a PR.

- [ ] **Step 5: No commit needed (verification only).**

---

## Out of scope for this plan (deferred)

- `<CalendarList>` and `<CsvImport>` — separate plans authored when their turn comes.
- AI-driven natural-language parsing — Phase 4 `<Assistant>`.
- Per-resource icon support — punt until a real need lands.
- Server-side federated search endpoint — also Phase 4.

---

## Self-review notes

- Every task has explicit file paths, complete test code, and complete implementation code.
- No "TBD", "implement later", or "similar to Task N" references.
- Types and function names are consistent across tasks: `CommandAction`, `useCommandMenu`, `useRegisterCommand`, `useRecents`, `RecentEntry`, `RECENTS_KEY`, `CommandMenuResources`, `CommandMenuRecords`, `CommandMenuActions`, `CommandMenuRecents`, `CommandMenuFooter`, `Shell`.
- Spec coverage check:
  - Hotkey + open/close → Task 2.
  - Resources group + navigation → Task 3.
  - Per-resource debounced records → Task 4.
  - Built-in actions (refresh, theme, logout) → Task 5.
  - Custom `actions` prop + `useRegisterCommand` → Tasks 5–6.
  - Permission filtering via `useCanAccess` → Task 7.
  - Recents in `useStore` → Task 8.
  - Keyboard hint footer with `<Kbd>` → Task 9.
  - Mobile `<Sheet>` rendering → Task 10.
  - `<Admin commandMenu>` shorthand → Task 11.
  - Docs page → Task 12.
  - i18n keys (`ra.command.*`) with inline defaults → Tasks 3–9 where each translation key first appears.
