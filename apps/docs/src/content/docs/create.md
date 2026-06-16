---
title: "Create"
---

The `<Create>` component is the main component for creation pages. It prepares a form submit handler, and renders the page title and actions. It is not responsible for rendering the actual form - that's the job of its child component (usually a form component, like [`<SimpleForm>`](./SimpleForm.html)). This form component uses its children ([`<Input>`](./DataEdition.mdx#inputs) components) to render each form input.

![product creation form](./images/products-create.png)

The `<Create>` component creates a `RecordContext` with an empty object `{}` by default. It also creates a [`SaveContext`](https://marmelab.com/ra-core/usesavecontext/) containing a `save` callback, which calls `dataProvider.create()`, and [a `CreateContext`](https://marmelab.com/ra-core/usecreatecontext/l) containing both the record and the callback.

## Usage

Wrap the `<Create>` component around the form you want to create, then pass it as `create` prop of a given `<Resource>`. `<Create>` requires no prop by default - it deduces the resource from the current URL.

For instance, the following component will render a creation form with 6 inputs when users browse to `/products/create`:

```jsx
// in src/products.js
import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
} from "@/components/admin";
import { required } from "ra-core";

export const ProductCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="reference" label="Reference" validate={required()} />
      <ReferenceInput source="category_id" reference="categories">
        <AutocompleteInput label="Category" validate={required()} />
      </ReferenceInput>
      <div className="grid grid-cols-2 gap-2">
        <TextInput source="width" type="number" />
        <TextInput source="height" type="number" />
      </div>
      <TextInput source="price" type="number" />
      <TextInput source="stock" label="Stock" type="number" />
    </SimpleForm>
  </Create>
);

// in src/App.js
import { Admin } from "@/copmponents/admin";
import { Resource } from "ra-core";

import { dataProvider } from "./data-provider";
import { PostCreate } from "./posts";

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="products" create={ProductCreate} />
  </Admin>
);

export default App;
```

## Props

You can customize the `<Create>` component using the following props:

| Prop                    | Required         | Type                 | Default         | Description                                                                                      |
| ----------------------- | ---------------- | -------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `children`              | Optional&nbsp;\* | `ReactNode`          | -               | The components that render the form                                                              |
| `render`                | Optional&nbsp;\* | `function`           | -               | Alternative to children. Function that renders the form, receives the create context as argument |
| `actions`               | Optional         | `ReactNode`          | Default toolbar | Override the actions toolbar with a custom component                                             |
| `aside`                 | Optional         | `ReactNode`          | -               | Side panel rendered next to the form                                                             |
| `component`             | Optional         | `ElementType`        | `"div"`         | Override the root element wrapping the form content                                              |
| `className`             | Optional         | `string`             | -               | Passed to the root component                                                                     |
| `disableAuthentication` | Optional         | `boolean`            | `false`         | Disable the authentication check                                                                 |
| `disableBreadcrumb`     | Optional         | `boolean`            | `false`         | Set to `true` to define a custom breadcrumb for the page, instead of the default one             |
| `mutationMode`          | Optional         | `string`             | `pessimistic`   | Switch to optimistic or undoable mutations                                                       |
| `mutationOptions`       | Optional         | `object`             | -               | Options for the `dataProvider.create()` call                                                     |
| `record`                | Optional         | `object`             | `{}`            | Initialize the form with a record                                                                |
| `redirect`              | Optional         | `string`/`function`  | `'edit'`        | Change the redirect location after successful creation                                           |
| `resource`              | Optional         | `string`             | From URL        | Override the name of the resource to create                                                      |
| `title`                 | Optional         | `string`/`ReactNode` | Translation     | Override the page title                                                                          |
| `transform`             | Optional         | `function`           | -               | Transform the form data before calling `dataProvider.create()`                                   |

`*` You must provide either `children` or `render`.

## `render`

An alternative to `children`. Pass a function that receives the full [`CreateControllerResult`](https://marmelab.com/ra-core/usecreatecontroller/) and returns a React node. Useful when you need fine-grained control over the create page UI:

```tsx
import { Create } from "@/components/admin";

export const PostCreate = () => (
  <Create
    render={({ saving }) => (
      <div>
        <h1>New Post</h1>
        <form>
          <input name="title" placeholder="Title" />
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    )}
  />
);
```

When `render` is provided, `children` is ignored.

## `component`

By default, `<Create>` wraps the form content in a `<div>`. Use `component` to replace it with any React element type — useful for adding a `<Card>` or custom container:

```tsx
import { Create, SimpleForm, TextInput } from "@/components/admin";
import { Card } from "@/components/ui/card";

export const PostCreate = () => (
  <Create component={Card}>
    <SimpleForm>
      <TextInput source="title" />
    </SimpleForm>
  </Create>
);
```

## `aside`

Pass any React node as `aside` to render a side panel next to the form. The aside is displayed in a `flex` row: the form takes the remaining space (`flex-1`) and the aside is pinned to a fixed width (`w-64`).

```tsx
import { Create, SimpleForm, TextInput } from "@/components/admin";

const PostCreateAside = () => (
  <div className="p-4 bg-muted rounded text-sm">
    <p>Tips for writing a great post:</p>
    <ul className="list-disc pl-4 mt-2 space-y-1">
      <li>Keep the title concise</li>
      <li>Add a descriptive body</li>
    </ul>
  </div>
);

export const PostCreate = () => (
  <Create aside={<PostCreateAside />}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="body" multiline />
    </SimpleForm>
  </Create>
);
```
