import {
  ArrowUpRight,
  DollarSign,
  type LucideIcon,
  ShoppingCart,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "shadmin/components/ui/chart";
import { cn } from "shadmin/lib/utils";
import {
  type DashboardData,
  formatCurrency,
  useDashboardData,
} from "./dashboard-data";

const EASE = "cubic-bezier(0.32,0.72,0,1)";

// Status → semantic colour (chip text + tinted bg + bar fill).
const STATUS_STYLE: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  ordered: { label: "Ordered", dot: "bg-amber-400", text: "text-amber-500" },
  delivered: {
    label: "Delivered",
    dot: "bg-emerald-400",
    text: "text-emerald-500",
  },
  cancelled: { label: "Cancelled", dot: "bg-rose-400", text: "text-rose-500" },
  unknown: {
    label: "Unknown",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
  },
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.unknown;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-medium">
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function TrendPill({ value }: { value: number }) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
        up
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-rose-500/10 text-rose-500",
      )}
    >
      <Icon className="size-3" strokeWidth={2} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

/** A KPI tile with a brand-gradient icon chip + corner glow. */
function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  sub,
  delay,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number | null;
  sub?: string;
  delay: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-border"
      style={{
        transitionTimingFunction: EASE,
        animation: `docs-rise 0.5s ${EASE} both`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-brand-gradient opacity-[0.07] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.16]"
      />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-sm shadow-indigo-500/20">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        {trend != null ? <TrendPill value={trend} /> : null}
      </div>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

/** Titled card shell with a brand top-hairline. */
function Panel({
  title,
  action,
  className,
  delay,
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-5",
        className,
      )}
      style={{
        animation: `docs-rise 0.5s ${EASE} both`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-40"
      />
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

const REVENUE_CHART_CONFIG = {
  revenue: { label: "Revenue", color: "var(--primary)" },
} as const;

function RevenueChart({ data, delay }: { data: DashboardData; delay: number }) {
  return (
    <Panel
      title="Revenue"
      delay={delay}
      className="lg:col-span-2"
      action={
        data.revenueTrend != null ? (
          <TrendPill value={data.revenueTrend} />
        ) : null
      }
    >
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums tracking-tight">
          {formatCurrency(data.revenue)}
        </span>
        <span className="text-xs text-muted-foreground">all-time trend</span>
      </div>
      <ChartContainer
        config={REVENUE_CHART_CONFIG}
        className="aspect-auto h-[220px] w-full"
      >
        <AreaChart
          data={data.revenueSeries}
          margin={{ left: 4, right: 4, top: 8 }}
        >
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-revenue)"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="var(--color-revenue)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="var(--border)"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            fontSize={12}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(Number(value))}
              />
            }
          />
          <Area
            dataKey="revenue"
            type="monotone"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            fill="url(#revFill)"
          />
        </AreaChart>
      </ChartContainer>
    </Panel>
  );
}

function StatusBreakdown({
  data,
  delay,
}: {
  data: DashboardData;
  delay: number;
}) {
  const total = data.statusBreakdown.reduce((s, x) => s + x.count, 0) || 1;
  return (
    <Panel title="Order status" delay={delay}>
      <div className="space-y-4">
        {data.statusBreakdown.map((s) => {
          const pct = (s.count / total) * 100;
          const style = STATUS_STYLE[s.status] ?? STATUS_STYLE.unknown;
          return (
            <div key={s.status}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", style.dot)} />
                  {style.label}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {s.count}
                  <span className="ml-1 text-xs">({pct.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", style.dot)}
                  style={{
                    width: `${pct}%`,
                    transition: `width 0.8s ${EASE}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 border-t border-border/50 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Avg order value</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatCurrency(data.avgOrderValue)}
          </span>
        </div>
      </div>
    </Panel>
  );
}

function RecentOrders({ data, delay }: { data: DashboardData; delay: number }) {
  return (
    <Panel
      title="Recent orders"
      delay={delay}
      action={
        <Link
          to="/demo/app/orders"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
        </Link>
      }
    >
      <div className="-mx-1 divide-y divide-border/50">
        {data.recentOrders.map((o) => (
          <div
            key={o.id}
            className="flex items-center gap-3 rounded-md px-1 py-2.5 text-sm"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-foreground">
                {o.customer}
              </span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                {o.reference}
                {o.date ? ` · ${dateFmt.format(new Date(o.date))}` : ""}
              </span>
            </div>
            <span className="ml-auto shrink-0 font-semibold tabular-nums">
              {formatCurrency(o.total)}
            </span>
            <StatusBadge status={o.status} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TopCustomers({ data, delay }: { data: DashboardData; delay: number }) {
  const max = Math.max(1, ...data.topCustomers.map((c) => c.totalSpent));
  return (
    <Panel
      title="Top customers"
      delay={delay}
      action={
        <Link
          to="/demo/app/customers"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
        </Link>
      }
    >
      <div className="space-y-3">
        {data.topCustomers.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-foreground">
                  {c.name}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {formatCurrency(c.totalSpent)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{
                    width: `${(c.totalSpent / max) * 100}%`,
                    transition: `width 0.8s ${EASE}`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/** Live, data-driven demo dashboard. */
export function Dashboard() {
  const data = useDashboardData();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A live look at your store — orders, revenue, and customers.
          </p>
        </div>
        {data.pendingReviews > 0 ? (
          <Link
            to="/demo/app/reviews"
            className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 py-1.5 pl-3 pr-2 text-sm transition-colors hover:bg-muted"
          >
            <Star className="size-3.5 text-amber-400" strokeWidth={1.75} />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {data.pendingReviews}
              </span>{" "}
              reviews pending
            </span>
            <span className="flex size-5 items-center justify-center rounded-full bg-brand-gradient text-white transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowUpRight className="size-3" strokeWidth={2} />
            </span>
          </Link>
        ) : null}
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={formatCurrency(data.revenue, true)}
          icon={DollarSign}
          trend={data.revenueTrend}
          sub="all orders to date"
          delay={0}
        />
        <KpiCard
          label="Orders"
          value={data.orderCount.toLocaleString()}
          icon={ShoppingCart}
          sub={`${formatCurrency(data.avgOrderValue)} avg value`}
          delay={60}
        />
        <KpiCard
          label="Customers"
          value={data.customerCount.toLocaleString()}
          icon={Users}
          sub="across all segments"
          delay={120}
        />
        <KpiCard
          label="Avg rating"
          value={data.avgRating.toFixed(2)}
          icon={Star}
          sub={`from ${data.reviewCount.toLocaleString()} reviews`}
          delay={180}
        />
      </div>

      {/* Revenue chart + status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueChart data={data} delay={220} />
        <StatusBreakdown data={data} delay={280} />
      </div>

      {/* Recent orders + top customers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentOrders data={data} delay={320} />
        <TopCustomers data={data} delay={360} />
      </div>
    </div>
  );
}
