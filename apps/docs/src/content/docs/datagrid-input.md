---
title: "DatagridInput"
---

Form input that renders a list of records in a table and lets the user select rows via row checkboxes. The field value is an array of selected record ids.

:::caution
`<DatagridInput>` is **experimental**. Upstream `ra-ui-materialui` marks the equivalent component as a work in progress, and this port intentionally ships a simplified version. The following features are **not yet supported**:

- Filter integration (`filters` prop is ignored)
- Built-in pagination (pass your own component via `pagination` if needed)
- Create-suggestion (`SupportCreateSuggestionOptions`)
  :::

## Usage

Most commonly used as the child of a `<ReferenceArrayInput>`, where it gets its choices from the choices context:

```tsx
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceArrayInput,
  DatagridInput,
  DataTable,
} from "@/components/admin";

const TeamEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" />
      <ReferenceArrayInput source="members" reference="users">
        <DatagridInput>
          <DataTable.Col source="firstName" />
          <DataTable.Col source="lastName" />
        </DatagridInput>
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);
```

You can also pass a static `choices` array for use without a reference:

```tsx
<DatagridInput
  source="members"
  choices={[
    { id: 1, firstName: "Ada", lastName: "Lovelace" },
    { id: 2, firstName: "Alan", lastName: "Turing" },
  ]}
>
  <DataTable.Col source="firstName" />
  <DataTable.Col source="lastName" />
</DatagridInput>
```

## Props

| Prop         | Required | Type                             | Default      | Description                                                           |
| ------------ | -------- | -------------------------------- | ------------ | --------------------------------------------------------------------- |
| `children`   | Optional | `ReactNode`                      | -            | `<DataTable.Col>` columns to render                                   |
| `choices`    | Optional | `object[]`                       | -            | Static list of records (when not used inside `<ReferenceArrayInput>`) |
| `className`  | Optional | `string`                         | -            | Wrapper CSS classes                                                   |
| `filters`    | Optional | `ReactElement \| ReactElement[]` | -            | **Currently ignored** in this port                                    |
| `helperText` | Optional | `ReactNode`                      | -            | Help text below the table                                             |
| `label`      | Optional | `ReactNode`                      | -            | Reserved for future use                                               |
| `pagination` | Optional | `ReactElement \| false`          | -            | Pagination element to render below the table                          |
| `resource`   | Optional | `string`                         | from context | Resource of the records being displayed                               |
| `source`     | Optional | `string`                         | from context | Field name. Inferred from the choices context when omitted            |

## `source`

The form field that will hold the array of selected record ids. When `<DatagridInput>` is used inside a `<ReferenceArrayInput>`, the source is inferred from the parent.

```tsx
<DatagridInput source="members" choices={users}>
  <DataTable.Col source="firstName" />
</DatagridInput>
```

## `choices`

A static list of records to display, with the same shape as the records returned by a data provider (each record must have an `id`).

```tsx
<DatagridInput
  source="members"
  choices={[
    { id: 1, firstName: "Ada", lastName: "Lovelace" },
    { id: 2, firstName: "Alan", lastName: "Turing" },
  ]}
>
  <DataTable.Col source="firstName" />
  <DataTable.Col source="lastName" />
</DatagridInput>
```

## `helperText`

Renders below the table. Strings are translated via the i18n provider.

```tsx
<DatagridInput
  source="members"
  choices={users}
  helperText="Pick at least one team member"
>
  <DataTable.Col source="firstName" />
</DatagridInput>
```
