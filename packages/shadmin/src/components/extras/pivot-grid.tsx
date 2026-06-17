"use client";

import { type ReactNode, useMemo } from "react";
import { useListContext, useTranslate } from "shadmin-core";
import { cn } from "@/lib/utils";

type PivotAggregator = "count" | "sum" | "avg" | "min" | "max";

interface PivotGridProps {
  data?: Array<Record<string, unknown>>;
  rowField: string;
  columnField: string;
  valueField?: string;
  aggregator?: PivotAggregator;
  formatter?: (value: number) => ReactNode;
  emptyLabel?: string;
}

interface PivotBucket {
  values: number[];
}

const aggregate = (
  bucket: PivotBucket,
  aggregator: PivotAggregator,
): number => {
  const { values } = bucket;
  if (values.length === 0) return 0;
  switch (aggregator) {
    case "count":
      return values.length;
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
  }
};

const collect = (
  rows: Array<Record<string, unknown>>,
  rowField: string,
  columnField: string,
  valueField: string | undefined,
) => {
  const grid: Record<string, Record<string, PivotBucket>> = {};
  const rowKeys = new Set<string>();
  const colKeys = new Set<string>();
  for (const r of rows) {
    const rowKey = String(r[rowField] ?? "—");
    const colKey = String(r[columnField] ?? "—");
    rowKeys.add(rowKey);
    colKeys.add(colKey);
    grid[rowKey] ??= {};
    grid[rowKey][colKey] ??= { values: [] };
    if (valueField) {
      const v = Number(r[valueField]);
      if (!Number.isNaN(v)) grid[rowKey][colKey].values.push(v);
    } else {
      grid[rowKey][colKey].values.push(1);
    }
  }
  return {
    grid,
    rowKeys: Array.from(rowKeys).sort(),
    colKeys: Array.from(colKeys).sort(),
  };
};

const useListData = () => {
  const ctx = useListContext();
  return ctx?.data;
};

const PivotGrid = ({
  data: dataProp,
  rowField,
  columnField,
  valueField,
  aggregator = "count",
  formatter = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2)),
  emptyLabel,
}: PivotGridProps) => {
  const translate = useTranslate();
  const listData = useListData();
  const data = useMemo(() => dataProp ?? listData ?? [], [dataProp, listData]);

  const { grid, rowKeys, colKeys } = useMemo(
    () => collect(data, rowField, columnField, valueField),
    [data, rowField, columnField, valueField],
  );

  if (rowKeys.length === 0 || colKeys.length === 0) {
    return (
      <div
        className="rounded-md border p-4 text-center text-sm text-muted-foreground"
        data-slot="pivot-grid-empty"
      >
        {emptyLabel ?? translate("ra.pivot_grid.empty", { _: "No data" })}
      </div>
    );
  }

  // Compute totals
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let grandTotal = 0;
  for (const r of rowKeys) {
    for (const c of colKeys) {
      const bucket = grid[r]?.[c] ?? { values: [] };
      const v = aggregate(bucket, aggregator);
      rowTotals[r] = (rowTotals[r] ?? 0) + v;
      colTotals[c] = (colTotals[c] ?? 0) + v;
      grandTotal += v;
    }
  }

  return (
    <div className="overflow-auto rounded-md border" data-slot="pivot-grid">
      <table className={cn("w-full text-sm")}>
        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left font-medium">{rowField}</th>
            {colKeys.map((c) => (
              <th key={c} className="p-2 text-right font-medium" data-col={c}>
                {c}
              </th>
            ))}
            <th className="p-2 text-right font-medium" data-col="__total">
              {translate("ra.pivot_grid.total", { _: "Total" })}
            </th>
          </tr>
        </thead>
        <tbody>
          {rowKeys.map((r) => (
            <tr key={r} className="border-t" data-row={r}>
              <td className="p-2 font-medium">{r}</td>
              {colKeys.map((c) => {
                const bucket = grid[r]?.[c] ?? { values: [] };
                const v = aggregate(bucket, aggregator);
                return (
                  <td
                    key={c}
                    className="p-2 text-right font-mono"
                    data-cell={`${r}::${c}`}
                  >
                    {bucket.values.length === 0 ? "—" : formatter(v)}
                  </td>
                );
              })}
              <td
                className="p-2 text-right font-mono font-semibold"
                data-cell={`${r}::__total`}
              >
                {formatter(rowTotals[r])}
              </td>
            </tr>
          ))}
          <tr className="border-t bg-muted/30">
            <td className="p-2 font-semibold">
              {translate("ra.pivot_grid.total", { _: "Total" })}
            </td>
            {colKeys.map((c) => (
              <td
                key={c}
                className="p-2 text-right font-mono font-semibold"
                data-cell={`__total::${c}`}
              >
                {formatter(colTotals[c])}
              </td>
            ))}
            <td
              className="p-2 text-right font-mono font-bold"
              data-cell="grand-total"
            >
              {formatter(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export { type PivotAggregator, type PivotGridProps, PivotGrid };
