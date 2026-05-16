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
