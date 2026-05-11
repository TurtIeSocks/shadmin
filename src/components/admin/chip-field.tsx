import { genericMemo, useFieldValue, useTranslate } from "ra-core";
import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FieldProps } from "@/lib/field-types";

type BadgeProps = ComponentProps<typeof Badge>;

const ChipFieldImpl = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
>(
  inProps: ChipFieldProps<RecordType>,
) => {
  const {
    className,
    empty,
    defaultValue,
    source,
    record,
    variant = "outline",
    ...rest
  } = inProps;
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();

  if (value == null || value === "") {
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
    <Badge variant={variant} className={cn(className)} {...rest}>
      {typeof value !== "string" ? value.toString() : value}
    </Badge>
  );
};
ChipFieldImpl.displayName = "ChipFieldImpl";

/**
 * Displays a value inside a styled badge component, similar to a Material UI Chip.
 *
 * Useful for highlighting status values, tags, or categorical information.
 * To be used with RecordField or DataTable.Col components, or anywhere a RecordContext is available.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/chipfield/ ChipField documentation}
 *
 * @example
 * import { List, DataTable, ChipField } from '@/components/admin';
 *
 * const PostList = () => (
 *   <List>
 *     <DataTable>
 *       <DataTable.Col source="title" />
 *       <DataTable.Col>
 *         <ChipField source="category" />
 *       </DataTable.Col>
 *     </DataTable>
 *   </List>
 * );
 */
export const ChipField = genericMemo(ChipFieldImpl);

export interface ChipFieldProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
> extends FieldProps<RecordType>, Omit<BadgeProps, "children"> {
  variant?: "default" | "outline" | "secondary" | "destructive";
}
