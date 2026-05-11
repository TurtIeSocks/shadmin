import type { ReactNode } from "react";

import type { FieldProps } from "@/lib/field.type.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

/**
 * Wraps several fields, exposing layout-level props (like `label` and `source`)
 * to the parent component (e.g. `<SimpleShowLayout>`, `<DataTable>`).
 *
 * Useful when you need to render multiple fields together but still want the parent
 * to display a single label or sortable header.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/wrapperfield/ WrapperField documentation}
 *
 * @example
 * import { Show, SimpleShowLayout, WrapperField, TextField } from '@/components/admin';
 *
 * const PostShow = () => (
 *   <Show>
 *     <SimpleShowLayout>
 *       <WrapperField label="Author" source="last_name">
 *         <TextField source="first_name" />{' '}
 *         <TextField source="last_name" />
 *       </WrapperField>
 *     </SimpleShowLayout>
 *   </Show>
 * );
 */
export const WrapperField = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RecordType extends Record<string, any> = Record<string, any>,
>({
  children,
}: WrapperFieldProps<RecordType>) => <>{children}</>;

WrapperField.displayName = "WrapperField";

export interface WrapperFieldProps<RecordType extends AnyRecord = AnyRecord>
  extends Omit<FieldProps<RecordType>, "source"> {
  source?: FieldProps<RecordType>["source"];
  /**
   * The label to display in the parent layout (e.g. `<SimpleShowLayout>` or `<DataTable.Col>`).
   * Defaults to a humanized version of `source`.
   */
  label?: string | false;
  /**
   * The field to sort by when the wrapped fields are inside a sortable parent.
   */
  sortBy?: string;
  /**
   * The order of the sort when the wrapped fields are inside a sortable parent.
   */
  sortByOrder?: "ASC" | "DESC";
  children: ReactNode;
}
