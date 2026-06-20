"use client";

import {
  type ComponentProps,
  type ComponentType,
  type ReactElement,
  type ReactNode,
  useId,
} from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
  Area,
  AreaChart as RechartsArea,
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLine,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ---------- MetricCard ----------

interface MetricCardProps {
  label: string;
  value: number | string;
  delta?: number;
  format?: (value: number) => ReactNode;
  icon?: ComponentType<{ className?: string }>;
  title?: ReactNode;
  loading?: boolean;
  className?: string;
}

const MetricCard = ({
  label,
  value,
  delta,
  format,
  icon: Icon,
  loading,
  className,
}: MetricCardProps) => {
  if (loading) {
    return (
      <Card className={className} data-slot="metric-card">
        <CardContent className="flex flex-col gap-2 pt-6">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-12" />
        </CardContent>
      </Card>
    );
  }
  const display = typeof value === "number" && format ? format(value) : value;
  const positive = (delta ?? 0) > 0;
  const negative = (delta ?? 0) < 0;
  return (
    <Card className={className} data-slot="metric-card">
      <CardContent className="flex flex-col gap-1 pt-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
          <span>{label}</span>
          {Icon ? <Icon className="size-4" /> : null}
        </div>
        <div className="text-2xl font-semibold tabular-nums">{display}</div>
        {delta !== undefined ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs",
              positive && "text-emerald-600 dark:text-emerald-400",
              negative && "text-rose-600 dark:text-rose-400",
              !positive && !negative && "text-muted-foreground",
            )}
          >
            {positive ? <ArrowUpIcon className="size-3" /> : null}
            {negative ? <ArrowDownIcon className="size-3" /> : null}
            <span>{(delta * 100).toFixed(1)}%</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

// ---------- ChartShell ----------

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

// ---------- TrendChart ----------

interface TrendChartProps {
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

const TrendChart = ({
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
  // Adapter: recharts v3 Tooltip formatter has a wider signature; pass only
  // the (value, name) pair through to the friendlier public prop.
  const rechartsTooltipFormatter = tooltipFormatter
    ? (value: unknown, name: unknown) =>
        tooltipFormatter(value, (name ?? "") as string)
    : undefined;

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
      <Tooltip
        formatter={
          rechartsTooltipFormatter as ComponentProps<
            typeof Tooltip
          >["formatter"]
        }
      />
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
      <Tooltip
        formatter={
          rechartsTooltipFormatter as ComponentProps<
            typeof Tooltip
          >["formatter"]
        }
      />
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

// ---------- BarChart ----------

interface BarChartProps {
  data: Array<Record<string, unknown>>;
  xField: string;
  yField: string;
  title?: ReactNode;
  color?: string;
  height?: number;
  loading?: boolean;
  className?: string;
}

const BarChart = ({
  data,
  xField,
  yField,
  title,
  color = "var(--primary)",
  height = 200,
  loading,
  className,
}: BarChartProps) => (
  <ChartShell
    title={title}
    loading={loading}
    height={height}
    className={className}
    slot="bar-chart"
  >
    <RechartsBar
      data={data}
      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey={xField} className="text-xs" />
      <YAxis className="text-xs" />
      <Tooltip />
      <Bar dataKey={yField} fill={color} radius={[4, 4, 0, 0]} />
    </RechartsBar>
  </ChartShell>
);

// ---------- DonutChart ----------

interface DonutChartProps {
  data: Array<Record<string, unknown>>;
  labelField: string;
  valueField: string;
  title?: ReactNode;
  colors?: string[];
  height?: number;
  loading?: boolean;
  className?: string;
}

const DEFAULT_DONUT_COLORS = [
  "var(--chart-1, hsl(217 91% 60%))",
  "var(--chart-2, hsl(142 76% 36%))",
  "var(--chart-3, hsl(38 92% 50%))",
  "var(--chart-4, hsl(0 84% 60%))",
  "var(--chart-5, hsl(262 83% 58%))",
];

const DonutChart = ({
  data,
  labelField,
  valueField,
  title,
  colors = DEFAULT_DONUT_COLORS,
  height = 200,
  loading,
  className,
}: DonutChartProps) => (
  <ChartShell
    title={title}
    loading={loading}
    height={height}
    className={className}
    slot="donut-chart"
  >
    <PieChart>
      <Pie
        data={data}
        dataKey={valueField}
        nameKey={labelField}
        innerRadius="60%"
        outerRadius="90%"
        paddingAngle={2}
      >
        {data.map((entry, i) => (
          <Cell
            key={String(entry[labelField])}
            fill={colors[i % colors.length]}
          />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ChartShell>
);

export {
  type MetricCardProps,
  MetricCard,
  type TrendChartProps,
  TrendChart,
  type BarChartProps,
  BarChart,
  type DonutChartProps,
  DonutChart,
};
