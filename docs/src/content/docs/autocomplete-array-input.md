---
title: "AutocompleteArrayInput"
---

Lets users choose multiple values in a list using a dropdown with autocompletion.

![AutocompleteArrayInput](./images/autocomplete-array-input.png)

This input allows editing values that are arrays of scalar values, e.g. `[123, 456]`.

## Usage

In addition to the `source`, `<AutocompleteArrayInput>` requires one prop: the `choices` listing the possible values.

```jsx
import { AutocompleteArrayInput } from "@/components/admin";

<AutocompleteArrayInput
  source="tags"
  choices={[
    { id: "u001", name: "Tech" },
    { id: "u002", name: "News" },
    { id: "u003", name: "Lifestyle" },
    { id: "u004", name: "Entertainment" },
    { id: "u005", name: "Sports" },
    { id: "u006", name: "Health" },
    { id: "u007", name: "Education" },
    { id: "u008", name: "Finance" },
    { id: "u009", name: "Travel" },
  ]}
/>;
```

By default, the possible choices are built from the `choices` prop, using:

- the `id` field as the option value,
- the `name` field as the option text

The form value for the source must be an array of the selected values, e.g.

```jsx
{
    id: 123,
    title: 'Lorem Ipsum',
    roles: ['u001', 'u003', 'u004'],
}
```

