import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import { formatDuration } from "date-fns";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";
import { compactDuration, parseIsoDuration } from "./duration-utils";

interface DurationFieldProps<RecordType extends UnknownRecord = UnknownRecord>
  extends FieldProps<RecordType>,
    HTMLAttributes<HTMLSpanElement> {
  /** 'compact' renders `2h 30m`; 'relative' renders `2 hours 30 minutes`. */
  displayFormat?: "compact" | "relative";
}

/**
 * Displays an ISO-8601 duration string as a compact ("2h 30m") or relative
 * ("2 hours 30 minutes") human-readable value.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/duration-field DurationField documentation}
 *
 * @example
 * import { DurationField } from '@/components/admin';
 *
 * <DurationField source="duration" />
 * <DurationField source="duration" displayFormat="relative" />
 * <DurationField source="duration" empty="—" />
 */
function DurationField<RecordType extends UnknownRecord = UnknownRecord>({
  defaultValue,
  source,
  record,
  empty,
  displayFormat = "compact",
  className,
  ...rest
}: DurationFieldProps<RecordType>) {
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

  const parsed = parseIsoDuration(String(value));
  if (!parsed) return null;

  const text =
    displayFormat === "relative"
      ? formatDuration(parsed)
      : compactDuration(parsed);

  return (
    <span {...sanitizeFieldRestProps(rest)} className={className}>
      {text}
    </span>
  );
}

export { DurationField, type DurationFieldProps };
