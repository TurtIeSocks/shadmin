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
