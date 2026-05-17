# OrderChart → internal `TrendChart` swap

**Date:** 2026-05-16
**Status:** Draft
**Related todos:** Replace OrderChart echarts implementation with internal `dashboard-charts` component.

---

## Goal

Replace echarts in `src/demo/dashboard/OrderChart.tsx` with the project-internal `<TrendChart>` from `src/components/extras/dashboard-charts.tsx`. Extend `TrendChart`'s public API so OrderChart loses no visual fidelity (smooth monotone curve, area gradient fill, formatted axis ticks + tooltip).

This serves two purposes:

1. Drop the heavy `echarts` dependency from the demo if no other consumer remains.
2. Dogfood the internal charting primitive, exposing its API gaps and growing it in service of a real use case.

---

## TrendChart API extensions

Add 5 optional props to `TrendChartProps`:

```ts
export interface TrendChartProps {
  data: Array<Record<string, unknown>>;
  xField: string;
  yField: string;
  title?: ReactNode;
  color?: string;
  height?: number;
  loading?: boolean;
  className?: string;

  /** Render an area chart with vertical gradient (top opaque → bottom transparent). Default false. */
  area?: boolean;
  /** Use monotone curve instead of straight segments. Default false. */
  smooth?: boolean;
  /** Format x-axis tick labels. */
  xTickFormatter?: (value: unknown) => string;
  /** Format y-axis tick labels. */
  yTickFormatter?: (value: unknown) => string;
  /** Custom tooltip formatter — receives recharts tooltip props. */
  tooltipFormatter?: (value: unknown, name: string) => [ReactNode, ReactNode];
}
```

### Rendering behaviour

- `area=false` (default): existing `<LineChart>` + `<Line>` render. No behaviour change for current callers.
- `area=true`: render `<AreaChart>` + `<Area>` with `<defs><linearGradient id="trendChartGradient-{uid}">` (two stops: `offset=5%` opacity 0.8, `offset=95%` opacity 0). `<Area fill="url(#trendChartGradient-{uid})" stroke={color} strokeWidth={2}>`.
- `smooth=true`: pass `type="monotone"` to `<Line>` / `<Area>` (default is `type="linear"`).
- `xTickFormatter` / `yTickFormatter`: pass through as `tickFormatter` prop on `<XAxis>` / `<YAxis>`.
- `tooltipFormatter`: pass through as `formatter` prop on `<Tooltip>`.

### Gradient ID uniqueness

Multiple `<TrendChart area>` instances on one page need unique gradient IDs. Use `React.useId()` to generate the suffix.

---

## OrderChart refactor

`src/demo/dashboard/OrderChart.tsx` becomes:

```tsx
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslate } from "ra-core";
import { format, subDays } from "date-fns";
import { TrendChart } from "@/components/extras/dashboard-charts";
import { Order } from "../types";

const lastDay = new Date();
const lastMonthDays = Array.from({ length: 30 }, (_, i) => subDays(lastDay, i));

const aggregateOrdersByDay = (orders: Order[]) =>
  orders
    .filter((o) => o.status !== "cancelled")
    .reduce<Record<string, number>>((acc, curr) => {
      const day = format(curr.date, "yyyy-MM-dd");
      acc[day] = (acc[day] ?? 0) + curr.total;
      return acc;
    }, {});

const getRevenuePerDay = (orders: Order[]) => {
  const byDay = aggregateOrdersByDay(orders);
  return lastMonthDays.map((date) => ({
    date: date.getTime(),
    total: byDay[format(date, "yyyy-MM-dd")] ?? 0,
  }));
};

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

const OrderChart = ({ orders }: { orders?: Order[] }) => {
  const translate = useTranslate();
  if (!orders) return null;
  const data = getRevenuePerDay(orders);
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-xl">{translate("pos.dashboard.month_history")}</h2>
        <TrendChart
          data={data}
          xField="date"
          yField="total"
          color="#8884d8"
          height={300}
          area
          smooth
          xTickFormatter={(v) => new Date(v as number).toLocaleDateString()}
          yTickFormatter={(v) => `$${v}`}
          tooltipFormatter={(v) => [
            currencyFormatter.format(v as number),
            "Revenue",
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default OrderChart;
```

The outer `<Card>` + heading stay (don't pass `title` to `<TrendChart>` so internal `Card` shell is suppressed). Actually `TrendChart` always renders its `Card` shell — we need to extract the inner `ChartShell` or accept a double-card. **Decision:** make `ChartShell` rendering conditional on `title` being defined (only wrap in `Card` when given a title). Update `ChartShell` to skip the `<Card>` wrapper when `title` is `undefined` and `className` is empty.

Actually simpler: add a `bare?: boolean` prop to `TrendChart` that skips the `Card` wrapper entirely. Default `false` (existing behaviour preserved).

```tsx
<TrendChart bare ... />
```

---

## Files

- `src/components/extras/dashboard-charts.tsx` — extend `TrendChartProps` + `TrendChart` impl + `ChartShell` to honor `bare`.
- `src/components/extras/dashboard-charts.spec.tsx` — add tests for new props (area renders gradient `<defs>`, smooth sets monotone, formatters applied, bare skips Card).
- `src/demo/dashboard/OrderChart.tsx` — replace echarts impl.
- `package.json` — remove `echarts` dep if no other consumer (grep first).

---

## Acceptance criteria

- [ ] `<TrendChart area smooth xTickFormatter yTickFormatter tooltipFormatter bare>` renders identical visual to old echarts OrderChart (area gradient under monotone curve, $-prefixed y-axis ticks, locale dates on x-axis, formatted tooltip).
- [ ] Existing `<TrendChart>` callers (stories, specs) render unchanged with `area=false` / `smooth=false` defaults.
- [ ] `echarts` dep removed from `package.json` (verify no other usage via `grep -r "echarts" src/`).
- [ ] `dashboard-charts.spec.tsx` covers all new props.
- [ ] `OrderChart` spec (if any) still passes.
- [ ] No new lint or type errors.

---

## Assumptions

- Recharts' built-in `<AreaChart>` + `<defs><linearGradient>` is the canonical area-fill pattern. Documented at recharts.org/en-US/examples/AreaChartFillByValue.
- `React.useId()` produces a unique enough ID for SVG `<linearGradient>` instance — collision impossible within one DOM.
- `ChartShell` adding a `bare` mode (skip Card) is acceptable internal change; no public consumer relies on the Card wrapper being mandatory.
- Echarts removal is a separate decision — if `grep` reveals other usage, keep dep + note in PR description.
