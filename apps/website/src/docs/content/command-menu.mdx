---
title: "CommandMenu"
---

`<CommandMenu>` is a cmd+K command palette that lets users navigate between resources, jump to records via cross-resource search, run registered actions (refresh, theme, logout), and access recently visited items from an empty-state list. On mobile viewports the palette renders inside a full-height `<Sheet>` instead of a centered dialog.

## Usage

`<CommandMenu>` needs to wrap the routed admin UI so the rest of the tree can call `useCommandMenu()` / `useRegisterCommand()`. Compose it between `<AdminContext>` (data/auth/i18n providers) and `<AdminUI>` (theme + routes):

```tsx
import { AdminContext, AdminUI, Resource } from "@/components/admin";
import { CommandMenu } from "@/components/extras/command-menu";

const App = () => (
  <AdminContext dataProvider={dp}>
    <CommandMenu>
      <AdminUI>
        <Resource name="products" />
        <Resource name="orders" />
      </AdminUI>
    </CommandMenu>
  </AdminContext>
);
```

Press **cmd+K** (or **ctrl+K** on Windows/Linux) to open the palette. Type to search across all permitted resources, navigate with arrow keys, and press Enter to select.

Configure the palette by passing props directly:

```tsx
import { AdminContext, AdminUI, Resource } from "@/components/admin";
import { CommandMenu } from "@/components/extras/command-menu";

const App = () => (
  <AdminContext dataProvider={dp}>
    <CommandMenu
      hotkey={["mod+k"]}
      perResourceLimit={5}
      searchFields={{ products: "name", orders: "reference" }}
    >
      <AdminUI>
        <Resource name="products" />
        <Resource name="orders" />
      </AdminUI>
    </CommandMenu>
  </AdminContext>
);
```

> The plain `<Admin>` shorthand does not mount `<CommandMenu>`. Drop down to the `<AdminContext>` / `<AdminUI>` pair whenever you need to inject a wrapping provider between the data layer and the routed UI.

## Props

| Prop               | Type                     | Default       | Description                                                                                     |
| ------------------ | ------------------------ | ------------- | ----------------------------------------------------------------------------------------------- |
| `hotkey`           | `string[] \| false`      | `["mod+k"]`   | Hotkey bindings. `false` disables hotkey opening.                                               |
| `resources`        | `string[]`               | all permitted | Resource allowlist. Resources the user cannot list (`useCanAccess`) are filtered automatically. |
| `searchFields`     | `Record<string, string>` | `{}`          | Override the search field name per resource (defaults to `q`).                                  |
| `perResourceLimit` | `number`                 | `5`           | Max records returned per resource per query.                                                    |
| `recentsLimit`     | `number`                 | `10`          | Max recents tracked in the empty state.                                                         |
| `actions`          | `CommandAction[]`        | `[]`          | Extra static actions appended to the built-ins.                                                 |
| `placeholder`      | `string`                 | translated    | Input placeholder text.                                                                         |
| `searchDebounceMs` | `number`                 | `200`         | Debounce in ms before queries fire.                                                             |

### `CommandAction`

| Field      | Type                          | Description                                                                           |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| `id`       | `string`                      | Stable identifier (used as React key, `unregister` handle, and cmdk value prefix).    |
| `label`    | `ReactNode`                   | Visible label.                                                                        |
| `icon`     | `ComponentType`               | Optional Lucide-compatible icon.                                                      |
| `group`    | `string`                      | Group bucket (`"actions"` for the actions list; custom groups render after defaults). |
| `keywords` | `string[]`                    | Extra search keywords for cmdk's fuzzy filter.                                        |
| `when`     | `() => boolean`               | Optional visibility predicate.                                                        |
| `onSelect` | `() => void \| Promise<void>` | Action handler. The dialog closes after `onSelect` resolves.                          |

## Result groups

When the input is empty, the palette shows a **Recent** group of items the user has previously selected (records or resources). As soon as the user types:

- **Records** — per-resource `useGetList` queries (filtered by `q` or `searchFields[name]`) render up to `perResourceLimit` results each.
- **Resources** — quick navigation to a resource's list view.
- **Actions** — built-in actions (refresh, switch theme, log out) plus any caller-supplied `actions` plus anything registered via `useRegisterCommand`.

Resources the current user cannot list (`useCanAccess({ resource, action: "list" })`) are hidden silently from both the resources and records groups.

## `useCommandMenu`

Open, close, toggle, or seed the search input from any component inside the admin tree:

```tsx
import { useCommandMenu } from "@/components/extras/command-menu";

const OpenFromAnywhere = () => {
  const { open } = useCommandMenu();
  return <button onClick={open}>Open palette</button>;
};
```

The hook returns `{ isOpen, open, close, toggle, setQuery, registerCommand, unregisterCommand, registeredCommands }`.

## `useRegisterCommand`

Register a context-aware action while a component is mounted:

```tsx
import { useRegisterCommand } from "@/components/extras/command-menu";

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

The hook tracks only `action.id` in its effect deps — if other fields change between renders, callers should stabilize the action with `useMemo`. The command is removed automatically when the component unmounts.

## Mobile rendering

On viewports under 768px (`useIsMobile`), the palette renders inside a bottom-anchored `<Sheet>` taking 90% of the screen height instead of the centered dialog.

## Persistence

Recents are persisted via ra-core's `useStore` under the key `RECENTS_KEY` (exported from the module). The store is whatever was configured on `<Admin store={…}>` — `localStorageStore` by default, `memoryStore()` in tests.
