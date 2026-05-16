"use client";

import { type ComponentType, type ReactElement, type ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
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

export interface MetricCardProps {
  label: string;
  value: number | string;
  delta?: number;
  format?: (value: number) => ReactNode;
  icon?: ComponentType<{ className?: string }>;
  title?: ReactNode;
  loading?: boolean;
  className?: string;
}

export const MetricCard = ({
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
  children: ReactNode;
}

const ChartShell = ({ title, loading, height, className, slot, children }: ChartShellProps) => (
  <Card className={className} data-slot={slot}>
    {title ? (
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
    ) : null}
    <CardContent style={{ height }}>
      {loading ? (
        <Skeleton className="h-full w-full" />
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={height}>
          {children as ReactElement<unknown>}
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

// ---------- TrendChart ----------

export interface TrendChartProps {
  data: Array<Record<string, unknown>>;
  xField: string;
  yField: string;
  title?: ReactNode;
  color?: string;
  height?: number;
  loading?: boolean;
  className?: string;
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
}: TrendChartProps) => (
  <ChartShell
    title={title}
    loading={loading}
    height={height}
    className={className}
    slot="trend-chart"
  >
    <RechartsLine data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey={xField} className="text-xs" />
      <YAxis className="text-xs" />
      <Tooltip />
      <Line
        type="monotone"
        dataKey={yField}
        stroke={color}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4 }}
      />
    </RechartsLine>
  </ChartShell>
);

// ---------- BarChart ----------

export interface BarChartProps {
  data: Array<Record<string, unknown>>;
  xField: string;
  yField: string;
  title?: ReactNode;
  color?: string;
  height?: number;
  loading?: boolean;
  className?: string;
}

export const BarChart = ({
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
    <RechartsBar data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey={xField} className="text-xs" />
      <YAxis className="text-xs" />
      <Tooltip />
      <Bar dataKey={yField} fill={color} radius={[4, 4, 0, 0]} />
    </RechartsBar>
  </ChartShell>
);

// ---------- DonutChart ----------

export interface DonutChartProps {
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

export const DonutChart = ({
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
        {data.map((_, i) => (
          <Cell key={i} fill={colors[i % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ChartShell>
);
