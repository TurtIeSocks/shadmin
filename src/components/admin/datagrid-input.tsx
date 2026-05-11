import type { ReactElement, ReactNode } from "react";
import { useCallback, useMemo } from "react";
import type {
  ChoicesProps,
  Identifier,
  InputProps,
  ListControllerResult,
  RaRecord,
} from "ra-core";
import {
  ListContextProvider,
  useChoicesContext,
  useInput,
} from "ra-core";

import { cn } from "@/lib/utils";
import { DataTable } from "@/components/admin/data-table";
import { InputHelperText } from "@/components/admin/input-helper-text";

export type DatagridInputProps = Omit<
  InputProps,
  "fullWidth" | "readOnly" | "disabled" | "source"
> &
  Omit<ChoicesProps, "disableValue"> & {
    children?: ReactNode;
    /**
     * Optional filters. **Currently unimplemented** in this port — see the
     * `@experimental` note in the JSDoc above the component.
     */
    filters?: ReactElement | ReactElement[];
    /**
     * Optional pagination element rendered below the table. **Currently
     * unimplemented** in this port — pass your own component or omit.
     */
    pagination?: ReactElement | false;
    className?: string;
    label?: ReactNode;
    helperText?: ReactNode;
    source?: string;
    resource?: string;
    reference?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    choices?: any[];
  };

/**
 * Form input that displays a list of records and lets the user select multiple
 * rows via row checkboxes. The form value is an array of selected record ids.
 *
 * Typically used as a child of `<ReferenceArrayInput>`, where it gets its
 * choices from the choices context. Can also be used directly with a `choices`
 * prop for static data.
 *
 * @experimental Upstream `<DatagridInput>` is marked WIP. This simplified port
 * supports row selection but **does not** yet integrate:
 * - `filters` (FilterContext / FilterForm / FilterButton)
 * - `pagination` (pass your own component or omit)
 * - the create-suggestion flow (`SupportCreateSuggestionOptions`)
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/datagridinput/ DatagridInput documentation}
 *
 * @example
 * import { DatagridInput, ReferenceArrayInput, TextField } from '@/components/admin';
 *
 * const TeamEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <ReferenceArrayInput source="members" reference="users">
 *         <DatagridInput>
 *           <DataTable.Col source="firstName" />
 *           <DataTable.Col source="lastName" />
 *         </DatagridInput>
 *       </ReferenceArrayInput>
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export const DatagridInput = <RecordType extends RaRecord = RaRecord>(
  props: DatagridInputProps,
) => {
  const {
    children,
    choices,
    className,
    filters: _filters,
    pagination,
    source: sourceProp,
    resource: resourceProp,
    helperText,
    label: _label,
    reference: _reference,
    ...rest
  } = props;

  const {
    availableChoices,
    error: fetchError,
    source,
    ...choicesContext
  } = useChoicesContext({
    choices,
    resource: resourceProp,
    source: sourceProp,
  });

  const { field, fieldState } = useInput({
    ...rest,
    source: source ?? sourceProp ?? "",
  });

  const fieldValue = useMemo<Identifier[]>(
    () => (Array.isArray(field.value) ? field.value : []),
    [field.value],
  );

  const onSelect = useCallback(
    (ids: Identifier[]) => {
      field.onChange(ids);
    },
    [field],
  );

  const onToggleItem = useCallback(
    (id: Identifier) => {
      if (fieldValue.includes(id)) {
        field.onChange(fieldValue.filter((item) => item !== id));
      } else {
        field.onChange([...fieldValue, id]);
      }
    },
    [field, fieldValue],
  );

  const onUnselectItems = useCallback(() => {
    field.onChange([]);
  }, [field]);

  const onSelectAll = useCallback(() => {
    if (!availableChoices) return;
    field.onChange(availableChoices.map((choice) => choice.id));
  }, [availableChoices, field]);

  const listContext = useMemo(
    () => ({
      ...choicesContext,
      data: availableChoices,
      total: availableChoices?.length,
      meta: undefined,
      error: null,
      onSelect,
      onSelectAll,
      onToggleItem,
      onUnselectItems,
      selectedIds: fieldValue,
      resource: resourceProp ?? choicesContext.resource,
    }),
    [
      availableChoices,
      choicesContext,
      fieldValue,
      onSelect,
      onSelectAll,
      onToggleItem,
      onUnselectItems,
      resourceProp,
    ],
  );

  return (
    <div
      className={cn("ra-input", source ? `ra-input-${source}` : undefined, className)}
      data-slot="datagrid-input"
    >
      <ListContextProvider value={listContext as unknown as ListControllerResult}>
        {!fieldState.error && !fetchError && (
          <>
            <DataTable<RecordType>
              bulkActionButtons={false}
              // Pass an empty fragment so `hasBulkActions` becomes `true`
              // (which enables the row checkbox column) while avoiding the
              // default bulk-actions toolbar (delete/export), which would be
              // out of place inside a form input.
              bulkActionsToolbar={<></>}
            >
              {children}
            </DataTable>
            {pagination !== false && pagination ? pagination : null}
          </>
        )}
        <InputHelperText
          helperText={
            fieldState.error?.message ?? fetchError?.message ?? helperText
          }
        />
      </ListContextProvider>
    </div>
  );
};
