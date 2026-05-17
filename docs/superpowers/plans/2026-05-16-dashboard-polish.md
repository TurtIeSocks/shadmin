# Dashboard Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three bounded fixes — replace echarts in OrderChart with internal TrendChart, eliminate kanban DnD spring-back, fix MDX editor dark mode.

**Architecture:** All three are surgical edits in 1-2 files. Each task ends with a focused commit.

**Tech Stack:** React 19, ra-core, recharts, @dnd-kit/core, @mdxeditor/editor, Vitest + Playwright browser provider.

**Related specs:**

- [order-chart-trendchart](../specs/2026-05-16-order-chart-trendchart-design.md)
- [kanban-dnd-fix](../specs/2026-05-16-kanban-dnd-fix-design.md)
- [mdx-dark-mode](../specs/2026-05-16-mdx-dark-mode-design.md)

---

## Task 1: Extend TrendChart API + swap OrderChart impl

**Files:**

- Modify: `src/components/extras/dashboard-charts.tsx`
- Modify: `src/components/extras/dashboard-charts.spec.tsx`
- Modify: `src/demo/dashboard/OrderChart.tsx`
- Modify: `package.json` (drop `echarts` dep)

- [ ] **Step 1: Write failing tests for new TrendChart props**

Add to `src/components/extras/dashboard-charts.spec.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { TrendChart } from "./dashboard-charts";

describe("TrendChart extended API", () => {
  const data = [
    { x: 1, y: 10 },
    { x: 2, y: 20 },
  ];

  it("renders gradient defs when area=true", async () => {
    const { container } = render(
      <TrendChart data={data} xField="x" yField="y" area bare />,
    );
    const gradient = container.querySelector("linearGradient");
    expect(gradient).not.toBeNull();
  });

  it("applies xTickFormatter", async () => {
    const { container } = render(
      <TrendChart
        data={data}
        xField="x"
        yField="y"
        xTickFormatter={(v) => `T${v}`}
        bare
      />,
    );
    await new Promise((r) => setTimeout(r, 100));
    const ticks = container.querySelectorAll(".recharts-xAxis text");
    const labels = Array.from(ticks).map((t) => t.textContent);
    expect(labels.some((l) => l?.startsWith("T"))).toBe(true);
  });

  it("skips Card wrapper when bare=true", async () => {
    const { container } = render(
      <TrendChart data={data} xField="x" yField="y" bare />,
    );
    expect(container.querySelector('[data-slot="trend-chart"]')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run --browser.headless src/components/extras/dashboard-charts.spec.tsx
```

Expected: 3 new tests FAIL (props not recognized / Card wrapper still present).

- [ ] **Step 3: Extend `TrendChart` in `dashboard-charts.tsx`**

Replace the existing `TrendChartProps` interface + `TrendChart` component + `ChartShell` with:

