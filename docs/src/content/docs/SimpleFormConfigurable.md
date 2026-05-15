---
title: "SimpleFormConfigurable"
---

A drop-in replacement for [`<SimpleForm>`](./SimpleForm.md) whose visible inputs can be reordered or hidden by the end user via the [`<Inspector>`](./Inspector.md).

## Usage

Use `<SimpleFormConfigurable>` wherever you would use `<SimpleForm>`, then ensure your app renders an `<InspectorButton>` and an `<Inspector>`.

```tsx
import {
  Edit,
  InspectorButton,
  Inspector,
  Layout,
  SimpleFormConfigurable,
  TextInput,
} from "@/components/admin";

const MyLayout = ({ children }) => (
  <Layout appBarChildren={<InspectorButton />}>
    {children}
    <Inspector />
  </Layout>
);

const PostEdit = () => (
  <Edit>
    <SimpleFormConfigurable>
      <TextInput source="id" />
      <TextInput source="title" />
      <TextInput source="body" />
    </SimpleFormConfigurable>
  </Edit>
);
```

When the user toggles edit mode (via the `<InspectorButton>` in the app bar), a cogwheel appears next to the form. Clicking it opens the inspector with a [`<FieldsSelector>`](./Inspector.md) of the form's inputs. Users can toggle visibility and drag rows to reorder.

## Props

| Prop            | Required | Type              | Default                  | Description                                                                        |
| --------------- | -------- | ----------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `children`      | Required | `ReactNode`       | -                        | The inputs (or any element with a `source` prop).                                  |
| `preferenceKey` | Optional | `string`          | `${resource}.simpleForm` | Storage key for user preferences.                                                  |
| `omit`          | Optional | `string[]`        | -                        | Sources hidden by default. Users can re-enable them from the inspector.            |
| ...rest         | -        | `SimpleFormProps` | -                        | All other props are forwarded to the underlying [`<SimpleForm>`](./SimpleForm.md). |

## `preferenceKey`

By default, user preferences are stored under `preferences.${resource}.simpleForm`. If a single resource hosts more than one `<SimpleFormConfigurable>`, set a unique `preferenceKey` on each.

```tsx
const PostCreate = () => (
  <Create>
    <SimpleFormConfigurable preferenceKey="posts.draft">
      <TextInput source="title" />
      <TextInput source="body" />
    </SimpleFormConfigurable>
  </Create>
);
```

## `omit`

Use the `omit` prop to hide inputs by default. The user can still re-enable them from the inspector.

```tsx
const PostEdit = () => (
  <Edit>
    <SimpleFormConfigurable omit={["id", "author"]}>
      <TextInput source="id" />
      <TextInput source="title" />
      <TextInput source="author" />
      <TextInput source="body" />
    </SimpleFormConfigurable>
  </Edit>
);
```

## How it works

Internally, `<SimpleFormConfigurable>` wraps `<SimpleForm>` in a [`<Configurable>`](./Inspector.md) whose editor is a `<FieldsSelector>` reading from `inputs` / `availableInputs` preference keys.

On first mount, it walks its children and writes an `availableInputs` array of `{ index, source, label? }` into the store. The inspector's `<FieldsSelector>` then reads that array to render the toggle list. The form filters its children based on the `inputs` preference array.

## See also

- [`<Inspector>`](./Inspector.md) for the full configurable system
- [`<SimpleForm>`](./SimpleForm.md) for the underlying form layout
