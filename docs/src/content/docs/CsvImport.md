---
title: "CsvImport"
---

`<CsvImport>` is a button + 4-step wizard that bulk-imports CSV data into a resource. The wizard guides users through Upload → Map → Preview → Commit, validates rows against a zod schema, batches inserts via `dataProvider.createMany` (with a `Promise.all`-of-`create` fallback), and produces a downloadable error report.

## Usage

```tsx
import { List, ListActions, CsvImport } from "@/components/admin";
import { z } from "zod";

const ProductImportSchema = z.object({
  reference: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  category: z.string().optional(),
});

const ProductList = () => (
  <List
    actions={
      <ListActions>
        <CsvImport
          schema={ProductImportSchema}
          mapping={{ name: "product_name", price: "unit_price" }}
          transform={(row) => ({ ...row, slug: slugify(row.name) })}
          batchSize={100}
          onComplete={({ created, failed }) =>
            notify(`Imported ${created}, ${failed} failed`, { type: "info" })
          }
        />
      </ListActions>
    }
  >
    ...
  </List>
);
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `schema` | `z.ZodObject` | — | Zod schema used for per-row validation in the Preview step. Without one, rows are imported as-is. |
| `mapping` | `Record<string, string>` | `{}` | Preset header-to-field mapping. Users can override in step 2. |
| `transform` | `(row, index) => object` | identity | Row-level transformation applied after mapping, before validation. |
| `batchSize` | `number` | `100` | Rows per `createMany` call. Falls back to sequential `create` if the provider doesn't implement it. |
| `label` | `string` | translated `Import` | Button label. |
| `icon` | `ComponentType` | `UploadIcon` | Button icon. |
| `resource` | `string` | from context | Override the target resource. |
| `onComplete` | `(report: ImportReport) => void` | — | Fired after the commit step finishes. |
| `onError` | `(error: Error) => void` | toast | Fired when commit raises irrecoverably. |

## `ImportReport`

```ts
interface ImportReport {
  total: number;
  created: number;
  failed: number;
  errors: Array<{ rowIndex: number; row: Record<string, unknown>; reason: string }>;
}
```

## Wizard steps

1. **Upload** — drag-and-drop or click to pick a CSV. PapaParse handles parsing with `header: true` and `skipEmptyLines: true`.
2. **Map columns** — table of resource fields × CSV headers. Auto-matches by case-insensitive fuzzy name matching (space/underscore/dash-insensitive). Required fields are starred.
3. **Preview** — renders the first 50 mapped + transformed rows, validating each against the schema. Counters show `X valid · Y errors · Z total`.
4. **Commit** — batches via `dataProvider.createMany` (fallback: `Promise.all` of single `create`). Progress bar updates per batch. On finish, shows the report and a "Download error report" CSV when failures exist.

## Validation strategy

When a `schema` is provided, each row is mapped + transformed + `safeParse`'d. Failures collect zod issue messages into `ImportReport.errors`. Without a schema, all rows are treated as valid.

## i18n

All strings translate under `ra.csv_import.*`. Provide overrides via your `i18nProvider` to localize.
