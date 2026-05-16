import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FieldProps } from "@/lib/field-types";
import type { UnknownRecord } from "@/lib/unknown-types";

type BadgeProps = ComponentProps<typeof Badge>;

/**
 * Renders an array of scalar values as a horizontal list of badges.
 *
 * Useful for displaying tags, genres, or any other array of short strings.
 * To be used with RecordField or DataTable.Col components, or anywhere a RecordContext is available.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/textarrayfield/ TextArrayField documentation}
 *
 * @example
 * // const post = { id: 123, genres: ['Fiction', 'Historical Fiction'] };
 * import { Show, RecordField, TextArrayField } from '@/components/admin';
 *
 * const PostShow = () => (
 *   <Show>
 *     <RecordField source="title" />
 *     <RecordField source="genres">
 *       <TextArrayField source="genres" />
 *     </RecordField>
 *   </Show>
 * );
 */
export const TextArrayField = <
  RecordType extends UnknownRecord = UnknownRecord,
>(
  props: TextArrayFieldProps<RecordType>,
) => {
  const {
    className,
    defaultValue,
    source,
    record,
    empty,
    variant = "outline",
    ...rest
  } = props;
  const data = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();

  const isEmpty = !Array.isArray(data) || data.length === 0;

  if (isEmpty) {
    if (!empty) {
      return null;
    }
    return (
      <span className={cn("text-muted-foreground", className)}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  return (
    <div
      className={cn("flex flex-wrap gap-1", className)}
      {...sanitizeFieldRestProps(rest)}
    >
      {(data as ReactNode[]).map((item, index) => (
        <Badge key={`${String(item)}-${index}`} variant={variant}>
          {item != null && typeof item !== "string" ? String(item) : item}
        </Badge>
      ))}
    </div>
  );
};

export interface TextArrayFieldProps<
  RecordType extends UnknownRecord = UnknownRecord,
>
  extends
    FieldProps<RecordType>,
    Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  variant?: BadgeProps["variant"];
}
