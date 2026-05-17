import type { HTMLAttributes } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import { parsePhoneNumber } from "libphonenumber-js";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

/**
 * Displays an E.164 phone number as a formatted label, optionally wrapped in
 * a `tel:` link.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/phone-field/ PhoneField documentation}
 *
 * @example
 * import { Show, RecordField, PhoneField } from '@/components/admin';
 *
 * const CustomerShow = () => (
 *   <Show>
 *     <RecordField source="phone">
 *       <PhoneField source="phone" />
 *     </RecordField>
 *   </Show>
 * );
 */
export const PhoneField = <RecordType extends UnknownRecord = UnknownRecord>({
  defaultValue,
  source,
  record,
  empty,
  displayFormat = "national",
  link = true,
  className,
  ...rest
}: PhoneFieldProps<RecordType>) => {
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

  let formatted = String(value);
  let href = `tel:${value}`;
  try {
    const parsed = parsePhoneNumber(String(value));
    formatted =
      displayFormat === "international"
        ? parsed.formatInternational()
        : parsed.formatNational();
    href = parsed.getURI();
  } catch {
    // fall through: render raw
  }

  if (!link) {
    return (
      <span {...sanitizeFieldRestProps(rest)} className={className}>
        {formatted}
      </span>
    );
  }

  return (
    <a {...sanitizeFieldRestProps(rest)} href={href} className={className}>
      {formatted}
    </a>
  );
};

export interface PhoneFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends
    FieldProps<RecordType>,
    Omit<HTMLAttributes<HTMLAnchorElement>, "href"> {
  /** 'national' renders `(415) 555-2671`; 'international' renders `+1 415 555 2671`. */
  displayFormat?: "national" | "international";
  /** When false, renders a plain `<span>` instead of a `tel:` link. */
  link?: boolean;
}
