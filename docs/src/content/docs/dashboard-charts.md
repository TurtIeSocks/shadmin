---
title: "DashboardCharts"
---

The `DashboardCharts` family provides four ready-made chart and metric components for admin dashboards. All components are pure — they accept `data` and field-name props and render via [Recharts](https://recharts.org/) inside a shadcn `<Card>` shell. Each component supports a `loading` skeleton state.

## `<MetricCard>`

Displays a single KPI: label, value, optional delta indicator, and optional icon.

```tsx
import { MetricCard } from "@/components/admin";
import { DollarSignIcon } from "lucide-react";

<MetricCard
  label="Revenue"
  value={12500}
  delta={0.12}
  format={(v) => `$${v.toLocaleString()}`}
  icon={DollarSignIcon}
/>
```

The delta sign determines color: positive values use emerald, negative values use rose, zero uses muted.

### Props

| Prop        | Required | Type                               | Default | Description                                              |
| ----------- | -------- | ---------------------------------- | ------- | -------------------------------------------------------- |
| `label`     | Required | `string`                           | -       | Small uppercase label above the value.                   |
| `value`     | Required | `number \| string`                 | -       | Main displayed value.                                    |
| `delta`     | Optional | `number`                           | -       | Fractional change (e.g., `0.12` = +12%). Adds arrow + colored percentage. |
| `format`    | Optional | `(value: number) => ReactNode`     | -       | Custom formatter applied when `value` is a number.       |
| `icon`      | Optional | `ComponentType<{ className? }>`    | -       | Lucide or any icon component rendered in the top-right.  |
| `loading`   | Optional | `boolean`                          | `false` | Render skeleton instead of content.                      |
| `className` | Optional | `string`                           | -       | Forwarded to the outer `<Card>`.                         |

## `<TrendChart>`

A line chart for time-series data.

```tsx
import { TrendChart } from "@/components/admin";

<TrendChart
  data={[
    { date: "2026-01", revenue: 1000 },
    { date: "2026-02", revenue: 1500 },
    { date: "2026-03", revenue: 1200 },
  ]}
  xField="date"
  yField="revenue"
  title="Monthly Revenue"
  height={220}
  color="hsl(217 91% 60%)"
/>
```

### Props

| Prop        | Required | Type                             | Default          | Description                                   |
| ----------- | -------- | -------------------------------- | ---------------- | --------------------------------------------- |
| `data`      | Required | `Array<Record<string, unknown>>` | -                | Data array.                                   |
| `xField`    | Required | `string`                         | -                | Key for the X axis.                           |
| `yField`    | Required | `string`                         | -                | Key for the Y axis / line value.              |
| `title`     | Optional | `ReactNode`                      | -                | Card title rendered in the header.            |
| `color`     | Optional | `string`                         | `var(--primary)` | CSS color for the line stroke.                |
| `height`    | Optional | `number`                         | `200`            | Card content height in pixels.                |
| `loading`   | Optional | `boolean`                        | `false`          | Render skeleton instead of chart.             |
| `className` | Optional | `string`                         | -                | Forwarded to the outer `<Card>`.              |

## `<BarChart>`

A vertical bar chart for categorical comparisons.

```tsx
import { BarChart } from "@/components/admin";

<BarChart
  data={[
    { category: "Electronics", count: 42 },
    { category: "Clothing", count: 28 },
  ]}
  xField="category"
  yField="count"
  title="Orders by Category"
  height={220}
/>
```

### Props

| Prop        | Required | Type                             | Default          | Description                                   |
| ----------- | -------- | -------------------------------- | ---------------- | --------------------------------------------- |
| `data`      | Required | `Array<Record<string, unknown>>` | -                | Data array.                                   |
| `xField`    | Required | `string`                         | -                | Key for the X axis categories.                |
| `yField`    | Required | `string`                         | -                | Key for bar height values.                    |
| `title`     | Optional | `ReactNode`                      | -                | Card title rendered in the header.            |
| `color`     | Optional | `string`                         | `var(--primary)` | CSS fill color for bars.                      |
| `height`    | Optional | `number`                         | `200`            | Card content height in pixels.                |
| `loading`   | Optional | `boolean`                        | `false`          | Render skeleton instead of chart.             |
| `className` | Optional | `string`                         | -                | Forwarded to the outer `<Card>`.              |

## `<DonutChart>`

A donut/pie chart for part-to-whole relationships.

```tsx
import { DonutChart } from "@/components/admin";

<DonutChart
  data={[
    { label: "Open", value: 30 },
    { label: "Closed", value: 70 },
    { label: "Pending", value: 15 },
  ]}
  labelField="label"
  valueField="value"
  title="Ticket Status"
  height={220}
/>
```

### Props

| Prop          | Required | Type                             | Default               | Description                                          |
| ------------- | -------- | -------------------------------- | --------------------- | ---------------------------------------------------- |
| `data`        | Required | `Array<Record<string, unknown>>` | -                     | Data array.                                          |
| `labelField`  | Required | `string`                         | -                     | Key used as the segment name (shown in tooltip).     |
| `valueField`  | Required | `string`                         | -                     | Key for segment numeric value.                       |
| `title`       | Optional | `ReactNode`                      | -                     | Card title rendered in the header.                   |
| `colors`      | Optional | `string[]`                       | 5 CSS variable colors | Array of CSS color strings, cycled by index.         |
| `height`      | Optional | `number`                         | `200`                 | Card content height in pixels.                       |
| `loading`     | Optional | `boolean`                        | `false`               | Render skeleton instead of chart.                    |
| `className`   | Optional | `string`                         | -                     | Forwarded to the outer `<Card>`.                     |

## `loading`

All four components accept a `loading` prop. When `true`, a skeleton placeholder is rendered instead of the chart content. This is useful while data is being fetched.

```tsx
<MetricCard label="Revenue" value={0} loading />
<TrendChart data={[]} xField="date" yField="value" loading />
```

## Colors

`TrendChart` and `BarChart` default to `var(--primary)`, which follows the active theme. Pass any CSS color string to override:

```tsx
<TrendChart color="hsl(142 76% 36%)" ... />
<BarChart color="#6366f1" ... />
```

`DonutChart` defaults to five `--chart-*` CSS variables (falling back to hardcoded hsl values if the variables are not defined), cycling for segments beyond the fifth.
