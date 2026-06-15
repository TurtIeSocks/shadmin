import { Children, useState } from "react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useListContext, useResourceContext, useUpdateMany } from "ra-core";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Multi-record side-panel form. Renders a button that opens a right-side
 * `<Sheet>` containing the supplied form children. On submit, applies the
 * touched-fields diff to every record in `useListContext().selectedIds` via
 * `useUpdateMany`.
 *
 * Reads `form.formState.dirtyFields` to compute the diff — only fields the
 * user actually touched are passed to `useUpdateMany`. Untouched fields are
 * preserved on each record.
 *
 * @see {@link https://shadmin.turtlesocks.dev/docs/bulk-edit-drawer BulkEditDrawer documentation}
 *
 * @example
 * import { BulkEditDrawer, NumberInput, SelectInput } from '@/components/admin';
 *
 * const BulkEditCategories = () => (
 *   <BulkEditDrawer label="Edit selected">
 *     <SelectInput source="category" choices={CATEGORY_CHOICES} />
 *     <NumberInput source="price" />
 *   </BulkEditDrawer>
 * );
 */
function BulkEditDrawer(props: BulkEditDrawerProps) {
  const {
    children,
    label = "Edit selected",
    title = label,
    disabled,
    side = "right",
    onSuccess,
  } = props;
  const resource = useResourceContext();
  const { selectedIds, onUnselectItems } = useListContext();
  const [open, setOpen] = useState(false);
  const form = useForm({ defaultValues: {}, mode: "onBlur" });
  const [updateMany, { isPending }] = useUpdateMany();

  const handleSubmit = form.handleSubmit(async (values) => {
    const dirty = form.formState.dirtyFields;
    const diff = Object.fromEntries(
      Object.keys(dirty).map((k) => [
        k,
        (values as Record<string, unknown>)[k],
      ]),
    );
    if (Object.keys(diff).length === 0) {
      setOpen(false);
      return;
    }
    await updateMany(resource, { ids: selectedIds, data: diff });
    onSuccess?.(diff, selectedIds);
    onUnselectItems?.();
    setOpen(false);
    form.reset({});
  });

  const noSelection = !selectedIds || selectedIds.length === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          data-bulk-edit-trigger
          variant="outline"
          disabled={disabled || noSelection}
        >
          {label}
          {!noSelection && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({selectedIds.length})
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Apply changes to {selectedIds?.length ?? 0} selected record
            {selectedIds?.length === 1 ? "" : "s"}. Only fields you change will
            be updated.
          </SheetDescription>
        </SheetHeader>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4">
            {Children.map(children, (child) => child)}
            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Apply to {selectedIds?.length ?? 0}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

interface BulkEditDrawerProps {
  /** Form inputs to render inside the sheet. */
  children: ReactNode;
  /** Trigger button label. Defaults to `"Edit selected"`. */
  label?: ReactNode;
  /** Sheet header title. Defaults to `label`. */
  title?: ReactNode;
  /** Disable the trigger regardless of selection. */
  disabled?: boolean;
  /** Sheet side. Default `"right"`. */
  side?: "right" | "bottom" | "left" | "top";
  /** Side-effect after successful updateMany. */
  onSuccess?: (
    diff: Record<string, unknown>,
    ids: readonly (string | number)[],
  ) => void;
}

export { BulkEditDrawer, type BulkEditDrawerProps };
