import {
  sanitizeFieldRestProps,
  useFieldValue,
  useTranslate,
} from "shadmin-core";
import { cn } from "@/lib/utils";
import type { JsonFieldProps } from "./internal/types";

/**
 * Lightweight read-only JSON formatter using `<pre>`.
 *
 * Use this for List cells or anywhere a Monaco editor would be overkill.
 * For Show/Edit detail contexts, prefer `<MonacoJsonField>` which renders
 * a syntax-highlighted Monaco viewer.
 *
 * Accepts both object and string values. String values are parsed when
 * possible and re-stringified with the configured indent. Unparseable
 * strings are rendered verbatim.
 */
function JsonField({
  defaultValue,
  source,
  record,
  empty,
  indent = 2,
  className,
  ...rest
}: JsonFieldProps) {
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();

  if (value == null) {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  let formatted: string;
  if (typeof value === "string") {
    try {
      formatted = JSON.stringify(JSON.parse(value), null, indent);
    } catch {
      formatted = value;
    }
  } else {
    try {
      formatted = JSON.stringify(value, null, indent);
    } catch {
      formatted = String(value);
    }
  }

  return (
    <pre
      {...sanitizeFieldRestProps(rest)}
      className={cn("font-mono text-sm whitespace-pre-wrap", className)}
    >
      {formatted}
    </pre>
  );
}

export { JsonField };
