---
title: "SelectArrayInput"
---

Multi-select dropdown input for choosing several values from a static list. The trigger button displays the selected values as small badges; clicking it opens a popover with a checkbox row for each choice.

## Usage

In addition to the `source`, `<SelectArrayInput>` requires one prop: the `choices` listing the possible values.

```tsx
import { SelectArrayInput } from "@/components/admin";

<SelectArrayInput
  source="tags"
  choices={[
    { id: "tech", name: "Tech" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "people", name: "People" },
  ]}
/>;
```

By default, the possible choices are built from the `choices` prop, using:

- the `id` field as the option value,
- the `name` field as the option text.

The form value for the source must be an array of selected ids, e.g.:

```js
const record = {
  id: 1,
  tags: ["tech", "people"],
};
```

## Props

| Prop              | Required   | Type                                          | Default    | Description                                                                                   |
| ----------------- | ---------- | --------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `source`          | Required\* | `string`                                      | -          | Field name (inferred in ReferenceArrayInput)                                                  |
| `choices`         | Required\* | `Object[]`                                    | -          | List of items. Required if not inside a ReferenceArrayInput.                                  |
| `className`       | Optional   | `string`                                      | -          | Wrapper classes                                                                               |
| `create`          | Optional   | `ReactElement`                                | -          | React element rendered as an inline-create entry at the bottom of the menu                   |
| `defaultValue`    | Optional   | `any[]`                                       | `[]`       | Default value                                                                                 |
| `disabled`        | Optional   | `boolean`                                     | -          | Disable input                                                                                 |
| `disableValue`    | Optional   | `string`                                      | `disabled` | Field marking disabled choices                                                                |
| `format`          | Optional   | `function`                                    | -          | Callback to convert the value from the form state into the input value                        |
| `helperText`      | Optional   | `ReactNode`                                   | -          | Help text                                                                                     |
| `label`           | Optional   | `string` &#124; `ReactNode` &#124; `false`    | Inferred   | Custom / hide label                                                                           |
| `optionText`      | Optional   | `string` &#124; `Function` &#124; `Component` | `name`     | Field name of the record to display as the option text, or function/component that renders it |
| `optionValue`     | Optional   | `string`                                      | `id`       | Field name of the record containing the value to use as the form value                        |
| `parse`           | Optional   | `function`                                    | -          | Callback to convert the input value into the value stored in the form state                   |
| `placeholder`     | Optional   | `string`                                      | -          | Text shown in the trigger button when no value is selected                                    |
| `translateChoice` | Optional   | `boolean`                                     | `true`     | Whether the choices should be translated                                                      |
| `validate`        | Optional   | `Validator` &#124; `Validator[]`              | -          | Validation                                                                                    |

`*` `source` and `choices` are optional inside `<ReferenceArrayInput>`.

## `choices`

The list of choices must be an array of objects with at least two fields: one to use for the name, and the other to use for the value. By default, `<SelectArrayInput>` will use the `id` and `name` fields.

```jsx
const choices = [
  { id: "tech", name: "Tech" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "people", name: "People" },
];
<SelectArrayInput source="tags" choices={choices} />;
```

If the choices have different keys, use `optionText` and `optionValue`:

```jsx
const choices = [
  { _id: "tech", label: "Tech" },
  { _id: "lifestyle", label: "Lifestyle" },
  { _id: "people", label: "People" },
];

<SelectArrayInput
  source="tags"
  choices={choices}
  optionText="label"
  optionValue="_id"
/>;
```

The choices are translated by default, so you can use translation identifiers as choices:

```jsx
const choices = [
  { id: "tech", name: "myroot.tags.tech" },
  { id: "lifestyle", name: "myroot.tags.lifestyle" },
  { id: "people", name: "myroot.tags.people" },
];
```

You can opt out of this translation by setting the `translateChoice` prop to `false`.

To fetch the options from another resource, wrap `<SelectArrayInput>` in a [`<ReferenceArrayInput>`](./reference-array-input):

```jsx
<ReferenceArrayInput source="tag_ids" reference="tags">
  <SelectArrayInput />
</ReferenceArrayInput>
```

## `placeholder`

Text displayed in the trigger button when no value is selected. Defaults to a blank space so the button keeps a consistent height.

```tsx
<SelectArrayInput
  source="tags"
  choices={choices}
  placeholder="Pick one or more tags..."
/>
```

## `disableValue`

You can disable some choices by setting a `disabled` field to `true` (or by passing a custom field name with the `disableValue` prop):

```jsx
const choices = [
  { id: "tech", name: "Tech" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "people", name: "People", disabled: true },
];
<SelectArrayInput source="tags" choices={choices} />;
```

## `create`

A React element rendered as a special entry at the bottom of the options list. When the user clicks it, ra-core's `useSupportCreateSuggestion` hook mounts the element (typically a dialog or inline form) and appends the newly-created record id to the selection.

Use `create` when you need full UI control over the creation form. For a simple callback, prefer [`onCreate`](#oncreate).

```jsx
import { useState } from "react";

const CreateTag = ({ onClose }) => {
  const [name, setName] = useState("");
  return (
    <div className="p-2">
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => onClose(name)}>Add</button>
    </div>
  );
};

<SelectArrayInput
  source="tags"
  choices={choices}
  create={<CreateTag />}
/>
```

## Alternatives

Consider the following alternatives for selecting multiple values from a list:

- [`<CheckboxGroupInput>`](./checkbox-group-input) for an inline list of checkboxes (better for short lists)
- [`<AutocompleteArrayInput>`](./autocomplete-array-input) for a searchable autocomplete (better for very long lists)