:::tip
`<AutocompleteArrayInput>` is a stateless component, so it only allows to _filter_ the list of choices, not to _extend_ it. If you need to populate the list of choices based on the result from a `fetch` call (and if [`<ReferenceArrayInput>`](./reference-array-input) doesn't cover your need), you'll have to write your own Input component.
:::

## Props

| Prop              | Required   | Type                             | Default               | Description                                                                                                                             |
| ----------------- | ---------- | -------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `source`          | Required\* | `string`                         | -                     | Field name (inferred in ReferenceArrayInput)                                                                                            |
| `choices`         | Required\* | `any[]`                          | -                     | List of choices                                                                                                                         |
| `className`       | Optional   | `string`                         | -                     | CSS Classes                                                                                                                             |
| `disableValue`    | Optional   | `string`                         | `disabled`            | The value to use for the disabled state                                                                                                 |
| `filterToQuery`   | Optional   | `(text:string)=>object`          | `{ q: text }`         | Server filter mapping                                                                                                                   |
| `format`          | Optional   | `function`                       | -                     | Function to convert the value sent by the API to the value used by the form                                                             |
| `helperText`      | Optional   | `ReactNode`                      | -                     | Help text                                                                                                                               |
| `inputText`       | Optional   | `ReactNode \| (choice) =>string` | Choice text           | Required if `optionText` is a custom Component, this function must return the text displayed for the current selection.                 |
| `optionText`      | Optional   | `string \| function`             | `name` or record repr | Field name of record to display in the suggestion item or function which accepts the correct record as argument (`(record)=> {string}`) |
| `optionValue`     | Optional   | `string`                         | `id`                  | Field name of record containing the value to use as input value                                                                         |
| `parse`           | Optional   | `function`                       | -                     | Function to convert the value from the form to the value sent to the API                                                                |
| `placeholder`     | Optional   | `string`                         | 'Search…'             | Input placeholder                                                                                                                       |
| `translateChoice` | Optional   | `boolean`                        | `!isFromReference`    | Translate labels                                                                                                                        |
| `clearOnBlur`     | Optional   | `boolean`                        | `false`               | If true, clears the filter text in the input when the input loses focus                                                                 |
| `create`          | Optional   | `ReactElement`                   | -                     | A React element rendered when users want to create a new choice                                                                         |
| `createHintValue` | Optional   | `string`                         | -                     | Sentinel value passed to `useSupportCreateSuggestion` to represent the "create" item internally                                         |
| `createItemLabel` | Optional   | `string \| (filter) => ReactNode` | `ra.action.create_item` | Label for the "Create …" menu item shown when the filter is non-empty                                                                  |
| `createLabel`     | Optional   | `string \| ReactNode`            | -                     | Hint label shown as a menu item when the filter is empty, prompting users that they can create a new option                             |
| `createValue`     | Optional   | `string`                         | `@@ra-create`         | The option value stored for the "create" item; must not conflict with real choice values                                                |
| `emptyText`       | Optional   | `string`                         | -                     | Accepted for API parity with `AutocompleteInput`; not rendered in the array variant                                                     |
| `handleHomeEndKeys` | Optional | `boolean`                        | `false`               | If true, Home/End keys scroll the dropdown list to the first/last item                                                                  |
| `isOptionEqualToValue` | Optional | `(option, value) => boolean`  | `areIdsEqual`         | Custom equality check between a choice value and the current field value                                                                |
| `limitChoicesToValue` | Optional  | `boolean`                        | `false`               | If true, the dropdown shows only already-selected choices                                                                               |
| `matchSuggestion` | Optional   | `(filter, choice) => boolean`    | -                     | Custom filter function replacing the default substring match; required when `optionText` is a React element                             |
| `validate`        | Optional   | `Validator \| Validator[]`       | -                     | Validation                                                                                                                              |

`*` `source` and `choices` are optional inside `<ReferenceArrayInput>`.

## Defining Choices

The list of choices must be an array of objects - one object for each possible choice. In each object, `id` is the value, and the `name` is the label displayed to the user.

```jsx
<AutocompleteArrayInput
  source="roles"
  choices={[
    { id: "admin", name: "Admin" },
    { id: "u001", name: "Editor" },
    { id: "u002", name: "Moderator" },
    { id: "u003", name: "Reviewer" },
  ]}
/>
```

You can also use an array of objects with different properties for the label and value, given you specify the `optionText` and `optionValue` props:

```jsx
<AutocompleteArrayInput
  source="roles"
  choices={[
    { _id: "admin", label: "Admin" },
    { _id: "u001", label: "Editor" },
    { _id: "u002", label: "Moderator" },
    { _id: "u003", label: "Reviewer" },
  ]}
  optionValue="_id"
  optionText="label"
/>
```

The choices are translated by default, so you can use translation identifiers as choices:

```jsx
const choices = [
  { id: "admin", name: "myroot.roles.admin" },
  { id: "u001", name: "myroot.roles.u001" },
  { id: "u002", name: "myroot.roles.u002" },
  { id: "u003", name: "myroot.roles.u003" },
];
```

You can opt-out of this translation by setting the `translateChoice` prop to `false`.

If you need to _fetch_ the options from another resource, you're actually editing a one-to-many or a many-to-many relationship. In this case, wrap the `<AutocompleteArrayInput>` in a [`<ReferenceArrayInput>`](./reference-array-input) component. You don't need to specify the `choices` prop - the parent component injects it based on the possible values of the related resource.

```jsx
<ReferenceArrayInput source="tag_ids" reference="tags">
  <AutocompleteArrayInput />
</ReferenceArrayInput>
```

You can also pass an _array of strings_ for the choices:

```jsx
const roles = ["Admin", "Editor", "Moderator", "Reviewer"];
<AutocompleteArrayInput source="roles" choices={roles} />;
// is equivalent to
const choices = roles.map((value) => ({ id: value, name: value }));
<AutocompleteArrayInput source="roles" choices={choices} />;
```

## Using Inside `<ReferenceArrayInput>`

When used inside a [`<ReferenceArrayInput>`](./reference-array-input), whenever users type a string in the autocomplete input, `<AutocompleteArrayInput>` calls `dataProvider.getList()` using the string as filter, to return a filtered list of possible options from the reference resource. This filter is built using the `filterToQuery` prop.

By default, the filter is built using the `q` parameter. This means that if the user types the string 'lorem', the filter will be `{ q: 'lorem' }`.

You can customize the filter by setting the `filterToQuery` prop. It should be a function that returns a filter object.

```jsx
const filterToQuery = (searchText) => ({ name_ilike: `%${searchText}%` });

<ReferenceArrayInput source="tag_ids" reference="tags">
  <AutocompleteArrayInput filterToQuery={filterToQuery} />
</ReferenceArrayInput>;
```

## `matchSuggestion`

A custom filter function `(filter, choice) => boolean` that replaces the built-in substring match. Required when `optionText` is a React element (because the component cannot derive a text representation to search against). The function receives the current filter string and a choice object and must return `true` when the choice should be shown.

```jsx
const matchSuggestion = (filter, choice) =>
  choice.first_name.toLowerCase().includes(filter.toLowerCase()) ||
  choice.last_name.toLowerCase().includes(filter.toLowerCase());

<AutocompleteArrayInput
  source="author_ids"
  choices={choices}
  matchSuggestion={matchSuggestion}
/>
```

## `limitChoicesToValue`

When `true`, the dropdown only shows choices that are already in the selected values array. All other choices are hidden. Useful in read-heavy UIs where you want users to browse or remove current selections without seeing the full unselected list.

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  limitChoicesToValue
/>
```

## `isOptionEqualToValue`

A custom comparator `(choiceValue, fieldValue) => boolean` that determines when a choice matches a value already in the field array. By default the component uses `areIdsEqual`, which does a loose `==` comparison so string and number IDs match. Override this when you need strict equality or a domain-specific comparison.

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  isOptionEqualToValue={(option, value) => option === value}
/>
```

## `handleHomeEndKeys`

When `true`, pressing `Home` while the dropdown is open scrolls the option list to the first item, and pressing `End` scrolls to the last item. Useful for long lists where keyboard-only navigation is important.

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  handleHomeEndKeys
/>
```

## `emptyText`

Accepted for API parity with `<AutocompleteInput>` so code that passes `emptyText` to both variants compiles without errors. The array variant never renders a "(none)" entry — multiple values are deselected by clicking the × badge — so this prop has no visual effect.

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  emptyText="No tags"
/>
```

## `createValue`

The sentinel string stored as the option value for the "create new option" item in the dropdown. Defaults to `"@@ra-create"`. Only override this when your actual choices contain that string as an ID.

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  onCreate={(filter) => ({ id: String(filter).toLowerCase(), name: String(filter) })}
  createValue="__ra_create__"
/>
```

## `createLabel`

A hint label rendered as a menu item when the filter text is empty, letting users know they can type to create a new option. Unlike `createItemLabel`, this appears before the user has typed anything.

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  onCreate={(filter) => ({ id: String(filter).toLowerCase(), name: String(filter) })}
  createLabel="Start typing to add a tag"
/>
```

## `createItemLabel`

The label shown for the "Create …" menu item when the filter text is non-empty. Accepts a string (supports `%{item}` interpolation for the current filter) or a function `(filter) => ReactNode` for fully custom rendering. Defaults to the translation of `ra.action.create_item` ("Create %{item}").

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  onCreate={(filter) => ({ id: String(filter).toLowerCase(), name: String(filter) })}
  createItemLabel="Add '%{item}' as a new tag"
/>
```

## `createHintValue`

An internal sentinel string passed to `useSupportCreateSuggestion` to identify the "create new option" item in the dropdown. You rarely need to set this — only override it when the default sentinel (`@@ra-create`) collides with a real choice value in your dataset.

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  onCreate={(filter) => ({ id: filter, name: filter })}
  createHintValue="__new__"
/>
```

## `create`

Pass a React element to let users create a new option on the fly. `<AutocompleteArrayInput>` renders a "Create …" menu item at the bottom of the dropdown; clicking it mounts the element you provide. Use `useCreateSuggestionContext` inside the element to access the current filter text and the `onCreate` callback.

```jsx
import { useCreateSuggestionContext } from "ra-core";

const CreateTag = () => {
  const { onCancel, onCreate, filter } = useCreateSuggestionContext();
  const [name, setName] = React.useState(filter ?? "");
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Button onClick={() => onCreate({ id: name.toLowerCase(), name })}>Save</Button>
      </DialogContent>
    </Dialog>
  );
};

<AutocompleteArrayInput
  source="tags"
  choices={choices}
  create={<CreateTag />}
/>
```

## `clearOnBlur`

When `true`, the filter text typed in the search input is cleared when the input loses focus. This means if the user opens the dropdown, types to narrow results, then clicks away without selecting, the filter resets to empty.

```jsx
<AutocompleteArrayInput
  source="tags"
  choices={choices}
  clearOnBlur
/>
```

## Working With Object Values

When working with a field that contains an array of _objects_, use `parse` and `format` to turn the value into an array of scalar values.

So for instance, for editing the `tags` field of records looking like the following:

```json
{
  "id": 123,
  "tags": [{ "id": "lifestyle" }, { "id": "photography" }]
}
```

You should use the following syntax:

```jsx
<AutocompleteArrayInput
  source="tags"
  parse={(value) => value && value.map((v) => ({ id: v }))}
  format={(value) => value && value.map((v) => v.id)}
  choices={[
    { id: "programming", name: "Programming" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "photography", name: "Photography" },
  ]}
/>
```
