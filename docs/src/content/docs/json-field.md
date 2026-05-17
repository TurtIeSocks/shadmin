---
title: "JsonField"
---

Lightweight read-only JSON formatter rendered as a `<pre>`. **No Monaco dependency** — safe to use in List cells or anywhere a heavy editor would be overkill.

## Usage

```tsx
import { List, DataTable } from "@/components/admin";
import { JsonField } from "@/components/monaco";

const ProductList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col>
        <JsonField source="metadata" />
      </DataTable.Col>
    </DataTable>
  </List>
);
```

## Props

| Prop           | Required | Type                  | Default | Description                                            |
| -------------- | -------- | --------------------- | ------- | ------------------------------------------------------ |
| `source`       | Required | `string`              | -       | Field name                                             |
| `indent`       | Optional | `number`              | `2`     | Indent passed to `JSON.stringify`                      |
| `empty`        | Optional | `ReactNode`           | -       | Rendered when the value is `null` or `undefined`       |
| `className`    | Optional | `string`              | -       | Classes appended to the `<pre>`                        |
| `record`       | Optional | `object`              | Context | Record to read from (defaults to RecordContext)        |
| `defaultValue` | Optional | `unknown`             | -       | Fallback when the field is missing from the record     |

## Behavior

- Objects, arrays, numbers, booleans: rendered via `JSON.stringify(value, null, indent)`.
- Strings: parsed with `JSON.parse` and re-stringified. If the string is not valid JSON, it's rendered verbatim.
- `null` or `undefined`: renders the `empty` prop (or nothing if `empty` is not provided).

No syntax highlighting in v1. If you need highlighting, use [`<MonacoJsonField>`](./monaco-json-field).
