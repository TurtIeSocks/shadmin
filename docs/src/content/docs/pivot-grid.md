---
title: "PivotGrid"
---

`<PivotGrid>` is a cross-tab aggregate view. Pick a row field and a column field; the grid shows aggregated values (count, sum, avg, min, max) at each intersection, plus row and column totals. It reads from `useListContext` so it composes inside `<List>`. Aggregation is pure client-side — for very large datasets, server-aggregate first and pass records via the `data` prop.

## Usage

Inside a `<List>`:

```tsx
import { List, PivotGrid } from "@/components/admin";

const OrderList = () => (
  <List perPage={5000}>
    <PivotGrid
      rowField="region"
      columnField="status"
      valueField="amount"
      aggregator="sum"
    />
  </List>
);
```

With explicit data (no `<List>` required):

```tsx
import { PivotGrid } from "@/components/admin";

<PivotGrid
  data={orders}
  rowField="region"
  columnField="status"
  valueField="amount"
  aggregator="sum"
/>;
```

## Props

| Prop          | Required | Type                                          | Default                  | Description                                                                |
| ------------- | -------- | --------------------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| `rowField`    | Required | `string`                                      | —                        | Record field whose distinct values become the row headers.                 |
| `columnField` | Required | `string`                                      | —                        | Record field whose distinct values become the column headers.              |
| `data`        | Optional | `Record<string, unknown>[]`                   | from `useListContext`    | Explicit data array. If omitted, data is read from the enclosing `<List>`. |
| `valueField`  | Optional | `string`                                      | —                        | Numeric field to aggregate. If absent the aggregator is always `"count"`.  |
| `aggregator`  | Optional | `"count" \| "sum" \| "avg" \| "min" \| "max"` | `"count"`                | How to combine values for each (row, column) cell.                         |
| `formatter`   | Optional | `(value: number) => ReactNode`                | integer or `.toFixed(2)` | Formats each cell value. Defaults to integer string or two-decimal float.  |
| `emptyLabel`  | Optional | `string`                                      | `"No data"` (i18n)       | Message shown when there are no rows or columns to display.                |

## `aggregator`

Five built-in aggregation modes:

| Value     | Description                                              |
| --------- | -------------------------------------------------------- |
| `"count"` | Number of records in the intersection.                   |
| `"sum"`   | Sum of `valueField` for all records in the intersection. |
| `"avg"`   | Arithmetic mean of `valueField`.                         |
| `"min"`   | Minimum of `valueField`.                                 |
| `"max"`   | Maximum of `valueField`.                                 |

When `valueField` is omitted, `aggregator` is effectively always `"count"` regardless of the prop value.

```tsx
<PivotGrid
  rowField="department"
  columnField="month"
  valueField="revenue"
  aggregator="avg"
  formatter={(v) => `$${v.toFixed(2)}`}
/>
```

## `formatter`

Supply a custom `formatter` to control cell rendering — useful for currency, percentages, or any visual treatment:

```tsx
<PivotGrid
  rowField="region"
  columnField="status"
  valueField="amount"
  aggregator="sum"
  formatter={(v) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(v)
  }
/>
```

The default formatter renders integers as plain strings and floats with two decimal places.

## Empty cells

Intersections with no records render an em dash (`—`) rather than `0`. This distinguishes "no data" from a genuine zero value. Row and column totals always include only the non-empty intersections.

## Performance note

Aggregation runs client-side on every render using `useMemo`. For datasets with thousands of records the cost is negligible, but for very large datasets (tens of thousands of rows) you should server-aggregate and pass pre-summarized records via the `data` prop so the browser receives a small cross-tab rather than the raw rows.

```tsx
// Server returns pre-aggregated: [{ region, status, total_amount }]
<PivotGrid
  data={serverSummary}
  rowField="region"
  columnField="status"
  valueField="total_amount"
  aggregator="sum"
/>
```
