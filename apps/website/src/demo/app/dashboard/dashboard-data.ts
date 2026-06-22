import { useGetList, useGetMany } from "shadmin-core";

/** A monthly revenue bucket for the area chart. */
export interface RevenuePoint {
  month: string; // "Jan", "Feb", …
  key: string; // "2026-01" for stable ordering
  revenue: number;
  orders: number;
}

export interface RecentOrder {
  id: number | string;
  reference: string;
  date: string;
  total: number;
  status: string;
  customer: string;
}

export interface TopCustomer {
  id: number | string;
  name: string;
  totalSpent: number;
  orders: number;
}

export interface DashboardData {
  loading: boolean;
  revenue: number;
  revenueTrend: number | null; // % change, latest vs previous month
  orderCount: number;
  customerCount: number;
  avgOrderValue: number;
  avgRating: number;
  reviewCount: number;
  pendingReviews: number;
  statusBreakdown: { status: string; count: number }[];
  revenueSeries: RevenuePoint[];
  recentOrders: RecentOrder[];
  topCustomers: TopCustomer[];
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * 12 evenly-spaced buckets spanning the full [earliest, latest] order-date
 * range, so the curve is always populated regardless of how the seed clusters
 * dates. (A fixed "last 12 calendar months" window left most months empty when
 * the generated orders sit outside it.)
 */
function buildSeries(dated: { t: number; total: number }[]): RevenuePoint[] {
  if (dated.length === 0) return [];
  let min = dated[0].t;
  let max = dated[0].t;
  for (const d of dated) {
    if (d.t < min) min = d.t;
    if (d.t > max) max = d.t;
  }
  const span = Math.max(1, max - min);
  const N = 12;
  const points: RevenuePoint[] = Array.from({ length: N }, (_, i) => {
    const start = new Date(min + (span * i) / N);
    // Include the 2-digit year: buckets can be ~quarterly when the seed's
    // order dates span years, so bare month names would read non-sequentially.
    return {
      month: `${MONTH_LABELS[start.getMonth()]} '${String(start.getFullYear()).slice(2)}`,
      key: String(i),
      revenue: 0,
      orders: 0,
    };
  });
  for (const { t, total } of dated) {
    const idx = Math.min(
      N - 1,
      Math.max(0, Math.floor(((t - min) / span) * N)),
    );
    points[idx].revenue += total;
    points[idx].orders += 1;
  }
  return points;
}

interface OrderRecord {
  id: number | string;
  reference?: string;
  date?: string;
  total?: number;
  status?: string;
  customer_id?: number | string;
}

/**
 * Aggregates the demo's orders / reviews / customers into everything the
 * dashboard renders. All client-side over the fakerest provider — one generous
 * page per resource is plenty for the seed (~600 orders).
 */
export function useDashboardData(): DashboardData {
  const orders = useGetList<OrderRecord>("orders", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "date", order: "DESC" },
  });
  const reviews = useGetList("reviews", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "date", order: "DESC" },
  });
  const customersTop = useGetList("customers", {
    pagination: { page: 1, perPage: 5 },
    sort: { field: "total_spent", order: "DESC" },
  });
  const customersCount = useGetList("customers", {
    pagination: { page: 1, perPage: 1 },
    sort: { field: "id", order: "ASC" },
  });
  const pending = useGetList("reviews", {
    pagination: { page: 1, perPage: 1 },
    sort: { field: "date", order: "DESC" },
    filter: { status: "pending" },
  });

  const orderList = orders.data ?? [];

  // Recent orders + their customer names (resolved in one getMany).
  const recent = orderList.slice(0, 6);
  const recentIds = [...new Set(recent.map((o) => o.customer_id))].filter(
    (id): id is number | string => id != null,
  );
  const recentCustomers = useGetMany(
    "customers",
    { ids: recentIds },
    { enabled: recentIds.length > 0 },
  );
  const nameById = new Map(
    (recentCustomers.data ?? []).map((c) => [
      c.id,
      `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || `#${c.id}`,
    ]),
  );

  // Aggregate revenue + status; collect dated points for the chart.
  let revenue = 0;
  const statusCounts = new Map<string, number>();
  const dated: { t: number; total: number }[] = [];
  for (const o of orderList) {
    const total = Number(o.total) || 0;
    revenue += total;
    const status = o.status ?? "unknown";
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    if (o.date) {
      const t = new Date(o.date).getTime();
      if (Number.isFinite(t)) dated.push({ t, total });
    }
  }
  const series = buildSeries(dated);

  // Revenue trend: last bucket vs the previous one.
  const last = series.at(-1)?.revenue ?? 0;
  const prev = series.at(-2)?.revenue ?? 0;
  const revenueTrend = prev > 0 ? ((last - prev) / prev) * 100 : null;

  const reviewList = reviews.data ?? [];
  const avgRating =
    reviewList.length > 0
      ? reviewList.reduce((s, r) => s + (Number(r.rating) || 0), 0) /
        reviewList.length
      : 0;

  const orderCount = orders.total ?? orderList.length;

  const STATUS_ORDER = ["ordered", "delivered", "cancelled"];
  const statusBreakdown = STATUS_ORDER.filter((s) => statusCounts.has(s)).map(
    (status) => ({ status, count: statusCounts.get(status) ?? 0 }),
  );

  return {
    loading: orders.isPending || reviews.isPending,
    revenue,
    revenueTrend,
    orderCount,
    customerCount: customersCount.total ?? 0,
    avgOrderValue: orderCount > 0 ? revenue / orderCount : 0,
    avgRating,
    reviewCount: reviews.total ?? reviewList.length,
    pendingReviews: pending.total ?? 0,
    statusBreakdown,
    revenueSeries: series,
    recentOrders: recent.map((o) => ({
      id: o.id,
      reference: o.reference ?? `#${o.id}`,
      date: o.date ?? "",
      total: Number(o.total) || 0,
      status: o.status ?? "unknown",
      customer: nameById.get(o.customer_id as never) ?? "—",
    })),
    topCustomers: (customersTop.data ?? []).map((c) => ({
      id: c.id,
      name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || `#${c.id}`,
      totalSpent: Number(c.total_spent) || 0,
      orders: Number(c.nb_orders) || 0,
    })),
  };
}

/** USD currency, no cents for big numbers. */
export function formatCurrency(n: number, compact = false): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n);
}
