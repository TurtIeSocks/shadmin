---
title: "PermissionMatrix"
---

`<PermissionMatrix>` renders an editable role × resource × action grid. Each cell is a checkbox: "can `<role>` do `<action>` on `<resource>`?". It reads and writes via a controlled `value`/`onChange` API and is compatible with any auth model — you supply the role list, resource list, action list, and current state.

## Usage

```tsx
import { useState } from "react";
import { PermissionMatrix, type PermissionsState } from "@/components/admin";

const roles = ["admin", "editor", "viewer"];
const resources = ["products", "orders", "users"];

const PermissionsEditor = () => {
  const [permissions, setPermissions] = useState<PermissionsState>({});

  return (
    <PermissionMatrix
      roles={roles}
      resources={resources}
      actions={["list", "show", "create", "edit", "delete"]}
      value={permissions}
      onChange={setPermissions}
    />
  );
};
```

## Props

| Prop        | Required | Type                                    | Default                                              | Description                                             |
| ----------- | -------- | --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| `roles`     | Required | `Array<string \| { id; label }>`        | —                                                    | Role identifiers or labeled objects.                    |
| `resources` | Required | `Array<string \| { id; label }>`        | —                                                    | Resource identifiers or labeled objects.                |
| `actions`   | Optional | `string[]`                              | `["list", "show", "create", "edit", "delete"]`       | Action names displayed as column headers.               |
| `value`     | Optional | `PermissionsState`                      | `{}`                                                 | Current permissions state (controlled).                 |
| `onChange`  | Required | `(next: PermissionsState) => void`      | —                                                    | Called with the new state after any cell is toggled.    |
| `readOnly`  | Optional | `boolean`                               | `false`                                              | Disables all checkboxes.                                |

## Permissions state shape

```ts
type PermissionsState = Record<string, Record<string, Record<string, boolean>>>;
// value[role][resource][action] = boolean
```

Example:

```ts
{
  admin: {
    products: { list: true, show: true, create: true, edit: true, delete: true },
    orders:   { list: true, show: true, create: false, edit: true, delete: false },
  },
  viewer: {
    products: { list: true, show: true, create: false, edit: false, delete: false },
  },
}
```

Absent keys are treated as `false`. Each `onChange` call returns a full structural clone — the original `value` is never mutated.

## `roles` and `resources` — string vs. labeled object

Pass plain strings when the id and the display label are the same. Pass `{ id, label }` objects for human-readable labels while keeping stable machine-readable ids.

```tsx
<PermissionMatrix
  roles={[
    { id: "admin", label: "Administrator" },
    { id: "editor", label: "Content Editor" },
  ]}
  resources={[
    { id: "products", label: "Products Catalog" },
    { id: "orders", label: "Order Management" },
  ]}
  value={permissions}
  onChange={setPermissions}
/>
```

## Tab-per-role rationale

With many roles and resources, a single flat grid becomes unreadable. The component uses shadcn `<Tabs>` to dedicate one tab per role. Within each tab, a table renders resources as rows and actions as columns, keeping the grid compact and scannable even with a large action set. The active tab is purely a UI detail — `value` and `onChange` always carry the full state for all roles simultaneously.

## "All" column

The rightmost column contains an "All" checkbox per resource row. It is checked when every action in that row is `true`. Clicking it:

- turns all actions **on** when any are currently off
- turns all actions **off** when all are currently on

## `readOnly`

Set `readOnly` to display permissions without allowing edits. All checkboxes are rendered `disabled`.

```tsx
<PermissionMatrix
  roles={roles}
  resources={resources}
  value={permissions}
  onChange={() => {}}
  readOnly
/>
```
