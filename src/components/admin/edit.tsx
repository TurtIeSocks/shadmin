import type { EditBaseProps } from "ra-core";
import {
  EditBase,
  Translate,
  useCreatePath,
  useEditContext,
  useGetRecordRepresentation,
  useGetResourceLabel,
  useHasDashboard,
  useResourceContext,
  useResourceDefinition,
} from "ra-core";
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/admin/breadcrumb";
import { cn } from "@/lib/utils";
import { ShowButton } from "@/components/admin/show-button";
import { DeleteButton } from "./delete-button";

export interface EditProps extends EditViewProps, EditBaseProps {}

/**
 * A complete edit page with breadcrumb, title, and default actions.
 *
 * Combines data fetching, form context, and UI layout for editing records. Renders breadcrumb,
 * page title, Show and Delete buttons, and wraps your form components.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/edit/ Edit documentation}
 *
 * @example
 * import { Edit, SimpleForm, BooleanInput, TextInput } from "@/components/admin";
 * import { required } from 'ra-core';
 *
 * export const CustomerEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <TextInput source="first_name" validate={required()} />
 *       <TextInput source="last_name" validate={required()} />
 *       <TextInput source="email" validate={required()} />
 *       <BooleanInput source="has_ordered" />
 *       <TextInput multiline source="notes" />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export const Edit = ({
  actions,
  children,
  className,
  disableBreadcrumb,
  emptyWhileLoading,
  title,
  ...rest
}: EditProps) => (
  <EditBase {...rest}>
    <EditView
      actions={actions}
      className={className}
      disableBreadcrumb={disableBreadcrumb}
      emptyWhileLoading={emptyWhileLoading}
      title={title}
    >
      {children}
    </EditView>
  </EditBase>
);

export interface EditViewProps {
  disableBreadcrumb?: boolean;
  emptyWhileLoading?: boolean;
  title?: ReactNode | string | false;
  actions?: ReactNode | false;
  children?: ReactNode;
  className?: string;
}

/**
 * The view component for Edit pages with layout and UI.
 *
 * @internal
 */
export const EditView = ({
  disableBreadcrumb,
  emptyWhileLoading,
  title,
  actions,
  className,
  children,
}: EditViewProps) => {
  const context = useEditContext();

  const resource = useResourceContext();
  if (!resource) {
    throw new Error(
      "The EditView component must be used within a ResourceContextProvider",
    );
  }
  const getResourceLabel = useGetResourceLabel();
  const listLabel = getResourceLabel(resource, 2);
  const createPath = useCreatePath();
  const listLink = createPath({
    resource,
    type: "list",
  });

  const getRecordRepresentation = useGetRecordRepresentation(resource);
  const recordRepresentation = getRecordRepresentation(context.record);

  const { hasShow } = useResourceDefinition({ resource });
  const hasDashboard = useHasDashboard();

  if (!context.record && context.isPending && emptyWhileLoading) {
    return null;
  }

  const resolvedActions =
    actions === false
      ? null
      : (actions ?? (
          <div className="flex justify-end items-center gap-2">
            {hasShow ? <ShowButton /> : null}
            <DeleteButton />
          </div>
        ));

  return (
    <>
      {!disableBreadcrumb && (
        <Breadcrumb>
          {hasDashboard && (
            <BreadcrumbItem>
              <Link to="/">
                <Translate i18nKey="ra.page.dashboard">Home</Translate>
              </Link>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem>
            <Link to={listLink}>{listLabel}</Link>
          </BreadcrumbItem>
          <BreadcrumbPage>{recordRepresentation}</BreadcrumbPage>
        </Breadcrumb>
      )}
      <div
        className={cn(
          "flex justify-between items-start flex-wrap gap-2 my-2",
          className,
        )}
      >
        <h2 className="text-2xl font-bold tracking-tight">
          {title !== undefined ? title : context.defaultTitle}
        </h2>
        {resolvedActions}
      </div>
      <div className="my-2">{context.record ? children : null}</div>
    </>
  );
};
