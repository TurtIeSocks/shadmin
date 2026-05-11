import * as React from "react";
import { Fragment, useState } from "react";
import { humanize, inflect } from "inflection";
import { RefreshCw } from "lucide-react";
import {
  type MutationMode,
  type RaRecord,
  type UseBulkUpdateControllerParams,
  useBulkUpdateController,
  useListContext,
  useResourceContext,
  useResourceTranslation,
  useTranslate,
} from "ra-core";

import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/admin/confirm";
import type { UnknownValue } from "@/lib/unknown-types";

export interface BulkUpdateWithUndoButtonProps<
  RecordType extends RaRecord = RaRecord,
  MutationOptionsError = UnknownValue,
> extends Omit<
    UseBulkUpdateControllerParams<RecordType, MutationOptionsError>,
    "mutationMode"
  > {
  className?: string;
  data: Partial<RecordType>;
  icon?: React.ReactNode;
  label?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export interface BulkUpdateWithConfirmButtonProps<
  RecordType extends RaRecord = RaRecord,
  MutationOptionsError = UnknownValue,
> extends UseBulkUpdateControllerParams<RecordType, MutationOptionsError> {
  className?: string;
  confirmContent?: React.ReactNode;
  confirmTitle?: React.ReactNode;
  data: Partial<RecordType>;
  icon?: React.ReactNode;
  label?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export type BulkUpdateButtonProps<
  RecordType extends RaRecord = RaRecord,
  MutationOptionsError = UnknownValue,
> = { mutationMode?: MutationMode } & (
  | BulkUpdateWithUndoButtonProps<RecordType, MutationOptionsError>
  | BulkUpdateWithConfirmButtonProps<RecordType, MutationOptionsError>
);

/**
 * Updates the selected records with a fixed data payload.
 *
 * Defaults to `mutationMode="undoable"`. When `mutationMode` is `pessimistic` or `optimistic`,
 * a confirmation dialog is shown before the mutation fires. Must be used inside a
 * `ListContext` (e.g., inside a `<DataTable bulkActionsButtons>`).
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/bulkupdatebutton/ BulkUpdateButton documentation}
 *
 * @example
 * import { BulkUpdateButton, DataTable, List } from '@/components/admin';
 *
 * const ResetViewsButton = () => (
 *   <BulkUpdateButton label="Reset Views" data={{ views: 0 }} />
 * );
 *
 * export const PostList = () => (
 *   <List>
 *     <DataTable bulkActionsButtons={<ResetViewsButton />}>
 *       ...
 *     </DataTable>
 *   </List>
 * );
 */
export const BulkUpdateButton = (props: BulkUpdateButtonProps) => {
  const { mutationMode = "undoable", ...rest } = props;
  return mutationMode === "undoable" ? (
    <BulkUpdateWithUndoButton {...(rest as BulkUpdateWithUndoButtonProps)} />
  ) : (
    <BulkUpdateWithConfirmButton
      mutationMode={mutationMode}
      {...(rest as BulkUpdateWithConfirmButtonProps)}
    />
  );
};

/**
 * Bulk update button variant that asks the user to confirm before firing the mutation.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/bulkupdatebutton/ BulkUpdateButton documentation}
 */
export const BulkUpdateWithConfirmButton = (
  props: BulkUpdateWithConfirmButtonProps,
) => {
  const {
    className,
    confirmTitle = "ra.message.bulk_update_title",
    confirmContent = "ra.message.bulk_update_content",
    data,
    icon = defaultIcon,
    label: labelProp,
    mutationMode = "pessimistic",
    onClick,
    variant = "outline",
    ...rest
  } = props;
  const translate = useTranslate();
  const resource = useResourceContext(props);
  const [isOpen, setOpen] = useState(false);
  const { selectedIds } = useListContext();

  const { handleUpdate, isPending } = useBulkUpdateController({
    ...rest,
    mutationMode,
    mutationOptions: {
      ...rest.mutationOptions,
      onSettled: (...args) => {
        if (mutationMode === "pessimistic") {
          setOpen(false);
        }
        rest.mutationOptions?.onSettled?.(...args);
      },
    },
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (mutationMode !== "pessimistic") {
      setOpen(false);
    }
    handleUpdate(data);
    if (typeof onClick === "function") {
      onClick(e);
    }
  };

  const label = useResourceTranslation({
    resourceI18nKey: resource
      ? `resources.${resource}.action.update`
      : undefined,
    baseI18nKey: "ra.action.update",
    userText: labelProp,
  });

  const nameOptions = {
    smart_count: selectedIds.length,
    name: translate(`resources.${resource}.forcedCaseName`, {
      smart_count: selectedIds.length,
      _: humanize(
        translate(`resources.${resource}.name`, {
          smart_count: selectedIds.length,
          _: resource ? inflect(resource, selectedIds.length) : undefined,
        }),
        true,
      ),
    }),
  };

  return (
    <Fragment>
      <Button
        type="button"
        variant={variant}
        onClick={handleClick}
        disabled={isPending}
        aria-label={typeof label === "string" ? label : undefined}
        className={className}
      >
        {icon}
        {label}
      </Button>
      <Confirm
        isOpen={isOpen}
        loading={isPending}
        title={confirmTitle}
        content={confirmContent}
        titleTranslateOptions={nameOptions}
        contentTranslateOptions={nameOptions}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </Fragment>
  );
};

/**
 * Bulk update button variant that fires immediately with undo capability.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/bulkupdatebutton/ BulkUpdateButton documentation}
 */
export const BulkUpdateWithUndoButton = (
  props: BulkUpdateWithUndoButtonProps,
) => {
  const {
    className,
    data,
    icon = defaultIcon,
    label: labelProp,
    onClick,
    variant = "outline",
    ...rest
  } = props;
  const resource = useResourceContext(props);
  const { handleUpdate, isPending } = useBulkUpdateController({
    ...rest,
    mutationMode: "undoable",
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleUpdate(data);
    if (typeof onClick === "function") {
      onClick(e);
    }
  };

  const label = useResourceTranslation({
    resourceI18nKey: resource
      ? `resources.${resource}.action.update`
      : undefined,
    baseI18nKey: "ra.action.update",
    userText: labelProp,
  });

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleClick}
      disabled={isPending}
      aria-label={typeof label === "string" ? label : undefined}
      className={className}
    >
      {icon}
      {label}
    </Button>
  );
};

const defaultIcon = <RefreshCw />;
