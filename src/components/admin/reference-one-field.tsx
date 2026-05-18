import type { ReactNode } from "react";
import type {
  LinkToType,
  RaRecord,
  SortPayload,
  UseReferenceResult,
} from "ra-core";
import { ReferenceOneFieldBase, useTranslate } from "ra-core";
import type { UseQueryOptions } from "@tanstack/react-query";

import { ReferenceFieldView } from "./reference-field";
import type { UnknownRecord, UnknownValue } from "@/lib/unknown-types";
import type { FieldProps } from "@/lib/field-types";
import { Offline } from "@/components/admin/offline";

const defaultOffline = <Offline />;

/**
 * Displays a related record from a one-to-one relationship.
 *
 * Fetches the related record whose `target` field matches the current record's `id` (or `source`).
 * Renders the children inside a `RecordContext` populated with the referenced record.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/referenceonefield/ ReferenceOneField documentation}
 *
 * @example
 * import { Show, RecordField, ReferenceOneField, TextField } from '@/components/admin';
 *
 * const AuthorShow = () => (
 *   <Show>
 *     <RecordField source="name" />
 *     <RecordField label="Biography">
 *       <ReferenceOneField reference="bios" target="author_id">
 *         <TextField source="body" />
 *       </ReferenceOneField>
 *     </RecordField>
 *   </Show>
 * );
 */
export const ReferenceOneField = <
  RecordType extends RaRecord = RaRecord,
  ReferenceRecordType extends RaRecord = RaRecord,
>(
  props: ReferenceOneFieldProps<RecordType, ReferenceRecordType>,
) => {
  const {
    children,
    render,
    reference,
    source = "id",
    target,
    empty,
    loading,
    error,
    offline = defaultOffline,
    sort,
    filter,
    link,
    queryOptions,
    record,
  } = props;
  const translate = useTranslate();

  const resolvedEmpty =
    typeof empty === "string" ? (
      <span>{empty && translate(empty, { _: empty })}</span>
    ) : (
      (empty ?? null)
    );

  return (
    <ReferenceOneFieldBase<RecordType, ReferenceRecordType>
      reference={reference}
      target={target}
      source={source}
      sort={sort}
      filter={filter}
      record={record}
      queryOptions={queryOptions}
      empty={resolvedEmpty}
      loading={loading}
      error={error}
      offline={offline}
      link={link}
      render={render}
    >
      <ReferenceFieldView<ReferenceRecordType>
        reference={reference}
        source={source}
        loading={loading}
        error={error}
      >
        {children}
      </ReferenceFieldView>
    </ReferenceOneFieldBase>
  );
};

// disable sorting on this field by default as its default source prop ('id')
// will match the default sort ({ field: 'id', order: 'DESC' }),
// leading to an incorrect sort indicator in a data table header.
ReferenceOneField.sortable = false;

export interface ReferenceOneFieldProps<
  RecordType extends RaRecord = RaRecord,
  ReferenceRecordType extends RaRecord = RaRecord,
> extends Omit<FieldProps<RecordType>, "source" | "record"> {
  children?: ReactNode;
  render?: (props: UseReferenceResult<ReferenceRecordType>) => ReactNode;
  reference: string;
  target: string;
  source?: string;
  sort?: SortPayload;
  filter?: UnknownRecord;
  link?: LinkToType<ReferenceRecordType>;
  loading?: ReactNode;
  error?: ReactNode;
  /**
   * Component to display when offline and the request is pending or has stale placeholder data.
   */
  offline?: ReactNode;
  record?: RecordType;
  queryOptions?: Omit<
    UseQueryOptions<{
      data: ReferenceRecordType[];
      total: number;
    }>,
    "queryKey"
  > & { meta?: UnknownValue };
}
