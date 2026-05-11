import type { MouseEvent } from "react";
import type { RaRecord, UseGetListOptions } from "ra-core";
import { Translate, useListContext } from "ra-core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A button that selects all records (up to a limit) for the current list.
 *
 * Uses ListContext.getData when available to select across all pages,
 * falling back to onSelectAll otherwise.
 *
 * To be used inside the <DataTable bulkActionsButtons> prop or in BulkActionsToolbar.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/selectallbutton/ SelectAllButton documentation}
 *
 * @example
 * import { BulkActionsToolbar, BulkDeleteButton, SelectAllButton } from '@/components/admin';
 *
 * const PostBulkActionsToolbar = () => (
 *   <BulkActionsToolbar>
 *     <SelectAllButton />
 *     <BulkDeleteButton />
 *   </BulkActionsToolbar>
 * );
 */
export const SelectAllButton = <RecordType extends RaRecord = RaRecord>({
  label = "ra.action.select_all",
  limit = 250,
  queryOptions,
  className,
  onClick,
  ...props
}: SelectAllButtonProps<RecordType>) => {
  const listContext = useListContext<RecordType>();
  const { getData, onSelect, onSelectAll, selectedIds, total } = listContext;
  const data: RecordType[] | undefined = listContext.data;

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (getData) {
      const records = await getData({
        maxResults: limit,
        meta: queryOptions?.meta,
      });
      onSelect(records?.map((record) => record.id) ?? []);
    } else {
      onSelectAll({ limit, queryOptions });
    }
    onClick?.(event);
  };

  // Hide the button when:
  // - there are no records to select
  // - everything is already selected (total === selectedIds.length, or
  //   if total is unknown, all currently loaded data is selected)
  // - we've hit the selection cap
  const dataLength = data?.length ?? 0;
  const hasRecords = dataLength > 0 || (total ?? 0) > 0;
  const allSelected =
    total != null
      ? selectedIds.length >= total
      : data != null && data.length > 0
        ? data.every((item) => selectedIds.includes(item.id))
        : true;

  if (!hasRecords || allSelected || selectedIds.length >= limit) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-9", className)}
      onClick={handleClick}
      {...props}
    >
      <Translate i18nKey={label}>{label}</Translate>
    </Button>
  );
};

export type SelectAllButtonProps<RecordType extends RaRecord = RaRecord> = {
  label?: string;
  limit?: number;
  queryOptions?: UseGetListOptions<RecordType>;
} & React.ComponentPropsWithoutRef<"button">;
