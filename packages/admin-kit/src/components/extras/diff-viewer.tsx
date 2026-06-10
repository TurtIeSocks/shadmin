"use client";

import { type ReactNode, useMemo } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useTranslate } from "ra-core";
import { cn } from "@/lib/utils";

type DiffStatus = "unchanged" | "added" | "removed" | "changed";

type DiffMode = "inline" | "side-by-side";

interface DiffViewerProps {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  fields?: string[];
  labels?: Record<string, string>;
  formatters?: Record<string, (value: unknown) => ReactNode>;
  mode?: DiffMode;
}

const EMPTY_LABELS: Record<string, string> = {};
const EMPTY_FORMATTERS: Record<string, (value: unknown) => ReactNode> = {};

const isMissing = (v: unknown) => v === undefined || v === null;

const computeStatus = (before: unknown, after: unknown): DiffStatus => {
  const beforeMissing = isMissing(before);
  const afterMissing = isMissing(after);
  if (beforeMissing && afterMissing) return "unchanged";
  if (beforeMissing && !afterMissing) return "added";
  if (!beforeMissing && afterMissing) return "removed";
  // Both present
  if (before === after) return "unchanged";
  try {
    if (JSON.stringify(before) === JSON.stringify(after)) return "unchanged";
  } catch {
    /* ignore */
  }
  return "changed";
};

const statusClasses: Record<DiffStatus, string> = {
  unchanged: "",
  added: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  removed: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  changed: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const formatValue = (v: unknown): ReactNode => {
  if (v === undefined || v === null)
    return <span className="text-muted-foreground">—</span>;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

function DiffViewer({
  before,
  after,
  fields,
  labels = EMPTY_LABELS,
  formatters = EMPTY_FORMATTERS,
  mode = "side-by-side",
}: DiffViewerProps) {
  const translate = useTranslate();
  const allFields = useMemo(() => {
    if (fields) return fields;
    return Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  }, [fields, before, after]);

  const rows = allFields.map((field) => {
    const beforeVal = before[field];
    const afterVal = after[field];
    const status = computeStatus(beforeVal, afterVal);
    const formatter = formatters[field] ?? formatValue;
    return {
      field,
      label: labels[field] ?? field,
      status,
      beforeRendered: formatter(beforeVal),
      afterRendered: formatter(afterVal),
    };
  });

  if (mode === "side-by-side") {
    return (
      <div
        className="overflow-hidden rounded-md border"
        data-slot="diff-viewer"
        data-mode="side-by-side"
      >
        <div className="grid grid-cols-[minmax(8rem,1fr)_minmax(0,2fr)_auto_minmax(0,2fr)] gap-x-3 border-b bg-muted/40 p-2 text-xs font-medium text-muted-foreground">
          <div>{translate("ra.diff_viewer.field", { _: "Field" })}</div>
          <div>{translate("ra.diff_viewer.before", { _: "Before" })}</div>
          <div></div>
          <div>{translate("ra.diff_viewer.after", { _: "After" })}</div>
        </div>
        {rows.map((row) => (
          <div
            key={row.field}
            data-field={row.field}
            data-status={row.status}
            className="grid grid-cols-[minmax(8rem,1fr)_minmax(0,2fr)_auto_minmax(0,2fr)] items-center gap-x-3 border-b p-2 text-sm last:border-b-0"
          >
            <div className="font-medium">{row.label}</div>
            <div
              className={cn(
                "rounded-sm px-2 py-1",
                statusClasses[
                  row.status === "added" ? "unchanged" : row.status
                ],
              )}
            >
              {row.beforeRendered}
            </div>
            <ArrowRightIcon className="size-3 text-muted-foreground" />
            <div
              className={cn(
                "rounded-sm px-2 py-1",
                statusClasses[
                  row.status === "removed" ? "unchanged" : row.status
                ],
              )}
            >
              {row.afterRendered}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // inline mode
  return (
    <div
      className="flex flex-col gap-1 rounded-md border p-3 text-sm"
      data-slot="diff-viewer"
      data-mode="inline"
    >
      {rows.map((row) => (
        <div
          key={row.field}
          data-field={row.field}
          data-status={row.status}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="font-medium">{row.label}:</span>
          {row.status === "added" ? (
            <span
              className={cn("rounded-sm px-1.5 underline", statusClasses.added)}
            >
              {row.afterRendered}
            </span>
          ) : row.status === "removed" ? (
            <span
              className={cn(
                "rounded-sm px-1.5 line-through",
                statusClasses.removed,
              )}
            >
              {row.beforeRendered}
            </span>
          ) : row.status === "changed" ? (
            <>
              <span
                className={cn(
                  "rounded-sm px-1.5 line-through",
                  statusClasses.removed,
                )}
              >
                {row.beforeRendered}
              </span>
              <ArrowRightIcon className="size-3 text-muted-foreground" />
              <span
                className={cn(
                  "rounded-sm px-1.5 underline",
                  statusClasses.added,
                )}
              >
                {row.afterRendered}
              </span>
            </>
          ) : (
            <span>{row.afterRendered}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export { DiffViewer, type DiffStatus, type DiffMode, type DiffViewerProps };
