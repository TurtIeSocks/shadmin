import { useMemo, type HTMLAttributes, type ReactNode } from "react";
import { useRecordContext } from "ra-core";

import { cn } from "@/lib/utils";
import type { FieldProps } from "@/lib/field-types";

/**
 * Field rendering its value with a custom render function.
 *
 * Useful for composing multiple record fields, or for displaying transformed data.
 * To be used with RecordField or DataTable.Col components, or anywhere a RecordContext is available.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/functionfield/ FunctionField documentation}
 *
 * @example
 * import { List, DataTable, FunctionField } from '@/components/admin';
 *
 * const UserList = () => (
 *   <List>
 *     <DataTable>
 *       <DataTable.Col label="Name">
 *         <FunctionField
 *           source="last_name"
 *           render={(record) => `${record.first_name} ${record.last_name}`}
 *         />
 *       </DataTable.Col>
 *     </DataTable>
 *   </List>
 * );
 */
export const FunctionField = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
>(
  props: FunctionFieldProps<RecordType>,
) => {
  const { className, source = "", render, record: recordProp, ...rest } = props;
  const record = useRecordContext<RecordType>({ record: recordProp });
  return useMemo(
    () =>
      record ? (
        <span className={cn(className)} {...rest}>
          {render(record, source)}
        </span>
      ) : null,
    [className, record, source, render, rest],
  );
};

export interface FunctionFieldProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
> extends Omit<FieldProps<RecordType>, "source">,
    Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  source?: string;
  render: (record: RecordType, source?: string) => ReactNode;
}
