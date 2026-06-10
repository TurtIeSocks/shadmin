import {
  DollarSignIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { BarChart, DonutChart, MetricCard, TrendChart } from "@/components/extras";

export default { title: "Extras/DashboardCharts" };

const trendData = [
  { date: "2025-11", revenue: 8200 },
  { date: "2025-12", revenue: 9400 },
  { date: "2026-01", revenue: 7800 },
  { date: "2026-02", revenue: 11200 },
  { date: "2026-03", revenue: 10500 },
  { date: "2026-04", revenue: 13100 },
  { date: "2026-05", revenue: 12500 },
];

const barData = [
  { category: "Electronics", count: 42 },
  { category: "Clothing", count: 28 },
  { category: "Books", count: 17 },
  { category: "Food", count: 33 },
  { category: "Toys", count: 11 },
];

const donutData = [
  { label: "Open", value: 30 },
  { label: "Closed", value: 70 },
  { label: "Pending", value: 15 },
];

export const Basic = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <MetricCard
        label="Revenue"
        value={12500}
        delta={0.12}
        format={(v) => `$${v.toLocaleString()}`}
        icon={DollarSignIcon}
      />
      <MetricCard
        label="Orders"
        value={348}
        delta={-0.05}
        icon={ShoppingCartIcon}
      />
      <MetricCard
        label="Customers"
        value={1204}
        delta={0.08}
        icon={UsersIcon}
      />
      <MetricCard
        label="Growth"
        value="14.2%"
        delta={0}
        icon={TrendingUpIcon}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TrendChart
        data={trendData}
        xField="date"
        yField="revenue"
        title="Monthly Revenue"
        height={220}
        color="hsl(217 91% 60%)"
      />
      <BarChart
        data={barData}
        xField="category"
        yField="count"
        title="Orders by Category"
        height={220}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <DonutChart
        data={donutData}
        labelField="label"
        valueField="value"
        title="Ticket Status"
        height={220}
      />
    </div>
  </div>
);

export const Loading = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <MetricCard label="Revenue" value={0} loading />
      <MetricCard label="Orders" value={0} loading />
      <MetricCard label="Customers" value={0} loading />
      <MetricCard label="Growth" value={0} loading />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TrendChart
        data={[]}
        xField="date"
        yField="revenue"
        title="Monthly Revenue"
        height={220}
        loading
      />
      <BarChart
        data={[]}
        xField="category"
        yField="count"
        title="Orders by Category"
        height={220}
        loading
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <DonutChart
        data={[]}
        labelField="label"
        valueField="value"
        title="Ticket Status"
        height={220}
        loading
      />
    </div>
  </div>
);
