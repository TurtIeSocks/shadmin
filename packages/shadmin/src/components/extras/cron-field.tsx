import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";
import { describeCron } from "./cron-utils";
import { cn } from "@/lib/utils";

interface CronFieldProps<RecordType extends UnknownRecord = UnknownRecord>
  extends FieldProps<RecordType>,
    HTMLAttributes<HTMLSpanElement> {
  /** When true, render the raw cron expression below the human phrase. */
  showExpression?: boolean;
}

/**
 * Displays a 5-field cron expression as a human-readable phrase
 * (via `cronstrue`). Falls back to the raw string on parse failure.
 *
 * @example
 * <CronField source="schedule" />
 * <CronField source="schedule" showExpression />
 */
function CronField<RecordType extends UnknownRecord = UnknownRecord>({
  defaultValue,
  source,
  record,
  empty,
  showExpression = false,
  className,
  ...rest
}: CronFieldProps<RecordType>) {
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();

  if (value == null || value === "") {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  const expr = String(value);
  const phrase = describeCron(expr);

  if (!phrase) {
    return (
      <span
        {...sanitizeFieldRestProps(rest)}
        className={cn("font-mono text-sm text-muted-foreground", className)}
      >
        {expr}
      </span>
    );
  }

  return (
    <span
      {...sanitizeFieldRestProps(rest)}
      className={cn("inline-flex flex-col", className)}
    >
      <span className="text-sm">{phrase}</span>
      {showExpression && (
        <span className="font-mono text-xs text-muted-foreground">{expr}</span>
      )}
    </span>
  );
}

export { CronField, type CronFieldProps };
