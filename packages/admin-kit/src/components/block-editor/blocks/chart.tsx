import { z } from "zod";
import { BarChart3 } from "lucide-react";
import { useGetList, type RaRecord } from "ra-core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  defineBlock,
  type BlockRenderProps,
  type BlockConfigProps,
} from "../define-block";
import { BlockEmpty, BlockSkeleton, BlockError } from "./block-states";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  resource: z.string().default(""),
  type: z.enum(["bar", "line", "pie"]).default("bar"),
  category: z.string().default(""),
  value: z.string().default(""),
  aggregate: z.enum(["count", "sum", "avg"]).default("count"),
  perPage: z.number().default(100),
});
type ChartAttrs = z.infer<typeof schema>;

interface Datum {
  name: string;
  value: number;
}

/** Group rows by `category` and reduce `value` by the aggregate. Stable key order. */
export function aggregate(
  rows: Array<Record<string, unknown>>,
  category: string,
  value: string,
  agg: ChartAttrs["aggregate"],
): Datum[] {
  const order: string[] = [];
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = String(row[category] ?? "—");
    if (!counts.has(key)) {
      order.push(key);
      counts.set(key, 0);
      sums.set(key, 0);
    }
    counts.set(key, counts.get(key)! + 1);
    sums.set(key, sums.get(key)! + (Number(row[value]) || 0));
  }
  return order.map((name) => {
    const count = counts.get(name)!;
    const sum = sums.get(name)!;
    const v =
      agg === "count" ? count : agg === "sum" ? sum : count ? sum / count : 0;
    return { name, value: v };
  });
}

function ChartRender({ attrs }: BlockRenderProps<ChartAttrs>) {
  const enabled = Boolean(attrs.resource && attrs.category);
  const { data, isPending, error } = useGetList(
    attrs.resource,
    { pagination: { page: 1, perPage: attrs.perPage ?? 100 } },
    { enabled },
  );

  if (!enabled) return <BlockEmpty label="Pick a resource and category to chart" />;
  if (isPending) return <BlockSkeleton />;
  if (error) return <BlockError label="Chart data unavailable" />;

  const rows: RaRecord[] = data ?? [];
  const points = aggregate(
    rows as Array<Record<string, unknown>>,
    attrs.category,
    attrs.value,
    attrs.aggregate,
  );

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {attrs.type === "line" ? (
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="var(--primary)" />
          </LineChart>
        ) : attrs.type === "pie" ? (
          <PieChart>
            <Tooltip />
            <Pie
              data={points}
              dataKey="value"
              nameKey="name"
              fill="var(--primary)"
              label
            />
          </PieChart>
        ) : (
          <BarChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="var(--primary)" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function ChartConfig({ attrs, onChange }: BlockConfigProps<ChartAttrs>) {
  return (
    <div className="flex w-56 flex-col gap-2 p-1">
      <Label className="text-xs">Resource</Label>
      <Input
        value={attrs.resource}
        onChange={(e) => onChange({ resource: e.target.value })}
      />
      <Label className="text-xs">Type</Label>
      <Select
        value={attrs.type}
        onValueChange={(v) => onChange({ type: v as ChartAttrs["type"] })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bar">Bar</SelectItem>
          <SelectItem value="line">Line</SelectItem>
          <SelectItem value="pie">Pie</SelectItem>
        </SelectContent>
      </Select>
      <Label className="text-xs">Category field (x)</Label>
      <Input
        value={attrs.category}
        onChange={(e) => onChange({ category: e.target.value })}
      />
      <Label className="text-xs">Value field (y)</Label>
      <Input
        value={attrs.value}
        onChange={(e) => onChange({ value: e.target.value })}
      />
      <Label className="text-xs">Aggregate</Label>
      <Select
        value={attrs.aggregate}
        onValueChange={(v) =>
          onChange({ aggregate: v as ChartAttrs["aggregate"] })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="count">Count</SelectItem>
          <SelectItem value="sum">Sum</SelectItem>
          <SelectItem value="avg">Average</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const chartBlock = defineBlock<ChartAttrs>({
  name: "chart",
  label: "Chart",
  group: "data",
  icon: BarChart3,
  keywords: ["chart", "graph", "bar", "line", "pie", "analytics"],
  description: "Aggregate a resource into a chart",
  schema,
  config: ChartConfig,
  render: ChartRender,
});
