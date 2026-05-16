import type { HTMLAttributes } from "react";
import {
  sanitizeFieldRestProps,
  useFieldValue,
  useTranslate,
} from "ra-core";
import { formatDuration } from "date-fns";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

/**
 * Displays an ISO-8601 duration string as a compact ("2h 30m") or relative
 * ("2 hours 30 minutes") human-readable value.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/durationfield/ DurationField documentation}
 *
 * @example
 * import { DurationField } from '@/components/admin';
 *
 * <DurationField source="duration" />
 * <DurationField source="duration" displayFormat="relative" />
 * <DurationField source="duration" empty="—" />
 */
export const DurationField = <RecordType extends UnknownRecord = UnknownRecord>({
  defaultValue,
  source,
  record,
  empty,
  displayFormat = "compact",
  className,
  ...rest
}: DurationFieldProps<RecordType>) => {
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
      : compactFormat(parsed);

  return (
    <span {...sanitizeFieldRestProps(rest)} className={className}>
      {text}
    </span>
  );
};

const ISO_RE =
  /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

export function parseIsoDuration(s: string): null | {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
} {
  const m = s.match(ISO_RE);
  if (!m) return null;
  const [, d, h, mn, sc] = m;
  const out: Record<string, number> = {};
  if (d) out.days = +d;
  if (h) out.hours = +h;
  if (mn) out.minutes = +mn;
  if (sc) out.seconds = +sc;
  return out as never;
}

function compactFormat(p: {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}): string {
  const parts: string[] = [];
  if (p.days) parts.push(`${p.days}d`);
  if (p.hours) parts.push(`${p.hours}h`);
  if (p.minutes) parts.push(`${p.minutes}m`);
  if (p.seconds) parts.push(`${p.seconds}s`);
  return parts.join(" ") || "0m";
}

export interface DurationFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends FieldProps<RecordType>,
    HTMLAttributes<HTMLSpanElement> {
  /** 'compact' renders `2h 30m`; 'relative' renders `2 hours 30 minutes`. */
  displayFormat?: "compact" | "relative";
}