```tsx
import { Area, AreaChart as RechartsArea } from "recharts";
import { useId } from "react";

interface ChartShellProps {
  title?: ReactNode;
  loading?: boolean;
  height: number;
  className?: string;
  slot: string;
  bare?: boolean;
  children: ReactNode;
}

const ChartShell = ({
  title,
  loading,
  height,
  className,
  slot,
  bare,
  children,
}: ChartShellProps) => {
  const inner = loading ? (
    <Skeleton className="h-full w-full" />
  ) : (
    <ResponsiveContainer width="100%" height="100%" minHeight={height}>
      {children as ReactElement<unknown>}
    </ResponsiveContainer>
  );
  if (bare) return <div style={{ height }}>{inner}</div>;
  return (
    <Card className={className} data-slot={slot}>
      {title ? (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent style={{ height }}>{inner}</CardContent>
    </Card>
  );
};

export interface TrendChartProps {
  data: Array<Record<string, unknown>>;
  xField: string;
  yField: string;
  title?: ReactNode;
  color?: string;
  height?: number;
  loading?: boolean;
  className?: string;
  area?: boolean;
  smooth?: boolean;
  bare?: boolean;
  xTickFormatter?: (value: unknown) => string;
  yTickFormatter?: (value: unknown) => string;
  tooltipFormatter?: (value: unknown, name: string) => [ReactNode, ReactNode];
}

export const TrendChart = ({
  data,
  xField,
  yField,
  title,
  color = "var(--primary)",
  height = 200,
  loading,
  className,
  area = false,
  smooth = false,
  bare = false,
  xTickFormatter,
  yTickFormatter,
  tooltipFormatter,
}: TrendChartProps) => {
  const gradientId = `trendChartGradient-${useId().replace(/:/g, "")}`;
  const curveType = smooth ? "monotone" : "linear";

  const inner = area ? (
    <RechartsArea
      data={data}
      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.8} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis
        dataKey={xField}
        className="text-xs"
        tickFormatter={xTickFormatter}
      />
      <YAxis className="text-xs" tickFormatter={yTickFormatter} />
      <Tooltip formatter={tooltipFormatter} />
      <Area
        type={curveType}
        dataKey={yField}
        stroke={color}
        strokeWidth={2}
        fill={`url(#${gradientId})`}
        dot={false}
        activeDot={{ r: 4 }}
      />
    </RechartsArea>
  ) : (
    <RechartsLine
      data={data}
      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis
        dataKey={xField}
        className="text-xs"
        tickFormatter={xTickFormatter}
      />
      <YAxis className="text-xs" tickFormatter={yTickFormatter} />
      <Tooltip formatter={tooltipFormatter} />
      <Line
        type={curveType}
        dataKey={yField}
        stroke={color}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4 }}
      />
    </RechartsLine>
  );

  return (
    <ChartShell
      title={title}
      loading={loading}
      height={height}
      className={className}
      slot="trend-chart"
      bare={bare}
    >
      {inner}
    </ChartShell>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run --browser.headless src/components/extras/dashboard-charts.spec.tsx
```

Expected: all tests PASS.

- [ ] **Step 5: Refactor OrderChart to use TrendChart**

Replace contents of `src/demo/dashboard/OrderChart.tsx`:

```tsx
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
          bare
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

- [ ] **Step 6: Drop echarts dep**

```bash
pnpm remove echarts
```

- [ ] **Step 7: Typecheck + lint**

```bash
make typecheck && make lint
```

- [ ] **Step 8: Commit**

```bash
git add src/components/extras/dashboard-charts.tsx src/components/extras/dashboard-charts.spec.tsx src/demo/dashboard/OrderChart.tsx package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(charts): extend TrendChart with area/smooth/formatters; swap OrderChart from echarts

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Kanban DnD spring-back fix

**Files:**

- Modify: `src/components/extras/kanban-board.tsx` (line ~382 `<DragOverlay>`)
- Modify: `src/components/extras/kanban-board.spec.tsx`

- [ ] **Step 1: Add failing test asserting card lands in target column**

Append to `src/components/extras/kanban-board.spec.tsx`:

```tsx
it("places dragged card under target column on drop", async () => {
  // Skeleton — use existing test setup pattern from this file for KanbanBoard.
  // After drag-end simulation, query for the card by id and verify its closest
  // [data-column-id] matches the target column id, not the source.
  // Test details depend on existing test harness; if @dnd-kit drag simulation
  // is too brittle, assert via direct state mutation through the exposed
  // onDragEnd prop or skip and rely on manual verification.
});
```

- [ ] **Step 2: Run test to verify it fails (or is skipped)**

```bash
pnpm vitest run --browser.headless src/components/extras/kanban-board.spec.tsx
```

- [ ] **Step 3: Apply primary fix — disable drop animation**

In `src/components/extras/kanban-board.tsx`, locate the `<DragOverlay>` (~line 382). Change:

```tsx
<DragOverlay>
```

to:

```tsx
<DragOverlay dropAnimation={null}>
```

- [ ] **Step 4: Manual browser verification**

```bash
make run
```

Open `http://localhost:5173`, navigate to the kanban demo (under Component Gallery or its real demo placement after Phase 4c). Drag a card from one column to another. Verify no spring-back animation; card disappears from source and appears in destination cleanly.

- [ ] **Step 5: If perceptible flicker remains, add defensive pendingMoves mirror**

Only if step 4 shows a flicker. See spec section "Defensive change" for the pattern. Add `pendingMoves` state, override `cardsByColumn` derivation, clear in `onSettled`.

- [ ] **Step 6: Run kanban spec**

```bash
pnpm vitest run --browser.headless src/components/extras/kanban-board.spec.tsx
```

- [ ] **Step 7: Commit**

```bash
git add src/components/extras/kanban-board.tsx src/components/extras/kanban-board.spec.tsx
git commit -m "$(cat <<'EOF'
fix(kanban-board): disable drop animation to eliminate spring-back visual glitch

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: MDX editor dark mode

**Files:**

- Modify: `src/components/mdx-editor/mdx-input.tsx`
- Modify: `src/components/mdx-editor/mdx-field.tsx`
- Modify: `src/components/mdx-editor/mdx-input.spec.tsx`
- Modify: `src/components/mdx-editor/mdx-field.spec.tsx`
- Modify: `src/stories/mdx-editor/mdx-input.stories.tsx`
- Modify: `src/stories/mdx-editor/mdx-field.stories.tsx`
- Possibly create: `src/components/mdx-editor/mdx-editor-dark.css`

- [ ] **Step 1: Verify `useTheme` export shape**

```bash
grep -n "export function useTheme\|export const useTheme" src/components/admin/theme-provider.tsx
```

Note the return shape (likely `{ theme: "light" | "dark" | "system", setTheme }`).

- [ ] **Step 2: Verify `@mdxeditor/editor` dark-mode class support**

```bash
grep -rn "mdxeditor-dark\|--mdxeditor-bg-color" node_modules/@mdxeditor/editor/dist/ 2>/dev/null | head -5
```

If matches found → library has dark theme; class-based fix works. If empty → need CSS-var override file (proceed to step 6).

- [ ] **Step 3: Write failing dark-mode test for mdx-input**

Append to `src/components/mdx-editor/mdx-input.spec.tsx`:

```tsx
import { ThemeProvider } from "@/components/admin/theme-provider";

it("applies mdxeditor-dark class when theme=dark", async () => {
  const { container } = render(
    <ThemeProvider defaultTheme="dark">
      {/* existing wrapper + MdxInput render */}
    </ThemeProvider>,
  );
  await new Promise((r) => setTimeout(r, 100));
  const editor = container.querySelector(".mdxeditor");
  expect(editor?.classList.contains("mdxeditor-dark")).toBe(true);
});
```

Mirror in `mdx-field.spec.tsx`.

- [ ] **Step 4: Run tests to verify they fail**

```bash
pnpm vitest run --browser.headless src/components/mdx-editor/
```

- [ ] **Step 5: Implement fix in `mdx-input.tsx` + `mdx-field.tsx`**

Add at top of both files:

```tsx
import { useTheme } from "@/components/admin/theme-provider";
import { cn } from "@/lib/utils";
```

Inside both components, before the `<MDXEditor>` render:

```tsx
const { theme } = useTheme();
const isDark =
  theme === "dark" ||
  (theme === "system" &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
```

Update `<MDXEditor>` className prop:

```tsx
<MDXEditor
  {...mdxProps}
  className={cn(mdxProps?.className, isDark && "mdxeditor-dark")}
/>
```

- [ ] **Step 6: If step 2 showed no library support, write CSS override**

Create `src/components/mdx-editor/mdx-editor-dark.css`:

```css
.mdxeditor.mdxeditor-dark,
.mdxeditor.mdxeditor-dark .mdxeditor-toolbar,
.mdxeditor.mdxeditor-dark .mdxeditor-popup-container {
  --mdxeditor-bg-color: var(--background);
  --mdxeditor-text-color: var(--foreground);
  --mdxeditor-toolbar-bg-color: var(--card);
  background-color: var(--background);
  color: var(--foreground);
}
.mdxeditor.mdxeditor-dark [contenteditable="true"] {
  color: var(--foreground) !important;
  caret-color: var(--foreground);
}
```

Import at top of `mdx-input.tsx`:

```tsx
import "./mdx-editor-dark.css";
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
pnpm vitest run --browser.headless src/components/mdx-editor/
```

- [ ] **Step 8: Add `Dark` story variants**

In `src/stories/mdx-editor/mdx-input.stories.tsx`, add export:

```tsx
export const Dark = () => (
  <div className="dark bg-background p-4">
    <Basic />
  </div>
);
```

Mirror in `mdx-field.stories.tsx`.

- [ ] **Step 9: Manual browser verification**

```bash
make storybook
```

Open mdx-input story → Dark variant. Verify text is light-on-dark. Toggle to mdx-field story → Dark. Same check.

- [ ] **Step 10: Typecheck + lint**

```bash
make typecheck && make lint
```

- [ ] **Step 11: Commit**

```bash
git add src/components/mdx-editor/ src/stories/mdx-editor/
git commit -m "$(cat <<'EOF'
fix(mdx-editor): apply mdxeditor-dark class in dark mode for readable text

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## End-of-plan checks

- [ ] Full test suite green:
  ```bash
  make test
  ```
- [ ] Visual smoke test on `make run`:
  - Dashboard renders OrderChart with area gradient + smooth curve + $ ticks
  - Kanban drag works cleanly
  - Toggle to dark mode → MDX editor text readable
