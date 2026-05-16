import { WithListContext } from "ra-core";
import {
  BarChart,
  DonutChart,
  List,
  MetricCard,
  PivotGrid,
  TrendChart,
} from "@/components/admin";
import { DollarSignIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import type { Report } from "./reports-seed";

const currency = (v: number) => `$${v.toLocaleString()}`;

const QUARTER_ORDER: Report["quarter"][] = ["Q1", "Q2", "Q3", "Q4"];

const computeSummary = (data: Report[]) => {
  const totalRevenue = data.reduce((acc, r) => acc + r.revenue, 0);
  const totalCustomers = data.reduce((acc, r) => acc + r.customers, 0);

  const byQuarter = QUARTER_ORDER.map((quarter) => {
    const items = data.filter((r) => r.quarter === quarter);
    const revenue = items.reduce((acc, r) => acc + r.revenue, 0);
    return { quarter, revenue };
  }).filter((row) => row.revenue > 0);

  const byRegion = ["EU", "US", "APAC"].map((region) => {
    const items = data.filter((r) => r.region === region);
    return {
      region,
      revenue: items.reduce((acc, r) => acc + r.revenue, 0),
    };
  }).filter((row) => row.revenue > 0);

  const customerSplit = ["EU", "US", "APAC"].map((region) => {
    const items = data.filter((r) => r.region === region);
    return {
      region,
      customers: items.reduce((acc, r) => acc + r.customers, 0),
    };
  }).filter((row) => row.customers > 0);

  return { totalRevenue, totalCustomers, byQuarter, byRegion, customerSplit };
};

export const AnalyticsList = () => (
  <List perPage={50} pagination={false} actions={false}>
    <WithListContext<Report>
      render={({ data, isPending }) => {
        const rows = data ?? [];
        const summary = computeSummary(rows);
        return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard
                label="Total Revenue"
                value={summary.totalRevenue}
                format={currency}
                icon={DollarSignIcon}
                loading={isPending}
              />
              <MetricCard
                label="Total Customers"
                value={summary.totalCustomers}
                icon={UsersIcon}
                loading={isPending}
              />
              <MetricCard
                label="Reports"
                value={rows.length}
                icon={TrendingUpIcon}
                loading={isPending}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TrendChart
                data={summary.byQuarter}
                xField="quarter"
                yField="revenue"
                title="Revenue by Quarter"
                height={220}
                loading={isPending}
              />
              <BarChart
                data={summary.byRegion}
                xField="region"
                yField="revenue"
                title="Revenue by Region"
                height={220}
                loading={isPending}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DonutChart
                data={summary.customerSplit}
                labelField="region"
                valueField="customers"
                title="Customers by Region"
                height={220}
                loading={isPending}
              />
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">
                  Revenue Pivot (region x quarter)
                </h3>
                <PivotGrid
                  rowField="region"
                  columnField="quarter"
                  valueField="revenue"
                  aggregator="sum"
                  formatter={currency}
                />
              </div>
            </div>
          </div>
        );
      }}
    />
  </List>
);
