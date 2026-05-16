---
title: "Inspector"
---

`<Inspector>`, `<InspectorButton>`, and `<Configurable>` form a live-edit system that lets end users customize parts of the UI at runtime. Users toggle "edit mode" via the `<InspectorButton>` (typically placed in the app header). Once edit mode is on, every `<Configurable>` element shows a hover affordance and a cogwheel that opens its own editor inside the floating `<Inspector>` panel. Changes persist in the [`Store`](https://marmelab.com/ra-core/store/), so user choices survive reloads.

## Usage

Add a single `<Inspector>` near the root of your application, a `<InspectorButton>` somewhere the user can click, and wrap each customizable element in a `<Configurable>`.

```tsx
import {
  Admin,
  Configurable,
  FieldsSelector,
  Inspector,
  InspectorButton,
  Layout,
} from "@/components/admin";
import { Resource } from "ra-core";

const MyLayout = ({ children }: { children: React.ReactNode }) => (
  <Layout appBarChildren={<InspectorButton />}>
    {children}
    <Inspector />
  </Layout>
);

export const App = () => (
  <Admin dataProvider={dataProvider} layout={MyLayout}>
    <Resource name="books" list={BookList} />
  </Admin>
);
```

For the editor element of a `<Configurable>`, you can pass any React element. The most common is `<FieldsSelector>`, which presents a list of fields with toggles and drag-handles, and persists the user's selection.

```tsx
const BookList = () => (
  <List>
    <Configurable preferenceKey="books.datatable" editor={<FieldsSelector />}>
      <DataTable>
        <DataTable.Col source="title" />
        <DataTable.Col source="author" />
        <DataTable.Col source="year" />
      </DataTable>
    </Configurable>
  </List>
);
```

When the user clicks the cogwheel that appears next to the configurable element, the `<Inspector>` opens and shows the editor element, with its `preferenceKey` injected so it reads and writes preferences scoped to `preferences.${preferenceKey}`.

## How preferences are stored

`<Configurable>` namespaces all preferences under `preferences.${preferenceKey}`. Inside that namespace, editor components like `<FieldsSelector>` write smaller keys (e.g. `columns`, `availableColumns`, `omit`). Reading those values back from anywhere inside the same configurable subtree uses [`usePreference`](https://marmelab.com/ra-core/usepreference/) from ra-core.

The Inspector's trash icon calls [`useRemoveItemsFromStore`](https://marmelab.com/ra-core/useremoveitemsfromstore/) under the current namespace, which wipes all preferences for the active configurable and re-mounts the editor so the user sees the defaults.

## `<InspectorButton>`

A ghost icon button that toggles edit mode on or off.

```tsx
import { InspectorButton } from "@/components/admin";

const AppBar = () => (
  <header>
    <InspectorButton />
  </header>
);
```

| Prop    | Required | Type     | Default                         | Description                              |
| ------- | -------- | -------- | ------------------------------- | ---------------------------------------- |
| `label` | Optional | `string` | `ra.configurable.configureMode` | Translation key for tooltip / aria-label |

Additional props are forwarded to the underlying `<Button>`.

## `<Inspector>`

The floating panel that displays the currently selected editor. Render exactly one `<Inspector>` in your application (typically alongside the layout's children).

```tsx
import { Inspector } from "@/components/admin";

const MyLayout = ({ children }) => (
  <>
    {children}
    <Inspector />
  </>
);
```

| Prop        | Required | Type     | Default | Description                                  |
| ----------- | -------- | -------- | ------- | -------------------------------------------- |
| `className` | Optional | `string` | -       | Extra classes appended to the inspector card |

The inspector panel renders in a fixed position at the top-right of the viewport. It auto-hides when edit mode is off.

:::note
Unlike [`<Inspector>` in `react-admin`](https://marmelab.com/react-admin/Inspector.html), this component does not support drag-and-drop repositioning. The panel is pinned to the top-right corner.
:::

## `<InspectorRoot>`

The default content of the inspector when no configurable element is selected — a translated invitation to hover the UI.

You do not normally render `<InspectorRoot>` directly; it is the fallback rendered inside `<Inspector>` when its `editor` is empty.

## `<Configurable>`

Wraps a UI element to make it editable.

```tsx
import { Configurable, FieldsSelector } from "@/components/admin";

const BookList = () => (
  <Configurable preferenceKey="books.list" editor={<FieldsSelector />}>
    <BooksDataTable />
  </Configurable>
);
```

| Prop              | Required | Type           | Default                     | Description                                                                                                                       |
| ----------------- | -------- | -------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `children`        | Required | `ReactNode`    | -                           | The element to make configurable                                                                                                  |
| `editor`          | Required | `ReactElement` | -                           | The editor element rendered inside `<Inspector>` when this configurable is selected. Receives `preferenceKey` via `cloneElement`. |
| `preferenceKey`   | Required | `string`       | -                           | Identifies this configurable; all preferences live under `preferences.${preferenceKey}`                                           |
| `openButtonLabel` | Optional | `string`       | `ra.configurable.customize` | Translation key for the open-editor button label                                                                                  |
| `className`       | Optional | `string`       | -                           | Extra classes appended to the wrapper                                                                                             |

When the `<PreferencesEditorContextProvider>` is not present in the tree, `<Configurable>` renders its children unchanged.

## `<FieldsSelector>`

Reusable editor body for the inspector — a switchable, reorderable list of fields backed by preferences.

```tsx
import { Configurable, FieldsSelector } from "@/components/admin";

const ProductGrid = () => (
  <Configurable preferenceKey="products.grid" editor={<FieldsSelector />}>
    <Grid />
  </Configurable>
);
```

| Prop            | Required | Type     | Default              | Description                                      |
| --------------- | -------- | -------- | -------------------- | ------------------------------------------------ |
| `name`          | Optional | `string` | `"columns"`          | Preference key for the array of selected indexes |
| `availableName` | Optional | `string` | `"availableColumns"` | Preference key for the array of available fields |

`<FieldsSelector>` reads its data from preferences. The component reading from this preference is expected to populate `preferences.${preferenceKey}.${availableName}` with an array of `{ index, source, label? }` entries on first render.

## See also

- [`<SimpleFormConfigurable>`](./simple-form-configurable) for a ready-made configurable form
- [`<ColumnsButton>`](./columns-button) for a non-inspector approach to column visibility
