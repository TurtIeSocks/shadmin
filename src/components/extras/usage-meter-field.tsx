import type { HTMLAttributes } from "react";
import {
  sanitizeFieldRestProps,
  useFieldValue,
  useRecordContext,
} from "ra-core";
import { Progress } from "@/components/ui/progress";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";
import { cn } from "@/lib/utils";

/**
 * Displays a numeric usage value relative to an optional limit, rendering a
 * progress bar that shifts color at configurable thresholds.
 *
 * Reads `source` for the used value and `limitSource` for the limit value from
 * the same record. When `limitSource` is omitted, renders only the bare value.
 *
 * @example
 * <UsageMeterField source="used" limitSource="limit" unit="GB" />
 */
export const UsageMeterField = <
  RecordType extends UnknownRecord = UnknownRecord,
>({
  defaultValue,
  source,
  record,
  limitSource,
  unit,
  thresholds = DEFAULT_THRESHOLDS,
  className,
  ...rest
}: UsageMeterFieldProps<RecordType>) => {
  const used = useFieldValue({ defaultValue, source, record }) as
    | number
    | null
    | undefined;
  const ctx = useRecordContext<RecordType>({ record });
  const limit =
    limitSource && ctx ? (ctx[limitSource] as number | undefined) : undefined;

  if (used == null) return null;

  if (limit == null) {
    return (
      <span
        {...sanitizeFieldRestProps(rest)}
        className={cn("text-sm tabular-nums", className)}
      >
        {used}
        {unit ? ` ${unit}` : ""}
      </span>
    );
  }

  const ratio = used / limit;
  const state =
    ratio >= thresholds.critical
      ? "critical"
      : ratio >= thresholds.warning
        ? "warning"
        : "ok";
  const pct = Math.min(100, Math.round(ratio * 100));

  return (
    <span
      {...sanitizeFieldRestProps(rest)}
      data-usage-meter
      data-state={state}
      className={cn("inline-flex flex-col gap-1", className)}
    >
      <Progress
        value={pct}
        className={cn(
          state === "warning" && "[&>div]:bg-yellow-500",
          state === "critical" && "[&>div]:bg-red-500",
        )}
      />
      <span className="text-xs tabular-nums text-muted-foreground">
        {used} / {limit}
        {unit ? ` ${unit}` : ""}
      </span>
    </span>
  );
};

const DEFAULT_THRESHOLDS = { warning: 0.8, critical: 1.0 };

export interface UsageMeterFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends
    FieldProps<RecordType>,
    Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Sibling record field holding the limit/quota. Bar is only shown when set. */
  limitSource?: string;
  /** Optional unit suffix (e.g. "GB", "requests"). */
  unit?: string;
  /** Ratio thresholds for warning + critical states. Defaults `{ warning: 0.8, critical: 1.0 }`. */
  thresholds?: { warning: number; critical: number };
}
