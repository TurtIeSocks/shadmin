/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Fragment, useState } from "react";
import { humanize, singularize } from "inflection";
import { RefreshCw } from "lucide-react";
import {
  type RaRecord,
  type UseUpdateControllerParams,
  useGetRecordRepresentation,
  useRecordContext,
  useResourceContext,
  useResourceTranslation,
  useTranslate,
  useUpdateController,
} from "ra-core";

import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/admin/confirm";

export interface UpdateWithUndoButtonProps<
  RecordType extends RaRecord = any,
  MutationOptionsError = unknown,
> extends Omit<
    UseUpdateControllerParams<RecordType, MutationOptionsError>,
    "mutationMode"
  > {
  className?: string;
  data: any;
  icon?: React.ReactNode;
  label?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export interface UpdateWithConfirmButtonProps<
  RecordType extends RaRecord = any,
  MutationOptionsError = unknown,
> extends UseUpdateControllerParams<RecordType, MutationOptionsError> {
  className?: string;
  confirmContent?: React.ReactNode;
  confirmTitle?: React.ReactNode;
  data: any;
  icon?: React.ReactNode;
  label?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  titleTranslateOptions?: object;
  contentTranslateOptions?: object;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export type UpdateButtonProps<
  RecordType extends RaRecord = any,
  MutationOptionsError = unknown,
> =
  | ({ mutationMode?: "undoable" } & UpdateWithUndoButtonProps<
      RecordType,
      MutationOptionsError
    >)
  | ({ mutationMode: "pessimistic" | "optimistic" } & UpdateWithConfirmButtonProps<
      RecordType,
      MutationOptionsError
    >);

/**
 * Updates the current record with a fixed data payload.
 *
 * Defaults to `mutationMode="undoable"`. When `mutationMode` is `pessimistic` or `optimistic`,
 * it shows a confirmation dialog before firing the mutation. Must be used inside a
 * `RecordContext` and `ResourceContext`.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/updatebutton/ UpdateButton documentation}
 *
 * @example
 * import { UpdateButton } from '@/components/admin';
 *
 * const ResetViewsButton = () => (
 *   <UpdateButton label="Reset Views" data={{ views: 0 }} />
 * );
 */
export const UpdateButton = (props: UpdateButtonProps) => {
  const { mutationMode = "undoable", ...rest } = props;
  return mutationMode === "undoable" ? (
    <UpdateWithUndoButton {...(rest as UpdateWithUndoButtonProps)} />
  ) : (
    <UpdateWithConfirmButton
      mutationMode={mutationMode}
      {...(rest as UpdateWithConfirmButtonProps)}
    />
  );
};

/**
 * Update button variant that asks the user to confirm before firing the mutation.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/updatebutton/ UpdateButton documentation}
 */
export const UpdateWithConfirmButton = (props: UpdateWithConfirmButtonProps) => {
  const {
    className,
    confirmTitle: confirmTitleProp,
    confirmContent: confirmContentProp,
    data,
    icon = defaultIcon,
    label: labelProp,
    mutationMode = "pessimistic",
    onClick,
    titleTranslateOptions = emptyObject,
    contentTranslateOptions = emptyObject,
    variant = "outline",
    ...rest
  } = props;
  const translate = useTranslate();
  const resource = useResourceContext(props);
  const record = useRecordContext(props);
  const [isOpen, setOpen] = useState(false);

  const { handleUpdate, isPending } = useUpdateController({
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

  const getRecordRepresentation = useGetRecordRepresentation(resource);
  let recordRepresentation = getRecordRepresentation(record);
  const resourceName = translate(`resources.${resource}.forcedCaseName`, {
    smart_count: 1,
    _: humanize(
      translate(`resources.${resource}.name`, {
        smart_count: 1,
        _: resource ? singularize(resource) : undefined,
      }),
      true,
    ),
  });
  if (React.isValidElement(recordRepresentation)) {
    recordRepresentation = `#${record?.id}`;
  }
  const label = useResourceTranslation({
    resourceI18nKey: `resources.${resource}.action.update`,
    baseI18nKey: "ra.action.update",
    options: {
      name: resourceName,
      recordRepresentation,
    },
    userText: labelProp,
  });
  const confirmTitle = useResourceTranslation({
    resourceI18nKey: `resources.${resource}.message.bulk_update_title`,
    baseI18nKey: "ra.message.bulk_update_title",
    options: {
      recordRepresentation,
      name: resourceName,
      id: record?.id,
      smart_count: 1,
      ...titleTranslateOptions,
    },
    userText: confirmTitleProp,
  });
  const confirmContent = useResourceTranslation({
    resourceI18nKey: `resources.${resource}.message.bulk_update_content`,
    baseI18nKey: "ra.message.bulk_update_content",
    options: {
      recordRepresentation,
      name: resourceName,
      id: record?.id,
      smart_count: 1,
      ...contentTranslateOptions,
    },
    userText: confirmContentProp,
  });

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
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </Fragment>
  );
};

/**
 * Update button variant that fires immediately with undo capability.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/updatebutton/ UpdateButton documentation}
 */
export const UpdateWithUndoButton = (props: UpdateWithUndoButtonProps) => {
  const {
    className,
    data,
    icon = defaultIcon,
    label: labelProp,
    onClick,
    variant = "outline",
    ...rest
  } = props;
  const record = useRecordContext(props);
  const resource = useResourceContext(props);
  const translate = useTranslate();
  const { handleUpdate, isPending } = useUpdateController({
    ...rest,
    mutationMode: "undoable",
  });

  const getRecordRepresentation = useGetRecordRepresentation(resource);
  let recordRepresentation = getRecordRepresentation(record);
  const resourceName = translate(`resources.${resource}.forcedCaseName`, {
    smart_count: 1,
    _: humanize(
      translate(`resources.${resource}.name`, {
        smart_count: 1,
        _: resource ? singularize(resource) : undefined,
      }),
      true,
    ),
  });
  if (React.isValidElement(recordRepresentation)) {
    recordRepresentation = `#${record?.id}`;
  }
  const label = useResourceTranslation({
    resourceI18nKey: `resources.${resource}.action.update`,
    baseI18nKey: "ra.action.update",
    options: {
      name: resourceName,
      recordRepresentation,
    },
    userText: labelProp,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!record) {
      throw new Error(
        "The UpdateWithUndoButton must be used inside a RecordContext.Provider or must be passed a record prop.",
      );
    }
    handleUpdate(data);
    if (typeof onClick === "function") {
      onClick(e);
    }
    e.stopPropagation();
  };

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
const emptyObject = {};
